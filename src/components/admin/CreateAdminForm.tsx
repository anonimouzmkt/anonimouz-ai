import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function CreateAdminForm() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      console.log("Creating new admin user:", values.email);

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (signUpError) {
        console.error("Error creating user:", signUpError);
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error("No user returned from sign up");
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          role: "admin_user",
          admin_users: true 
        })
        .eq("id", signUpData.user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        throw updateError;
      }

      toast.success("Admin user created successfully");
      form.reset();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Failed to create admin user");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Create Admin User</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="admin@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Admin User
          </Button>
        </form>
      </Form>
    </div>
  );
}