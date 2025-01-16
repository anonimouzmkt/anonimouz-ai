import { format } from "date-fns";
import { Task } from "@/types/tasks";
import { Card } from "@/components/ui/card";
import { CalendarIcon, Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent) => void;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
}

export const TaskCard = ({ task, onDragStart, onEdit, onComplete }: TaskCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        draggable
        onDragStart={onDragStart}
        className={cn(
          "p-4 cursor-move hover:shadow-md transition-all group",
          task.status === "done" && "opacity-80"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <Checkbox
              checked={task.status === "done"}
              onCheckedChange={() => onComplete(task)}
              className="mt-1"
            />
            <div className="flex-1">
              <h4 className={cn(
                "font-medium mb-1",
                task.status === "done" && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h4>
              {task.description && (
                <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
              )}
              {task.due_date && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  <span>Due: {format(new Date(task.due_date), "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => onEdit(task)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded-md"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </motion.div>
  );
};