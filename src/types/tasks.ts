export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: "todo" | "in_progress" | "done";
  created_at: string;
  updated_at: string;
}