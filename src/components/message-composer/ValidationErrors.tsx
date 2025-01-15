interface ValidationErrorsProps {
  errors: string[];
}

export function ValidationErrors({ errors }: ValidationErrorsProps) {
  if (!errors.length) return null;

  return (
    <div className="space-y-2">
      {errors.map((error, index) => (
        <p key={index} className="text-destructive text-sm">
          {error}
        </p>
      ))}
    </div>
  );
}