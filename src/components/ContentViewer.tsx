import { useState } from "react";
import { X, ExternalLink, Calendar, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ContentData {
  title: string;
  url: string;
  publishedTime?: string;
  content: string;
}

interface ContentViewerProps {
  content: ContentData | null;
  onClose: () => void;
}

export function ContentViewer({ content, onClose }: ContentViewerProps) {
  const [copied, setCopied] = useState(false);

  if (!content) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  const formatContent = (text: string) => {
    // Convert markdown-style formatting to JSX
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Handle headers
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mb-4 mt-6 text-research-blue">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold mb-3 mt-5 text-research-blue">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-medium mb-2 mt-4 text-research-blue">{line.substring(4)}</h3>;
      }
      
      // Handle empty lines
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // Handle list items
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={index} className="ml-4 mb-1 text-reading-text">
            {line.substring(2)}
          </li>
        );
      }
      
      // Handle numbered lists
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={index} className="ml-4 mb-1 text-reading-text list-decimal">
            {line.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      
      // Regular paragraphs
      return (
        <p key={index} className="mb-3 text-reading-text leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-content-background">
        <CardHeader className="border-b bg-card sticky top-0 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl leading-tight mb-2 text-research-blue">
                {content.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="truncate">{content.url}</span>
                {content.publishedTime && (
                  <>
                    <span>•</span>
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span>{content.publishedTime}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
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
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(content.url, '_blank')}
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                Open
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
          <ScrollArea className="h-[calc(90vh-12rem)] p-6">
            <div className="prose prose-gray max-w-none">
              {formatContent(content.content)}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}