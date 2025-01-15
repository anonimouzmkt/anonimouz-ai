import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateAdminForm } from "@/components/admin/CreateAdminForm";
import { UserList } from "@/components/admin/UserList";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminSettings() {
  const navigate = useNavigate();

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["currentUserProfile"],
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
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    onError: (error) => {
      console.error("Error loading user data:", error);
      toast.error("Error loading user data. Please try again.");
      navigate("/");
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!currentUser?.role || currentUser.role !== "admin_user") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground text-lg">You don't have permission to access this page.</p>
        <button 
          onClick={() => navigate("/")}
          className="text-primary hover:underline"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Create Admin User</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateAdminForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <UserList />
        </CardContent>
      </Card>
    </div>
  );
}