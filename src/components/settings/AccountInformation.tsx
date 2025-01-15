import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AccountInformationProps {
  email: string;
  uniqueId: string;
}

export const AccountInformation = ({ email, uniqueId }: AccountInformationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Account Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Email</label>
          <Input value={email || ''} readOnly className="bg-muted/50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Unique ID</label>
          <Input value={uniqueId || ''} readOnly className="bg-muted/50 font-mono text-sm" />
        </div>
      </CardContent>
    </Card>
  );
};