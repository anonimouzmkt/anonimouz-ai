import { useQuery } from "@tanstack/react-query";
import { Settings as SettingsIcon, UserPlus } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AdminSettings = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
      return user;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();
      return profile;
    },
    enabled: !!currentUser,
  });

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setLoading(true);
      
      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36).slice(-8), // Generate a random password
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update the user's profile to set them as an admin
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'admin_user' })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;

        toast.success("Admin user created successfully! A confirmation email has been sent.");
        setEmail("");
      }
    } catch (error) {
      console.error("Error creating admin user:", error);
      toast.error("Failed to create admin user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Only render if the current user is an admin
  if (!profile || profile.role !== 'admin_user') {
    return null;
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Admin Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Master</CardTitle>
            <CardDescription>Create new admin users with full system access.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Admin Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Admin User
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;