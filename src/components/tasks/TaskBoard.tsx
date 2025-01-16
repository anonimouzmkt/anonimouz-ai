import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/tasks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { TaskCard } from "./TaskCard";

interface TaskBoardProps {
  tasks: Task[];
}

export const TaskBoard = ({ tasks }: TaskBoardProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: Task["status"] }) => {
      console.log("Updating task status:", { taskId, status });
      const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    updateTaskStatus.mutate({ taskId, status });
  };

  const todoTasks = tasks.filter((task) => task.status === "todo");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const doneTasks = tasks.filter((task) => task.status === "done");

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Task Board</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "todo")}
          className="space-y-4"
        >
          <Card className="p-4">
            <h3 className="font-semibold mb-4">To Do</h3>
            <div className="space-y-4">
              {todoTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={(e) => handleDragStart(e, task.id)}
                />
              ))}
            </div>
          </Card>
        </div>

        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "in_progress")}
          className="space-y-4"
        >
          <Card className="p-4">
            <h3 className="font-semibold mb-4">In Progress</h3>
            <div className="space-y-4">
              {inProgressTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={(e) => handleDragStart(e, task.id)}
                />
              ))}
            </div>
          </Card>
        </div>

        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "done")}
          className="space-y-4"
        >
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Done</h3>
            <div className="space-y-4">
              {doneTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={(e) => handleDragStart(e, task.id)}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  );
};