import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Play, Database } from "lucide-react";
import { toast } from "sonner";

export default function SQLEditor() {
  const [query, setQuery] = useState("SELECT * FROM market_prices LIMIT 10;");
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = async () => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setColumns([]);

    try {
      const { data, error: queryError } = await supabase.rpc('execute_sql', {
        query_text: query
      });

      if (queryError) {
        setError(queryError.message);
        toast.error("Query failed: " + queryError.message);
        return;
      }

      if (data && data[0]?.result) {
        const parsedData = data[0].result as any[];
        if (parsedData && parsedData.length > 0) {
          setColumns(Object.keys(parsedData[0]));
          setResults(parsedData);
          toast.success(`Query executed successfully. ${parsedData.length} rows returned.`);
        } else {
          toast.success("Query executed successfully. No rows returned.");
        }
      } else {
        toast.success("Query executed successfully. No rows returned.");
      }
    } catch (err: any) {
      setError(err.message);
      toast.error("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Database className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">SQL Editor</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Query Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your SQL query here..."
            className="font-mono min-h-[200px]"
          />
          <Button 
            onClick={executeQuery} 
            disabled={isLoading || !query.trim()}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Execute Query
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results ({results.length} rows)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col} className="font-semibold">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((row, idx) => (
                    <TableRow key={idx}>
                      {columns.map((col) => (
                        <TableCell key={col} className="font-mono text-sm">
                          {row[col] !== null ? String(row[col]) : <span className="text-muted-foreground">NULL</span>}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
