export interface Driver {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  image_url: string | null;
  license_number: string | null;
  vehicle_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
