import { useState, useEffect } from "react";
import { BookOpen, Sparkles, Brain, Settings, X, FileText } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { SearchResults, SearchResult } from "@/components/SearchResults";
import { ContentViewer, ContentData } from "@/components/ContentViewer";
import { ComprehensiveAnalysis } from "@/components/ComprehensiveAnalysis";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchWithJina, readUrlWithJina } from "@/services/jinaService";
import { analyzeContent, AnalysisResult } from "@/services/analysisService";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentContent, setCurrentContent] = useState<ContentData | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [loadingUrl, setLoadingUrl] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [fetchedContents, setFetchedContents] = useState<ContentData[]>([]);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [resultsToAnalyze, setResultsToAnalyze] = useState<number>(5);
  const { toast } = useToast();

  useEffect(() => {
    // Check for previously saved API key or use environment variable
    const savedApiKey = localStorage.getItem('openai_api_key') || import.meta.env.VITE_OPENAI_API_KEY;
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      // Show API key input if no key is found
      setShowApiKeyInput(true);
    }
  }, []);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setHasSearched(true);
    setCurrentQuery(query);
    setFetchedContents([]); // Reset collected content for new search
    try {
      const results = await searchWithJina(query);
      setSearchResults(results);
      toast({
        title: "Search completed",
        description: `Found ${results.length} results for "${query}"`,
      });
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReadContent = async (url: string, title: string) => {
    setIsLoadingContent(true);
    setLoadingUrl(url);
    try {
      const content = await readUrlWithJina(url);
      setCurrentContent(content);
      
      // Add to fetched contents for comprehensive analysis
      setFetchedContents(prev => {
        const exists = prev.some(c => c.url === content.url);
        if (!exists) {
          return [...prev, content];
        }
        return prev;
      });
      
      toast({
        title: "Content loaded",
        description: `Successfully loaded "${title}"`,
      });
    } catch (error) {
      console.error("Failed to read content:", error);
      toast({
        title: "Failed to load content",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoadingContent(false);
      setLoadingUrl("");
    }
  };

  const handleComprehensiveAnalysis = async () => {
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    if (fetchedContents.length === 0) {
      toast({
        title: "No content to analyze",
        description: "Please read some articles first before generating comprehensive analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log('Starting comprehensive analysis with:', {
        contentCount: fetchedContents.length,
        query: currentQuery,
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length
      });

      // Log the first few characters of the API key for debugging (safely)
      console.log('API key check:', apiKey ? `${apiKey.substring(0, 7)}...` : 'No API key');

      const analysis = await analyzeContent(fetchedContents, currentQuery);
      setAnalysisResult(analysis);
      setShowAnalysisModal(true);
      toast({
        title: "Analysis completed",
        description: `Generated comprehensive analysis from ${fetchedContents.length} sources`,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Error details:", {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      
      toast({
        title: "Analysis Failed",
        description: errorMessage.length > 100 ? errorMessage.substring(0, 100) + '...' : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFetchAllAndAnalyze = async () => {
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    if (searchResults.length === 0) {
      toast({
        title: "No search results",
        description: "Please search for a topic first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    const allContents: ContentData[] = [];
    
    try {
      // Fetch content from selected number of search results
      const resultsToFetch = Math.min(resultsToAnalyze, searchResults.length);
      console.log(`Fetching content from ${resultsToFetch} search results`);
      
      for (let i = 0; i < resultsToFetch; i++) {
        const result = searchResults[i];
        try {
          console.log(`Fetching content ${i + 1}/${resultsToFetch}: ${result.title}`);
          const content = await readUrlWithJina(result.url);
          allContents.push(content);
          
          // Update progress
          toast({
            title: `Fetching content ${i + 1}/${resultsToFetch}`,
            description: `Reading: ${result.title.substring(0, 50)}...`,
          });
        } catch (error) {
          console.error(`Failed to fetch ${result.url}:`, error);
          // Continue with other URLs even if one fails
        }
      }

      if (allContents.length === 0) {
        throw new Error("Failed to fetch any content from the search results");
      }

      console.log(`Successfully fetched ${allContents.length} articles, starting analysis`);
      console.log('Analysis parameters:', {
        contentCount: allContents.length,
        query: currentQuery,
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length
      });

      // Update fetched contents
      setFetchedContents(allContents);

      // Generate comprehensive analysis
      const analysis = await analyzeContent(allContents, currentQuery);
      setAnalysisResult(analysis);
      setShowAnalysisModal(true);
      
      toast({
        title: "Analysis completed",
        description: `Generated comprehensive analysis from ${allContents.length} sources`,
      });
    } catch (error) {
      console.error("Bulk analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Error details:", {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      
      toast({
        title: "Analysis Failed",
        description: errorMessage.length > 100 ? errorMessage.substring(0, 100) + '...' : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCloseContent = () => {
    setCurrentContent(null);
  };

  const handleApiKeySet = (newApiKey: string) => {
    setApiKey(newApiKey);
    setShowApiKeyInput(false);
    toast({
      title: "API key saved",
      description: "You can now generate comprehensive analysis",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="avengers-header sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-avengers-gold" />
              <Sparkles className="h-4 w-4 text-avengers-red" />
            </div>
            <h1 className="text-xl font-bold avengers-title">
              DEEP RESEARCH 
            </h1>
            <span className="text-sm avengers-subtitle hidden sm:inline">
              AI-powered research assistant
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold avengers-title mb-3">
              ASSEMBLE YOUR RESEARCH LIKE THE AVENGERS
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enter keywords or topics to discover relevant sources and dive deep into comprehensive content analysis. The power of knowledge awaits.
            </p>
          </div>
          
          <SearchBar onSearch={handleSearch} isLoading={isSearching} />
        </div>

        {/* Comprehensive Analysis Section */}
        {fetchedContents.length > 0 && (
          <div className="mb-8">
            <Card className="avengers-card border-2 border-avengers-gold/20 bg-gradient-to-r from-avengers-red/5 to-avengers-gold/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 avengers-title">
                  <Brain className="h-5 w-5" />
                  COMPREHENSIVE ANALYSIS
                  <Badge variant="secondary" className="ml-2 bg-avengers-gold text-black">
                    {fetchedContents.length} Sources Ready
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisResult && (
                  <div className="p-4 bg-avengers-gold/5 rounded-lg border border-avengers-gold/20 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-avengers-gold">Latest Analysis Available</p>
                        <p className="text-xs text-muted-foreground">
                          Generated from {analysisResult.sources.length} sources • {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAnalysisModal(true)}
                        className="border-avengers-gold text-avengers-gold hover:bg-avengers-gold/10"
                      >
                        <FileText className="mr-2 h-3 w-3" />
                        View Analysis
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">
                    Generate a detailed research report analyzing all fetched content:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {fetchedContents.map((content, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {content.title.substring(0, 50)}...
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleComprehensiveAnalysis}
                    disabled={isAnalyzing}
                    className="avengers-button"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin h-4 w-4 border border-current border-t-transparent rounded-full mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Generate Analysis
                      </>
                    )}
                  </Button>
                  
                  {analysisResult && !isAnalyzing && (
                    <Button
                      variant="outline"
                      onClick={() => setShowAnalysisModal(true)}
                      className="border-avengers-gold text-avengers-gold hover:bg-avengers-gold/10"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Last Analysis
                    </Button>
                  )}
                  
                  {!apiKey && (
                    <Button
                      variant="outline"
                      onClick={() => setShowApiKeyInput(true)}
                      className="border-avengers-red text-avengers-red hover:bg-avengers-red/10"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Setup API Key
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Section */}
        {hasSearched && (
          <div className="mb-8">
            {isSearching ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-3 text-muted-foreground">
                  <div className="animate-spin h-5 w-5 border border-current border-t-transparent rounded-full" />
                  <span className="text-lg">Searching the web...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    Search Results ({searchResults.length})
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="results-count" className="text-sm">
                        Analyze:
                      </Label>
                      <Input
                        id="results-count"
                        type="number"
                        min="1"
                        max={Math.min(10, searchResults.length)}
                        value={resultsToAnalyze}
                        onChange={(e) => setResultsToAnalyze(Math.max(1, Math.min(10, parseInt(e.target.value) || 5)))}
                        className="w-16 h-8 text-center"
                      />
                      <span className="text-sm text-muted-foreground">
                        of {searchResults.length} results
                      </span>
                    </div>
                    <Button
                      onClick={handleFetchAllAndAnalyze}
                      disabled={isAnalyzing}
                      className="avengers-button"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin h-4 w-4 border border-current border-t-transparent rounded-full mr-2" />
                          Fetching & Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="mr-2 h-4 w-4" />
                          Fetch & Analyze
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <SearchResults
                  results={searchResults}
                  onReadContent={handleReadContent}
                  isLoadingContent={isLoadingContent}
                  loadingUrl={loadingUrl}
                />
              </>
            )}
          </div>
        )}

        {/* Welcome State */}
        {!hasSearched && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <BookOpen className="h-16 w-16 text-avengers-gold/30" />
                  <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-avengers-red" />
                </div>
              </div>
              <h3 className="text-xl font-semibold avengers-title">
                START YOUR HEROIC RESEARCH
              </h3>
              <p className="text-muted-foreground">
                Use the search bar above to explore topics like "machine learning", "climate change", or any subject you're curious about. The power of knowledge awaits.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Avengers Characters Moving Animation */}
      <div className="avengers-characters">
        <div className="character-container">
          <img src="/Spider Man.jpeg" alt="Spider-Man" />
        </div>
        <div className="character-container">
          <img src="/Black Panther.jpeg" alt="Black Panther" />
        </div>
        <div className="character-container">
          <img src="/Hulk (1).jpeg" alt="Hulk" />
        </div>
        <div className="character-container">
          <img src="/Groot.jpeg" alt="Groot" />
        </div>
        <div className="character-container">
          <img src="/Loki 🐸.jpeg" alt="Loki" />
        </div>
        <div className="character-container">
          <img src="/Rocket Guardians Of The Galaxy.jpeg" alt="Rocket" />
        </div>
        <div className="character-container">
          <img src="/download (11).jpeg" alt="Avenger" />
        </div>
        <div className="character-container">
          <img src="/download (13).jpeg" alt="Avenger" />
        </div>
        <div className="character-container">
          <img src="/download (14).jpeg" alt="Avenger" />
        </div>
        <div className="character-container">
          <img src="/download (15).jpeg" alt="Avenger" />
        </div>
      </div>

      {/* Content Viewer Modal */}
      <ContentViewer
        content={currentContent}
        onClose={handleCloseContent}
      />

      {/* API Key Input Modal */}
      {showApiKeyInput && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="relative">
            <ApiKeyInput
              onApiKeySet={handleApiKeySet}
              currentApiKey={apiKey}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowApiKeyInput(false)}
              className="absolute -top-2 -right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Comprehensive Analysis Modal */}
      <ComprehensiveAnalysis
        analysis={showAnalysisModal ? analysisResult : null}
        topic={currentQuery}
        onClose={() => setShowAnalysisModal(false)}
      />
    </div>
  );
};

export default Index;