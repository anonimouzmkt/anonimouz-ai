import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSelectedUser } from "@/components/sidebar/SidebarContext";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  email: string;
  role: string;
}

export const UserList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { setSelectedUserId } = useSelectedUser();

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

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as User[];
    }
  });

  const handleLoginAs = async (userId: string) => {
    try {
      console.log("Switching to user:", userId);
      setSelectedUserId(userId);
    } catch (error) {
      console.error("Error switching user:", error);
      toast.error("Failed to switch user account");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) throw error;

      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === "admin_user" ? "user" : "admin_user";
      
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`User ${newRole === "admin_user" ? "promoted to" : "removed from"} admin`);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast.error("Failed to update user role");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("userManagement")}</CardTitle>
        <CardDescription>{t("manageUsers")}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : (
          <div className="space-y-4">
            {users?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("role")}: {user.role}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoginAs(user.id)}
                    disabled={user.id === currentUser?.id}
                  >
                    Login as
                  </Button>
                  
                  {user.id !== currentUser?.id && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAdmin(user.id, user.role)}
                      >
                        {user.role === "admin_user" ? t("removeAdmin") : t("makeAdmin")}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            {t("delete")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("deleteConfirmation")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("deleteWarning")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t("delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};