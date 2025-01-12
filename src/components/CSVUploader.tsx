import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  name: string;
  phone: string;
}

export function CSVUploader({ onContactsLoaded }: { onContactsLoaded: (contacts: Contact[]) => void }) {
  const { toast } = useToast();
  const [mapping, setMapping] = useState<{ name: string; phone: string }>({ name: "", phone: "" });
  const [headers, setHeaders] = useState<string[]>([]);
  const [showMapping, setShowMapping] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      if (lines.length > 0) {
        const headers = lines[0].split(",").map(header => header.trim());
        setHeaders(headers);
        setShowMapping(true);
      }
    };
    reader.readAsText(file);
  };

  const handleMapping = () => {
    if (!mapping.name || !mapping.phone) {
      toast({
        title: "Error",
        description: "Please select both name and phone columns",
        variant: "destructive",
      });
      return;
    }

    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (!fileInput?.files?.[0]) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map(header => header.trim());
      
      const nameIndex = headers.indexOf(mapping.name);
      const phoneIndex = headers.indexOf(mapping.phone);

      const contacts: Contact[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(value => value.trim());
        if (values.length > 1) {
          contacts.push({
            name: values[nameIndex],
            phone: values[phoneIndex],
          });
        }
      }

      onContactsLoaded(contacts);
      setShowMapping(false);
      toast({
        title: "Success",
        description: `Loaded ${contacts.length} contacts`,
      });
    };
    reader.readAsText(fileInput.files[0]);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3" />
            <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-muted-foreground">CSV file only</p>
          </div>
          <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
        </label>
      </div>

      {showMapping && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Map CSV Columns</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name Column</label>
                <select 
                  className="w-full bg-muted p-2 rounded-md"
                  value={mapping.name}
                  onChange={(e) => setMapping(prev => ({ ...prev, name: e.target.value }))}
                >
                  <option value="">Select column</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Column</label>
                <select 
                  className="w-full bg-muted p-2 rounded-md"
                  value={mapping.phone}
                  onChange={(e) => setMapping(prev => ({ ...prev, phone: e.target.value }))}
                >
                  <option value="">Select column</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowMapping(false)}>
                Cancel
              </Button>
              <Button onClick={handleMapping}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}