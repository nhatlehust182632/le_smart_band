import { UserLogin, UserRegister } from "../models/user.model";

export function mapUserRegister(raw: any): UserRegister {
  const data = raw?.data || raw || {};

  return {
    ...data,
    id: data?.id,
    phone: data?.phone,
    full_name: data?.full_name,
    password_hash: data?.password_hash,
  };
}

export function mapUserLogin(raw: any): UserLogin {
  const data = raw?.data || raw || {};

  return {
    ...data,
  };
}