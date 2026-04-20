export type ProjectStatus =
  | "active"
  | "completed"
  | "on_hold"
  | "cancelled";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  location: string | null;
  description?: string;
  start_date: string | null;
  end_date: string | null;
  status: ProjectStatus;
  progress?: number;
  budget?: number;
  total_orders?: number;
  total_spent?: number;
  created_at: string;
  updated_at?: string;
}

export interface ProjectItem {
  id: string;
  project_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface ProjectOrder {
  id: string;
  project_id: string;
  order_id: string;
  total_amount?: number;
  created_at: string;
}
