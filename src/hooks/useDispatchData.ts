import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DispatchResult {
  id: string;
  success_count: number;
  error_count: number;
  total_contacts: number;
  created_at: string;
  is_ai_dispatch: boolean;
}

export interface ContactResult {
  contact_name: string;
  contact_phone: string;
  status: string;
}

export const useDispatchData = (selectedUserId: string) => {
  const { toast } = useToast();

  const fetchUserData = async () => {
    try {
      console.log("Fetching user data...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Auth error:", authError);
        toast({
          title: "Erro de autenticação",
          description: "Por favor, faça login novamente.",
          variant: "destructive",
        });
        throw authError;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }

      return { user, isAdmin: profile?.role === 'admin_user' };
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  };

  const { 
    data: latestDispatch,
    refetch: refetchLatest,
    isLoading: isLoadingLatest,
    error: latestError
  } = useQuery({
    queryKey: ['latestDispatch', selectedUserId],
    queryFn: async () => {
      console.log("Fetching latest dispatch for user:", selectedUserId);
      const { user, isAdmin } = await fetchUserData();
      const userId = selectedUserId || user?.id;
      
      if (!userId) {
        console.error("No user ID available");
        throw new Error("No user ID available");
      }

      if (selectedUserId && !isAdmin) {
        throw new Error("Unauthorized");
      }

      const { data, error } = await supabase
        .from('dispatch_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching latest dispatch:", error);
        throw error;
      }

      console.log("Latest dispatch data:", data);
      return data as DispatchResult;
    },
    refetchInterval: 3000,
  });

  const {
    data: lastFiveDispatches,
    refetch: refetchChart,
    isLoading: isLoadingChart,
    error: chartError
  } = useQuery({
    queryKey: ['lastFiveDispatches', selectedUserId],
    queryFn: async () => {
      console.log("Fetching last 5 dispatches for user:", selectedUserId);
      const { user, isAdmin } = await fetchUserData();
      const userId = selectedUserId || user?.id;
      
      if (!userId) {
        console.error("No user ID available");
        throw new Error("No user ID available");
      }

      if (selectedUserId && !isAdmin) {
        throw new Error("Unauthorized");
      }

      const { data, error } = await supabase
        .from('dispatch_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching dispatches:", error);
        throw error;
      }

      console.log("Last 5 dispatches data:", data);
      return data as DispatchResult[];
    },
    refetchInterval: 3000,
  });

  const {
    data: latestContactResults,
    refetch: refetchContacts,
    error: contactsError
  } = useQuery({
    queryKey: ['latestContactResults', selectedUserId],
    queryFn: async () => {
      console.log("Fetching latest contact results for user:", selectedUserId);
      const { user, isAdmin } = await fetchUserData();
      const userId = selectedUserId || user?.id;
      
      if (!userId) {
        console.error("No user ID available");
        throw new Error("No user ID available");
      }

      if (selectedUserId && !isAdmin) {
        throw new Error("Unauthorized");
      }

      const { data: latestDispatch, error: dispatchError } = await supabase
        .from('dispatch_results')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (dispatchError) {
        console.error("Error fetching latest dispatch:", dispatchError);
        return [];
      }

      if (!latestDispatch) return [];

      const { data, error } = await supabase
        .from('dispatch_contact_results')
        .select('contact_name, contact_phone, status')
        .eq('dispatch_id', latestDispatch.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching contact results:", error);
        throw error;
      }

      console.log("Latest contact results:", data);
      return data as ContactResult[];
    },
    refetchInterval: 3000,
  });

  return {
    latestDispatch,
    lastFiveDispatches,
    latestContactResults,
    refetchLatest,
    refetchChart,
    refetchContacts,
    isLoadingLatest,
    isLoadingChart,
    latestError,
    chartError,
    contactsError
  };
};