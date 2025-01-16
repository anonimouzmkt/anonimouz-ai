import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/tasks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical } from "lucide-react";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { TaskCard } from "./TaskCard";
import { EditTaskDialog } from "./EditTaskDialog";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TaskBoardProps {
  tasks: Task[];
}

interface Column {
  id: string;
  title: string;
  order_index: number;
}

export const TaskBoard = ({ tasks }: TaskBoardProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [isNewColumnDialogOpen, setIsNewColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: columns = [] } = useQuery({
    queryKey: ["columns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_columns")
        .select("*")
        .order("order_index");

      if (error) throw error;
      return data;
    },
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, columnId }: { taskId: string; columnId: string }) => {
      console.log("Updating task column:", { taskId, columnId });
      const { error } = await supabase
        .from("tasks")
        .update({ column_id: columnId })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Task updated",
        description: "Task status has been updated successfully.",
      });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully.",
      });
    },
  });

  const createColumn = useMutation({
    mutationFn: async (title: string) => {
      const { error } = await supabase
        .from("task_columns")
        .insert({
          title,
          order_index: columns.length,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      setIsNewColumnDialogOpen(false);
      setNewColumnTitle("");
      toast({
        title: "Column created",
        description: "New column has been created successfully.",
      });
    },
  });

  const updateColumn = useMutation({
    mutationFn: async (column: Column) => {
      const { error } = await supabase
        .from("task_columns")
        .update({ title: column.title })
        .eq("id", column.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      setEditingColumn(null);
      toast({
        title: "Column updated",
        description: "Column has been updated successfully.",
      });
    },
  });

  const deleteColumn = useMutation({
    mutationFn: async (columnId: string) => {
      const { error } = await supabase
        .from("task_columns")
        .delete()
        .eq("id", columnId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      toast({
        title: "Column deleted",
        description: "Column has been deleted successfully.",
      });
    },
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    updateTaskStatus.mutate({ taskId, columnId });
  };

  const handleComplete = (task: Task) => {
    const doneColumn = columns.find(col => col.title.toLowerCase() === "done");
    const todoColumn = columns.find(col => col.title.toLowerCase() === "to do");
    
    if (task.status === "done" && todoColumn) {
      updateTaskStatus.mutate({ taskId: task.id, columnId: todoColumn.id });
    } else if (doneColumn) {
      updateTaskStatus.mutate({ taskId: task.id, columnId: doneColumn.id });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Task Board</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsNewColumnDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Column
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div
            key={column.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
            className="space-y-4"
          >
            <Card className="p-4 bg-background/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{column.title}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingColumn(column)}>
                      Edit Column
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteColumn.mutate(column.id)}
                    >
                      Delete Column
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {tasks
                    .filter((task) => task.column_id === column.id)
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onEdit={setEditingTask}
                        onComplete={handleComplete}
                        onDelete={(task) => deleteTask.mutate(task.id)}
                      />
                    ))}
                </div>
              </AnimatePresence>
            </Card>
          </div>
        ))}
      </div>

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      
      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
        />
      )}

      <Dialog open={isNewColumnDialogOpen} onOpenChange={setIsNewColumnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Enter column title"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsNewColumnDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createColumn.mutate(newColumnTitle)}
                disabled={!newColumnTitle.trim()}
              >
                Create Column
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingColumn} onOpenChange={(open) => !open && setEditingColumn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Column</DialogTitle>
          </DialogHeader>
          {editingColumn && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="edit-title"
                  value={editingColumn.title}
                  onChange={(e) =>
                    setEditingColumn({ ...editingColumn, title: e.target.value })
                  }
                  placeholder="Enter column title"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingColumn(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateColumn.mutate(editingColumn)}
                  disabled={!editingColumn.title.trim()}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};