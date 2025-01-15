import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateAdminForm } from "@/components/admin/CreateAdminForm";
import { UserList } from "@/components/admin/UserList";

export default function AdminSettings() {
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      return profile;
    }
  });

  if (!currentUser?.role || currentUser.role !== "admin_user") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CreateAdminForm />
      <UserList />
    </div>
  );
}