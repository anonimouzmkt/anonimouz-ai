import { format } from "date-fns";
import { Task } from "@/types/tasks";
import { Card } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent) => void;
}

export const TaskCard = ({ task, onDragStart }: TaskCardProps) => {
  return (
    <Card
      draggable
      onDragStart={onDragStart}
      className="p-4 cursor-move hover:shadow-md transition-shadow"
    >
      <h4 className="font-medium mb-2">{task.title}</h4>
      {task.description && (
        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
      )}
      {task.due_date && (
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarIcon className="w-4 h-4 mr-1" />
          <span>Due: {format(new Date(task.due_date), "MMM d, yyyy")}</span>
        </div>
      )}
    </Card>
  );
};