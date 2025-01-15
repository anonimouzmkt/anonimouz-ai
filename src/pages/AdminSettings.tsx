import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [impersonating, setImpersonating] = useState<string | null>(null);

  const { data: users } = useQuery(['users'], async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data;
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
      
      toast.success("Successfully logged in as user");
    } catch (error) {
      console.error("Error logging in as user:", error);
      toast.error("Failed to login as user. Please try again.");
    } finally {
      setLoading(false);
      setImpersonating(null);
    }
  };

  return (
    <div>
      <h1>Admin Settings</h1>
      <ul>
        {users?.map(user => (
          <li key={user.id}>
            {user.email}
            <button onClick={() => handleLoginAs(user.id)} disabled={loading}>
              {impersonating === user.id ? 'Impersonating...' : 'Login As'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
