export type UserStatus = "active" | "blocked" | "inactive" | number;

export interface UserLogin {
  id: string;
  full_name: string;
  password_hash: string;
  device_id?: string;
  device_name?: string;
}

export interface UserRegister {
  id: string;
  phone: string;
  full_name: string;
  password_hash: string;
}

export interface User {
  id: string;
  email?: string | null;
  phone?: string;
  password_hash?: string;
  full_name: string;
  gender?: string | number | null;
  date_of_birth?: string | null;
  age?: number | null;
  emergency_phone?: string | null;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  height_cm?: number | null;
  weight_kg?: number | null;
  timezone?: string;
  language?: string;
  enable_heart_rate_alert?: number;
  status?: UserStatus;
  created_at?: string;
  updated_at?: string | null;
}

export interface UserId {
  id: string;
  password_hash: string;
}

export interface Profile {
  id: string;
  email?: string | null;
  phone: string;
  full_name: string;
  gender: string | number | null;
  date_of_birth?: string | null;
  age: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  emergency_phone?: string | null;
  enable_heart_rate_alert?: number;
  status?: UserStatus;
  model_name?: string | null;
  device_mac_address?: string | null;
}
