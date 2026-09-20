import { ContentData } from "@/components/ContentViewer";

export interface AnalysisResult {
  summary: string;
  keyFindings: string[];
  detailedAnalysis: string;
  sources: string[];
  recommendations: string[];
}

export async function analyzeContent(contents: ContentData[], topic: string): Promise<AnalysisResult> {
  // Try to get API key from localStorage first, then from environment variable
  const apiKey = localStorage.getItem('openai_api_key') || import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please set your API key first or add it to your .env file.');
  }

  // Validate inputs
  if (!contents || contents.length === 0) {
    throw new Error('No content provided for analysis.');
  }

  if (!topic || topic.trim().length === 0) {
    throw new Error('No topic provided for analysis.');
  }

  // Validate that contents have actual content
  const validContents = contents.filter(content => 
    content.content && content.content.trim().length > 50
  );

  if (validContents.length === 0) {
    throw new Error('No valid content found. Content might be too short or empty.');
  }

  if (validContents.length < contents.length) {
    console.warn(`Using ${validContents.length} out of ${contents.length} content pieces due to insufficient content`);
  }

  console.log('Starting analysis with:', { 
    originalContentCount: contents.length, 
    validContentCount: validContents.length, 
    topic 
  });

  try {
    // Prepare the content for analysis with length limits
    const contentText = validContents.map((content, index) => {
      // Limit content length to prevent token overflow
      const truncatedContent = content.content.length > 1500 
        ? content.content.substring(0, 1500) + '...[truncated]'
        : content.content;
      
      return `
Source ${index + 1}:
Title: ${content.title}
URL: ${content.url}
Published: ${content.publishedTime || 'Not specified'}

Content:
${truncatedContent}

---
    `;
    }).join('\n');

    // Create a shorter, more focused prompt
    const prompt = `You are an expert research analyst and technical writer. Create a comprehensive, well-written research article on "${topic}" using the provided sources. Write in a professional, engaging, and narrative style that flows naturally.

Research Sources:
${contentText}

Instructions:
1. Write a comprehensive analysis article of 2000-2500 words in a flowing, narrative style
2. Structure it with clear sections and headings using markdown
3. Include specific references to the sources naturally within the text
4. Provide actionable insights and recommendations
5. Use professional but accessible language with smooth transitions between sections
6. Write as a cohesive article, not as bullet points or fragmented sections
7. Include relevant examples and context to support your analysis
8. Ensure each paragraph flows naturally into the next
9. DO NOT use numbered lists or bullet points in the main content - write in flowing prose
10. Create a clean table of contents without markdown syntax

Format your response as a complete markdown article with the following structure:

# ${topic}: A Comprehensive Analysis

## Table of Contents
- Executive Summary
- Introduction  
- Current Landscape
- Key Developments
- Detailed Analysis
- Future Implications
- Strategic Recommendations
- Conclusion
- References

## Executive Summary

Write a compelling 200-250 word overview that captures the essence of your analysis. Focus on the most significant insights and their implications. This should read like an engaging introduction that makes the reader want to continue.

## Introduction

Provide context and background about the topic in 2-3 paragraphs. Explain why this topic is important and what the reader can expect to learn. Set the stage for your analysis with engaging prose that flows naturally.

## Current Landscape

Describe the current state of the topic based on your sources in 3-4 paragraphs. What are the key players, trends, and challenges? Use narrative storytelling to paint a clear picture. Write in flowing paragraphs, not bullet points.

## Key Developments

Highlight the most important developments, innovations, or changes in this field in 3-4 paragraphs. Explain their significance and how they're shaping the landscape. Use storytelling to make this engaging.

## Detailed Analysis

Provide your in-depth analysis in 5-6 paragraphs with subsections as needed. Each paragraph should be substantial (4-6 sentences) and flow naturally into the next. Use examples, case studies, and specific details from your sources. Write in narrative form - no numbered lists or bullet points.

### [Create relevant subsection titles as needed]

Continue with detailed analysis in narrative form. Each subsection should contain 2-3 substantial paragraphs.

## Future Implications

Discuss what these developments mean for the future in 3-4 paragraphs. What trends are emerging? What challenges and opportunities lie ahead? Write in flowing narrative style.

## Strategic Recommendations

Provide specific, actionable recommendations in 3-4 paragraphs. These should be practical and well-reasoned. Write recommendations in paragraph form, not as a list.

## Conclusion

Summarize the key takeaways in 2-3 paragraphs and reinforce the main message of your article. End with a thought-provoking statement about the future.

## References

List all sources used in your analysis in a clean format.

CRITICAL WRITING GUIDELINES:
- Write ONLY in flowing paragraphs - never use bullet points, numbered lists, or fragmented text
- Each paragraph should be 4-6 sentences long
- Use smooth transitions between paragraphs and sections
- Reference sources naturally within sentences (e.g., "According to recent research..." or "Industry experts suggest...")
- Write in a conversational yet professional tone
- Use storytelling techniques to make complex topics accessible
- Make each section build logically on the previous one
- Avoid any numbered formatting within the content - write everything in prose form
- DO NOT repeat section headers or add extra headers at the end
- End cleanly with the References section - no additional text after that`;

    console.log('Sending request to OpenAI...');
    console.log('Prompt length:', prompt.length);
    console.log('API key format check:', apiKey.startsWith('sk-') ? 'Valid format' : 'Invalid format');
    
    const requestBody = {
      model: 'gpt-4o-mini', // Using gpt-4o-mini for better reliability
      messages: [
        {
          role: 'system',
          content: 'You are an expert research analyst who creates comprehensive, well-structured research articles by analyzing multiple sources.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 3000, // Reduced from 4000 to prevent token limit issues
      temperature: 0.3,
    };

    console.log('Request body size:', JSON.stringify(requestBody).length);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      console.error('OpenAI API Error:', errorData);
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else if (response.status === 400) {
        throw new Error('Request too large. Please try with fewer sources.');
      } else {
        throw new Error(`Analysis failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
    }

    const data = await response.json();
    console.log('OpenAI response data:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    const analysisText = data.choices[0].message.content;
    console.log('Analysis completed successfully');

    // Extract key findings and recommendations from the analysis
    const keyFindings = extractKeyFindings(analysisText);
    const recommendations = extractRecommendations(analysisText);

    return {
      summary: extractSummary(analysisText),
      keyFindings,
      detailedAnalysis: analysisText,
      sources: validContents.map(c => `${c.title} - ${c.url}`),
      recommendations
    };
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('fetch') || error.name === 'TypeError') {
        throw new Error('Network error: Could not connect to OpenAI API. Please check your internet connection.');
      } else if (error.message.includes('API key')) {
        throw new Error('API key error: ' + error.message);
      } else {
        throw new Error('Analysis error: ' + error.message);
      }
    }
    
    throw new Error('Failed to analyze content. Please try again.');
  }
}

// Function to validate OpenAI API key
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
}

// Helper function to extract summary from analysis
function extractSummary(text: string): string {
  const lines = text.split('\n');
  let summary = '';
  let inSummary = false;
  let foundTableOfContents = false;
  
  for (const line of lines) {
    // Check for table of contents
    if (line.toLowerCase().includes('table of contents')) {
      foundTableOfContents = true;
      continue;
    }
    
    // Check for executive summary or introduction
    if (line.toLowerCase().includes('executive summary') || 
        line.toLowerCase().includes('## introduction') ||
        (line.toLowerCase().includes('summary') && !line.toLowerCase().includes('table'))) {
      inSummary = true;
      continue;
    }
    
    if (inSummary) {
      // Stop when we hit the next major section
      if (line.startsWith('##') && 
          !line.toLowerCase().includes('summary') && 
          !line.toLowerCase().includes('introduction')) {
        break;
      }
      if (line.trim()) {
        summary += line + '\n';
      }
    }
  }
  
  // If we found a table of contents, include it in the summary
  if (foundTableOfContents) {
    const tocLines = [];
    let inToc = false;
    
    for (const line of lines) {
      if (line.toLowerCase().includes('table of contents')) {
        inToc = true;
        tocLines.push(line);
        continue;
      }
      
      if (inToc) {
        if (line.startsWith('##') && !line.toLowerCase().includes('table of contents')) {
          break;
        }
        if (line.trim()) {
          tocLines.push(line);
        }
      }
    }
    
    const tocText = tocLines.join('\n');
    return tocText + '\n\n' + summary.trim();
  }
  
  return summary.trim() || text.substring(0, 600) + '...';
}

// Helper function to extract key findings
function extractKeyFindings(text: string): string[] {
  const findings: string[] = [];
  const lines = text.split('\n');
  let inFindings = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes('key findings') || line.toLowerCase().includes('main findings')) {
      inFindings = true;
      continue;
    }
    if (inFindings) {
      if (line.startsWith('#') && !line.toLowerCase().includes('finding')) {
        break;
      }
      if (line.trim().match(/^\d+\./) || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        findings.push(line.trim().replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, ''));
      }
    }
  }
  
  return findings.slice(0, 5); // Return max 5 findings
}

// Helper function to extract recommendations
function extractRecommendations(text: string): string[] {
  const recommendations: string[] = [];
  const lines = text.split('\n');
  let inRecommendations = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes('recommendations') || line.toLowerCase().includes('next steps')) {
      inRecommendations = true;
      continue;
    }
    if (inRecommendations) {
      if (line.startsWith('#') && !line.toLowerCase().includes('recommendation')) {
        break;
      }
      if (line.trim().match(/^\d+\./) || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        recommendations.push(line.trim().replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, ''));
      }
    }
  }
  
  return recommendations.slice(0, 5); // Return max 5 recommendations
}