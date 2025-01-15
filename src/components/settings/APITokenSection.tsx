import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const APITokenSection = () => {
  const [token, setToken] = useState<string>("");

  // Check if current user is admin and fetch their api_key
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      return profile;
    },
  });

  // Set the token when profile is loaded
  useEffect(() => {
    if (profile?.api_key) {
      setToken(profile.api_key);
    }
  }, [profile]);

  const isAdmin = profile?.role === 'admin_user';

  const handleGenerateToken = async () => {
    try {
      if (!isAdmin) {
        toast.error("Only admin users can generate tokens");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Generate a new UUID for the api_key
      const { data, error } = await supabase
        .from("profiles")
        .update({ api_key: crypto.randomUUID() })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      
      if (data?.api_key) {
        setToken(data.api_key);
        toast.success("Token generated successfully!");
      }
    } catch (error) {
      console.error("Error generating token:", error);
      toast.error("Failed to generate token");
    }
  };

  const handleCopyToken = () => {
    if (!isAdmin) {
      toast.error("Only admin users can copy tokens");
      return;
    }
    navigator.clipboard.writeText(token);
    toast.success("Token copied to clipboard!");
  };

  // If not admin, don't show the section at all
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">API Token</h2>
      <div className="flex gap-2">
        <Input 
          value={token} 
          readOnly 
          type="password"
          placeholder="Generate a token..." 
        />
        <Button onClick={handleGenerateToken}>
          <Key className="w-4 h-4 mr-2" />
          Generate
        </Button>
        {token && (
          <Button variant="outline" onClick={handleCopyToken}>
            <Copy className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};