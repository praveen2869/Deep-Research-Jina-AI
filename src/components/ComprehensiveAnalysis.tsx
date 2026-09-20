import { useState } from "react";
import { X, FileText, Lightbulb, Target, ExternalLink, Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnalysisResult } from "@/services/analysisService";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ComprehensiveAnalysisProps {
  analysis: AnalysisResult | null;
  topic: string;
  onClose: () => void;
}

export function ComprehensiveAnalysis({ analysis, topic, onClose }: ComprehensiveAnalysisProps) {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!analysis) return null;

  const formatArticleContent = (content: string) => {
    // Split content into lines and format as JSX
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Handle main headings
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mb-6 mt-8 text-research-blue border-b pb-2">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold mb-4 mt-6 text-research-blue">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-medium mb-3 mt-5 text-research-blue">{line.substring(4)}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={index} className="text-lg font-medium mb-2 mt-4 text-research-blue">{line.substring(5)}</h4>;
      }
      
      // Handle empty lines
      if (line.trim() === '' || line === '---') {
        return <br key={index} />;
      }
      
      // Handle list items
      if (line.match(/^\d+\.\s/)) {
        return (
          <li key={index} className="ml-4 mb-2 text-reading-text list-decimal">
            {line.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={index} className="ml-4 mb-2 text-reading-text list-disc">
            {line.substring(2)}
          </li>
        );
      }
      
      // Regular paragraphs
      if (line.trim()) {
        return (
          <p key={index} className="mb-4 text-reading-text leading-relaxed">
            {line}
          </p>
        );
      }
      
      return null;
    }).filter(Boolean);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(analysis.detailedAnalysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy analysis:', err);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Create a clean version of the content for PDF
      const cleanContent = analysis.detailedAnalysis
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
        .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
        .replace(/`(.*?)`/g, '$1') // Remove code markdown
        .replace(/#{1,6}\s/g, '') // Remove header markdown
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Convert links to text

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      
      // Add title
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      const titleLines = pdf.splitTextToSize(`${topic}: Comprehensive Analysis`, maxWidth);
      pdf.text(titleLines, margin, margin + 10);
      
      let yPosition = margin + 30;
      
      // Add date
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 20;
      
      // Add content
      pdf.setFontSize(11);
      const lines = cleanContent.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        const wrappedLines = pdf.splitTextToSize(line, maxWidth);
        
        // Check if we need a new page for the wrapped lines
        if (yPosition + (wrappedLines.length * 6) > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.text(wrappedLines, margin, yPosition);
        yPosition += wrappedLines.length * 6 + 3;
      }
      
      // Save the PDF
      const fileName = `${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analysis.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] bg-content-background">
        <CardHeader className="border-b bg-card sticky top-0 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl leading-tight mb-2 text-research-blue flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Deep Research Analysis: {topic}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">
                  {analysis.sources.length} Sources Analyzed
                </Badge>
                <Badge variant="secondary">
                  Comprehensive Article
                </Badge>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-3 w-3" />
                    Download PDF
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-3 w-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-3 w-3" />
                    Copy Report
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(90vh-12rem)]">
            <div className="p-6 space-y-8">
              
              {/* Detailed Analysis - Full Article */}
              <section>
                <div className="prose prose-gray max-w-none">
                  <div className="text-reading-text leading-relaxed">
                    {formatArticleContent(analysis.detailedAnalysis)}
                  </div>
                </div>
              </section>

              <Separator />

              {/* Sources */}
              <section>
                <h2 className="text-xl font-semibold mb-4 text-research-blue flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Sources Analyzed
                </h2>
                <div className="grid gap-3">
                  {analysis.sources.map((source, index) => {
                    const [title, url] = source.split(' - ');
                    return (
                      <Card key={index} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-research-blue truncate">
                                {title}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {url}
                              </p>
                            </div>
                            <Badge variant="outline">
                              #{index + 1}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <>
                  <Separator />
                  <section>
                    <h2 className="text-xl font-semibold mb-4 text-research-blue flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Recommendations
                    </h2>
                    <div className="grid gap-3">
                      {analysis.recommendations.map((recommendation, index) => (
                        <Card key={index} className="border-l-4 border-l-research-blue">
                          <CardContent className="p-4">
                            <p className="text-reading-text leading-relaxed">
                              {recommendation}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}