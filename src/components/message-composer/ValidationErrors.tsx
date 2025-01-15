import { Alert, AlertDescription } from "@/components/ui/alert";

interface ValidationErrorsProps {
  errors: string[];
}

export function ValidationErrors({ errors }: ValidationErrorsProps) {
  if (errors.length === 0) return null;
  
  return (
    <Alert variant="destructive">
      <AlertDescription>
        <ul className="list-disc pl-4">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}