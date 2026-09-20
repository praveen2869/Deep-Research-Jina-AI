import { SearchResult } from "@/components/SearchResults";
import { ContentData } from "@/components/ContentViewer";

const JINA_API_KEY = "jina_704684670cf5478486d24ff9730b9cc3nu7mMxqrLMpP_YdQPfr7q1pVJtOG";

export async function searchWithJina(query: string): Promise<SearchResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`https://s.jina.ai/${encodedQuery}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JINA_API_KEY}`,
        'X-Respond-With': 'no-content'
      }
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`);
    }

    const textData = await response.text();
    console.log('Jina search response:', textData);
    
    // Parse the text response format from Jina
    const results = parseJinaSearchResponse(textData);
    
    return results;
  } catch (error) {
    console.error('Jina search error:', error);
    throw new Error('Failed to search. Please try again.');
  }
}

function parseJinaSearchResponse(textData: string): SearchResult[] {
  const results: SearchResult[] = [];
  const lines = textData.split('\n');
  
  let currentResult: Partial<SearchResult> = {};
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.match(/^\[\d+\] Title: /)) {
      // If we have a previous result, save it
      if (currentResult.title && currentResult.url) {
        results.push({
          title: currentResult.title,
          url: currentResult.url,
          description: currentResult.description || 'No description available',
          date: currentResult.date
        });
      }
      
      // Start new result
      currentResult = {
        title: trimmedLine.replace(/^\[\d+\] Title: /, '')
      };
    } else if (trimmedLine.match(/^\[\d+\] URL Source: /)) {
      currentResult.url = trimmedLine.replace(/^\[\d+\] URL Source: /, '');
    } else if (trimmedLine.match(/^\[\d+\] Description: /)) {
      currentResult.description = trimmedLine.replace(/^\[\d+\] Description: /, '');
    } else if (trimmedLine.match(/^\[\d+\] Date: /)) {
      currentResult.date = trimmedLine.replace(/^\[\d+\] Date: /, '');
    }
  }
  
  // Don't forget the last result
  if (currentResult.title && currentResult.url) {
    results.push({
      title: currentResult.title,
      url: currentResult.url,
      description: currentResult.description || 'No description available',
      date: currentResult.date
    });
  }
  
  return results;
}

export async function readUrlWithJina(url: string): Promise<ContentData> {
  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JINA_API_KEY}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to read URL: ${response.status} ${response.statusText}`);
    }

    const content = await response.text();
    
    // Extract title and metadata from the content
    const lines = content.split('\n');
    let title = 'Untitled';
    let publishedTime = undefined;
    let mainContent = content;

    // Look for title and metadata in the first few lines
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i].trim();
      if (line.startsWith('Title: ')) {
        title = line.substring(7);
      } else if (line.startsWith('Published Time: ')) {
        publishedTime = line.substring(16);
      }
    }

    // Remove metadata lines from content
    const contentLines = lines.filter(line => 
      !line.startsWith('Title: ') && 
      !line.startsWith('URL Source: ') && 
      !line.startsWith('Published Time: ') &&
      !line.startsWith('Markdown Content:')
    );
    
    mainContent = contentLines.join('\n').trim();

    return {
      title,
      url,
      publishedTime,
      content: mainContent
    };
  } catch (error) {
    console.error('Jina read error:', error);
    throw new Error('Failed to read content. Please try again.');
  }
}