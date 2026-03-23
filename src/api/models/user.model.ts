export type UserStatus = "active" | "blocked" | "inactive";
export interface UserLogin {
  id: string;
  full_name: string;
  password_hash: string;
}

export interface UserRegister {
  id: string;
  phone: string;
  full_name: string;
  password_hash: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  password_hash: string;
  full_name: string;
  gender: string;
  date_of_birth: string | null;
  age: number | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  height_cm: number | null;
  weight_kg: number | null;
  timezone: string;
  language: string;
  status: UserStatus;
  created_at: string;
  updated_at: string | null;
}

export interface UserId {
  id: string;
  password_hash: string;
}

export interface Profile {
  id: string;
  phone: string;
  full_name: string;
  gender: string;
  age: number | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  model_name: string;
}
