import React, { useState } from "react";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StorageStatus from "@/components/StorageStatus";
import { StorageFactory, getStorageType, isUsingNativeStorage } from "@/lib/storage/index";
import { ErrorHandler, ErrorType, AppError } from "@/lib/errorHandling";
import { AlertCircle, RefreshCw, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/**
 * DevTools page for testing and debugging storage and error handling
 * This page is not linked in the main navigation and is for development purposes only
 */
const DevTools = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{success: boolean; message: string}[]>([]);
  
  // Function to test storage operations
  const testStorage = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      const results: {success: boolean; message: string}[] = [];
      const adapter = StorageFactory.getAdapter();
      
      // Test 1: Save a test object
      try {
        const testData = { id: "test", value: "Test data", timestamp: Date.now() };
        await adapter.saveSettings(testData);
        results.push({ success: true, message: "Successfully saved test data" });
      } catch (error) {
        results.push({ success: false, message: `Failed to save test data: ${error instanceof Error ? error.message : String(error)}` });
      }
      
      // Test 2: Read the test object
      try {
        const testData = await adapter.getSettings();
        if (testData && testData.id === "test") {
          results.push({ success: true, message: `Successfully read test data: ${JSON.stringify(testData)}` });
        } else {
          results.push({ success: false, message: "Test data not found or invalid" });
        }
      } catch (error) {
        results.push({ success: false, message: `Failed to read test data: ${error instanceof Error ? error.message : String(error)}` });
      }
      
      // Test 3: Check storage type
      const storageType = getStorageType();
      results.push({ success: true, message: `Current storage type: ${storageType}` });
      
      setTestResults(results);
    } catch (error) {
      setTestResults([{ success: false, message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to test error handling
  const testErrorHandling = async (errorType: ErrorType) => {
    setIsLoading(true);
    
    try {
      await ErrorHandler.executeWithErrorHandling(async () => {
        // Simulate an error based on the selected type
        switch (errorType) {
          case ErrorType.Storage:
            throw new AppError("Storage test error", ErrorType.Storage);
          case ErrorType.Network:
            throw new AppError("Network test error", ErrorType.Network);
          case ErrorType.UserInput:
            throw new AppError("Please enter a valid email address", ErrorType.UserInput);
          case ErrorType.Application:
            throw new AppError("Application test error", ErrorType.Application);
          default:
            throw new Error("Unknown test error");
        }
      }, "Dev Tools Error Test");
    } catch (error) {
      // Error is already handled by executeWithErrorHandling
      console.log("Error was thrown and handled:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to reset adapter and clear cache
  const resetAdapter = () => {
    StorageFactory.resetAdapter();
    toast.success("Storage adapter reset");
  };
  
  return (
    <Layout>
      <PageTransition>
        <div className="py-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Developer Tools</h1>
            <StorageStatus />
          </div>
          
          <Tabs defaultValue="storage">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="storage">Storage Tests</TabsTrigger>
              <TabsTrigger value="errors">Error Handling</TabsTrigger>
            </TabsList>
            
            <TabsContent value="storage" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Storage Adapter Tests</CardTitle>
                  <CardDescription>
                    Test the storage system functionality
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Current adapter: <Badge>{getStorageType()}</Badge></span>
                    <Button variant="outline" size="sm" onClick={resetAdapter}>
                      Reset Adapter
                    </Button>
                  </div>
                  
                  {testResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h3 className="text-sm font-medium">Test Results</h3>
                      <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                        {testResults.map((result, index) => (
                          <div key={index} className="flex items-start gap-2">
                            {result.success ? (
                              <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                            )}
                            <span className={result.success ? "text-foreground" : "text-red-500"}>
                              {result.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={testStorage} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Running Tests...
                      </>
                    ) : (
                      'Run Storage Tests'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="errors" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Error Handling Tests</CardTitle>
                  <CardDescription>
                    Test the error handling system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p>Click on a button to trigger a specific type of error.</p>
                    <p className="text-muted-foreground mt-1">
                      The error will be handled by the ErrorHandler and displayed to the user.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => testErrorHandling(ErrorType.Storage)} disabled={isLoading}>
                    Test Storage Error
                  </Button>
                  <Button variant="outline" onClick={() => testErrorHandling(ErrorType.Network)} disabled={isLoading}>
                    Test Network Error
                  </Button>
                  <Button variant="outline" onClick={() => testErrorHandling(ErrorType.UserInput)} disabled={isLoading}>
                    Test User Input Error
                  </Button>
                  <Button variant="outline" onClick={() => testErrorHandling(ErrorType.Application)} disabled={isLoading}>
                    Test Application Error
                  </Button>
                  <Button variant="outline" onClick={() => testErrorHandling(ErrorType.Unknown)} disabled={isLoading}>
                    Test Unknown Error
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default DevTools; 