import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/Login";
import WhatsApp from "./pages/WhatsApp";
import Settings from "./pages/Settings";
import AdminSettings from "./pages/AdminSettings";
import DispatchDashboard from "./pages/DispatchDashboard";
import EmailConfirmation from "./pages/EmailConfirmation";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const loadUserTheme = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('theme_color')
            .eq('id', user.id)
            .single();

          if (profile?.theme_color) {
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(profile.theme_color);
          }
        }
      } catch (error) {
        console.error('Error loading user theme:', error);
      }
    };

    loadUserTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route
              path="/"
              element={
                <ProtectedLayout>
                  <Index />
                </ProtectedLayout>
              }
            />
            <Route
              path="/whatsapp"
              element={
                <ProtectedLayout>
                  <WhatsApp />
                </ProtectedLayout>
              }
            />
            <Route
              path="/dispatch-dashboard"
              element={
                <ProtectedLayout>
                  <DispatchDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedLayout>
                  <Settings />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin-settings"
              element={
                <ProtectedLayout>
                  <AdminSettings />
                </ProtectedLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;