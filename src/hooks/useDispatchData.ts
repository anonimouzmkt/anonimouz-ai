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
      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("admin_users")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      return { user, isAdmin: profile?.admin_users === true };
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
      const { user, isAdmin } = await fetchUserData();
      const userId = selectedUserId || user?.id;
      
      if (!userId) return null;
      if (selectedUserId && !isAdmin) return null;

      const { data, error } = await supabase
        .from('dispatch_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as DispatchResult | null;
    },
    retry: false,
    refetchInterval: 1000,
  });

  const {
    data: lastFiveDispatches,
    refetch: refetchChart,
    isLoading: isLoadingChart,
    error: chartError
  } = useQuery({
    queryKey: ['lastFiveDispatches', selectedUserId],
    queryFn: async () => {
      const { user, isAdmin } = await fetchUserData();
      const userId = selectedUserId || user?.id;
      
      if (!userId) return [];
      if (selectedUserId && !isAdmin) return [];

      const { data, error } = await supabase
        .from('dispatch_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as DispatchResult[];
    },
    retry: false,
    refetchInterval: 1000,
  });

  const {
    data: latestContactResults,
    refetch: refetchContacts,
    error: contactsError
  } = useQuery({
    queryKey: ['latestContactResults', selectedUserId],
    queryFn: async () => {
      const { user, isAdmin } = await fetchUserData();
      const userId = selectedUserId || user?.id;
      
      if (!userId) return [];
      if (selectedUserId && !isAdmin) return [];

      const { data: latestDispatch, error: dispatchError } = await supabase
        .from('dispatch_results')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dispatchError || !latestDispatch) return [];

      const { data, error } = await supabase
        .from('dispatch_contact_results')
        .select('contact_name, contact_phone, status')
        .eq('dispatch_id', latestDispatch.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContactResult[];
    },
    retry: false,
    refetchInterval: 1000,
  });

  return {
    latestDispatch,
    lastFiveDispatches: lastFiveDispatches || [],
    latestContactResults: latestContactResults || [],
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