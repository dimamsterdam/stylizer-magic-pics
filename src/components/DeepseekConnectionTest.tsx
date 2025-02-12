
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAIProvider } from "@/hooks/use-feature-flags";

interface TestResult {
  step: string;
  success: boolean;
  details: any;
  error?: string;
}

interface TestResponse {
  timestamp: string;
  results: TestResult[];
  allTestsPassed: boolean;
}

export function DeepseekConnectionTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: currentProvider } = useAIProvider();

  const runTest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('test-deepseek-connection');
      if (error) throw error;
      setTestResults(data as TestResponse);
    } catch (err) {
      console.error('Test execution failed:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Provider Connection Test ({currentProvider})</span>
          <Button 
            onClick={runTest} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...</>
            ) : (
              'Run Test'
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {testResults && (
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              Test run at: {new Date(testResults.timestamp).toLocaleString()}
            </div>
            
            {testResults.results.map((result, index) => (
              <div 
                key={index}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-2">
                    {result.success ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    {result.step}
                  </h3>
                  <span className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                    {result.success ? 'Passed' : 'Failed'}
                  </span>
                </div>
                
                {result.error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {result.error}
                  </div>
                )}
                
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
            
            <div className={`mt-4 p-3 rounded-md text-center font-medium ${
              testResults.allTestsPassed 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {testResults.allTestsPassed 
                ? 'All tests passed successfully!' 
                : 'Some tests failed. Please check the details above.'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
