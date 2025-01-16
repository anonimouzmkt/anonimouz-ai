import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

export function UserList() {
  const queryClient = useQueryClient();

  // Primeiro buscar o perfil do usuário atual para verificar se é admin
  const { data: currentUserProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      console.log("Fetching current user profile...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found");
        throw new Error("No user found");
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching current user profile:", error);
        throw error;
      }

      console.log("Current user profile:", profile);
      return profile;
    },
  });

  // Depois buscar a lista de usuários apenas se for admin
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Fetching all users...");
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("email");

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("Erro ao carregar usuários");
        throw error;
      }

      console.log("Fetched users:", profiles);
      return profiles;
    },
    enabled: currentUserProfile?.role === "admin_user",
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário deletado com sucesso");
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      toast.error("Falha ao deletar usuário");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Papel do usuário atualizado com sucesso");
    },
    onError: (error) => {
      console.error("Error updating user role:", error);
      toast.error("Falha ao atualizar papel do usuário");
    },
  });

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Tem certeza que deseja deletar este usuário?")) {
      await deleteUserMutation.mutate(userId);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    await updateRoleMutation.mutate({ userId, newRole });
  };

  // Verificar se o usuário atual é admin
  if (!currentUserProfile?.role || currentUserProfile.role !== "admin_user") {
    return (
      <div className="p-4 text-center text-red-500">
        Você não tem permissão para acessar esta página.
      </div>
    );
  }

  if (isLoadingProfile || isLoadingUsers) {
    return (
      <div className="flex items-center justify-center h-24">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Lista de Usuários</h2>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(value: UserRole) => handleRoleChange(user.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Selecione o papel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin_user">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}