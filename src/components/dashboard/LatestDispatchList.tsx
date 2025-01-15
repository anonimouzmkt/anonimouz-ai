interface DispatchResult {
  contact_name: string;
  contact_phone: string;
  status: string;
}

interface LatestDispatchListProps {
  results: DispatchResult[];
}

export function LatestDispatchList({ results }: LatestDispatchListProps) {
  if (!results || results.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-2">Últimos Disparos</h3>
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {results.map((result, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm"
          >
            <div>
              <span className="font-medium">{result.contact_name}</span>
              <span className="text-muted-foreground ml-2">{result.contact_phone}</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${
              result.status === 'success' 
                ? 'bg-green-100 text-green-700' 
                : result.status === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {result.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}