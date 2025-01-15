import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateAdminForm } from "@/components/admin/CreateAdminForm";
import { UserList } from "@/components/admin/UserList";
import { Loader2 } from "lucide-react";

export default function AdminSettings() {
  const { data: currentUser, isLoading, error } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      console.log("Fetching current user for admin settings");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user found");
        throw new Error("No user found");
      }
      
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      console.log("Current user profile:", profile);
      return profile;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Error loading user data. Please try again.</p>
      </div>
    );
  }

  if (!currentUser?.role || currentUser.role !== "admin_user") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
      <CreateAdminForm />
      <UserList />
    </div>
  );
}