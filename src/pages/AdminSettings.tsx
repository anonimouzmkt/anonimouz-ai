import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings as SettingsIcon, UserPlus, UserCheck, UserX, Trash2, LogIn } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface Profile {
  id: string;
  email: string;
  role: 'admin_user' | 'user';
  admin_users: boolean;
}

const AdminSettings = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      console.log("Fetching current user...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
      return user;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      console.log("Fetching admin profile...");
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();
      return profile;
    },
    enabled: !!currentUser,
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Fetching all users...");
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      return profiles as Profile[];
    },
    enabled: profile?.role === 'admin_user',
  });

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setLoading(true);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36).slice(-8),
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin_user',
            admin_users: true 
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;

        toast.success("Admin user created successfully! A confirmation email has been sent.");
        setEmail("");
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    } catch (error) {
      console.error("Error creating admin user:", error);
      toast.error("Failed to create admin user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: 'admin_user' | 'user', isAdmin: boolean) => {
    try {
      console.log(`Toggling role for user ${userId} from ${currentRole}, admin status: ${isAdmin}`);
      const newRole = currentRole === 'admin_user' ? 'user' : 'admin_user';
      const newAdminStatus = !isAdmin;
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          admin_users: newAdminStatus 
        })
        .eq('id', userId);

      if (error) {
        console.error("Error updating role:", error);
        throw error;
      }

      toast.success(`User role updated to ${newRole}`);
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role. Please try again.");
    }
  };

  const handleLoginAs = async (userId: string) => {
    try {
      setImpersonating(userId);
      console.log("Logging in as user:", userId);
      
      // First, get the user's email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (userError || !userData?.email) {
        throw new Error("Could not find user email");
      }

      // Sign out current user
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      // Generate a magic link for the impersonated user
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: userData.email,
      });

      if (signInError) throw signInError;
      
      toast.success("Magic link sent to user's email");
    } catch (error) {
      console.error("Error logging in as user:", error);
      toast.error("Failed to login as user. Please try again.");
    } finally {
      setImpersonating(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      console.log("Deleting user and related data:", userId);
      
      // Delete WhatsApp instances
      const { error: instancesError } = await supabase
        .from('whatsapp_instances')
        .delete()
        .eq('user_id', userId);

      if (instancesError) {
        console.error("Error deleting WhatsApp instances:", instancesError);
        throw instancesError;
      }

      // Delete dispatch results (this will cascade to dispatch_contact_results)
      const { error: dispatchError } = await supabase
        .from('dispatch_results')
        .delete()
        .eq('user_id', userId);

      if (dispatchError) {
        console.error("Error deleting dispatch results:", dispatchError);
        throw dispatchError;
      }

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error("Error deleting profile:", profileError);
        throw profileError;
      }

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        console.error("Error deleting auth user:", authError);
        throw authError;
      }

      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user. Please try again.");
    }
  };

  // Only render if the current user is an admin
  if (!profile || profile.role !== 'admin_user') {
    return null;
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
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

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage user roles and permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoginAs(user.id)}
                        disabled={user.id === currentUser?.id || impersonating === user.id}
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        {impersonating === user.id ? 'Switching...' : 'Login as'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleRole(user.id, user.role, user.admin_users)}
                        disabled={user.id === currentUser?.id}
                      >
                        {user.admin_users ? (
                          <UserX className="w-4 h-4 mr-2" />
                        ) : (
                          <UserCheck className="w-4 h-4 mr-2" />
                        )}
                        {user.admin_users ? 'Remove Admin' : 'Make Admin'}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={user.id === currentUser?.id}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user
                              account and all associated data including WhatsApp instances and dispatch history.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;