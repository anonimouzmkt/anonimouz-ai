import { Input } from "@/components/ui/input";

interface AccountInformationProps {
  email: string;
  uniqueId: string;
}

export const AccountInformation = ({ email, uniqueId }: AccountInformationProps) => {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Account Information</h2>
      <div className="space-y-2">
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input value={email || ''} readOnly />
        </div>
        <div>
          <label className="text-sm font-medium">Unique ID</label>
          <Input value={uniqueId || ''} readOnly />
        </div>
      </div>
    </div>
  );
};