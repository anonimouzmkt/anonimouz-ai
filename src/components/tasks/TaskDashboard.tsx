import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Task } from "@/types/tasks";

interface TaskDashboardProps {
  tasks: Task[];
}

export const TaskDashboard = ({ tasks }: TaskDashboardProps) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length;
  const todoTasks = tasks.filter((task) => task.status === "todo").length;

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Task Progress</h3>
        <Progress value={completionRate} className="mb-2" />
        <p className="text-sm text-muted-foreground">
          {completionRate.toFixed(0)}% Complete
        </p>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Task Distribution</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">To Do</span>
            <span className="text-sm font-medium">{todoTasks}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">In Progress</span>
            <span className="text-sm font-medium">{inProgressTasks}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Completed</span>
            <span className="text-sm font-medium">{completedTasks}</span>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Total Tasks</h3>
        <p className="text-3xl font-bold">{totalTasks}</p>
      </Card>
    </div>
  );
};