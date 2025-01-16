export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: TaskStatus;
  column_id?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}