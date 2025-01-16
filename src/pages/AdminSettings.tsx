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
    meta: {
      onError: (error: Error) => {
        console.error("Error loading user data:", error);
        toast.error("Erro ao carregar dados do usuário");
        navigate("/");
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  // Check if user is admin_user
  if (!currentUser?.role || currentUser.role !== "admin_user") {
    toast.error("Você não tem permissão para acessar esta página");
    navigate("/");
    return null;
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