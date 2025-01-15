import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const CreateAdminForm = () => {
  const { t } = useTranslation();
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ role: "admin_user" })
        .eq("email", adminEmail)
        .select();

      if (error) throw error;

      if (data.length === 0) {
        toast.error("User not found");
        return;
      }

      toast.success("Admin user created successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setAdminEmail("");
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error("Failed to create admin user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("adminMaster")}</CardTitle>
        <CardDescription>{t("createNewAdmin")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateAdmin} className="flex gap-4">
          <Input
            type="email"
            placeholder={t("adminEmail")}
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {t("createAdminUser")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};