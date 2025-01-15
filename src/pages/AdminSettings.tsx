import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Profile } from '@/integrations/supabase/types';

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [impersonating, setImpersonating] = useState<string | null>(null);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data as Profile[];
    }
  });

  const handleLoginAs = async (userId: string) => {
    try {
      setLoading(true);
      setImpersonating(userId);
      console.log("Logging in as user:", userId);

      // Call our edge function to handle the impersonation
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const response = await fetch(`${window.location.origin}/functions/v1/handle-impersonation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ impersonatedUserId: userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to impersonate user');
      }

      const { access_token, refresh_token } = await response.json();

      // Set the new session
      const { error: signInError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (signInError) throw signInError;

      // Redirect to the dashboard
      window.location.href = '/';
      
      toast({
        title: "Success",
        description: "Successfully logged in as user",
        variant: "default",
      });
    } catch (error) {
      console.error("Error logging in as user:", error);
      toast({
        title: "Error",
        description: "Failed to login as user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setImpersonating(null);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Settings</h1>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map(user => (
              <tr key={user.id} className="border-b last:border-b-0">
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleLoginAs(user.id)}
                    disabled={loading || impersonating === user.id}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 rounded-md disabled:opacity-50"
                  >
                    {impersonating === user.id ? 'Impersonating...' : 'Login As'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}