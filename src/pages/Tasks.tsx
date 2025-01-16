import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskDashboard } from "@/components/tasks/TaskDashboard";
import { TaskBoard } from "@/components/tasks/TaskBoard";

const Tasks = () => {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      console.log("Fetching tasks...");
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }

      console.log("Tasks fetched:", data);
      return data;
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading tasks...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Tasks</h1>
      <TaskDashboard tasks={tasks || []} />
      <TaskBoard tasks={tasks || []} />
    </div>
  );
};

export default Tasks;