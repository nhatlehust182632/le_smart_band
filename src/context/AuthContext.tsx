import { UserLogin, UserRegister } from "@/api/models/user.model";
import { userService } from "@/api/services/user.service";
import React, { createContext, useContext, useMemo, useState } from "react";

type User = {
  id: string;
  name?: string;
  device_code?: string;
};

type AuthContextType = {
  user: User | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (phone: string, password: string) => {
    // Demo login
    if (!phone || !password) {
      throw new Error("Vui lòng nhập đầy đủ số điện thoại và mật khẩu");
    }
    const userLogin: UserLogin = {
      id: phone,
      password_hash: password,
      full_name: "",
    };
    const data = await userService.postUserLogin(userLogin);
    console.log("Login User:", data);
    setUser({
      id: data?.id,
      name: data?.full_name,
      device_code: data?.device_code,
    });
  };

  const register = async (name: string, phone: string, password: string) => {
    const validatePhone = (phone: string) => {
      // normalizePhone bỏ hết ký tự không phải số. VD: " 0912345678 ", "091-234-5678", "091 234 5678"
      phone = phone.trim().replace(/[\s\-\.]/g, ""); // chỉ bỏ khoảng trắng, -, .
      if (phone.startsWith("84")) {
        phone = "0" + phone.slice(2);
      }
      // kiểm tra độ dài số điện thoại
      if (phone.length !== 10) return false;
      // định dạng số điện thoại
      const regex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
      return regex.test(phone);
    };

    // const validatePassword = (password: string) => {
    //   const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    //   return regex.test(password);
    // };
    if (!name || !phone || !password) {
      throw new Error("Vui lòng nhập đầy đủ thông tin");
    }

    if (validatePhone(phone)) {
    } else {
      throw new Error("Số điện thoại không hợp lệ");
    }

    const userRegister: UserRegister = {
      id: phone,
      phone: phone,
      full_name: name,
      password_hash: password,
    };
    const data = await userService.postUserRegister(userRegister);
    console.log("Register User:", data);
    setUser({
      id: data?.id,
      name: data?.full_name,
    });
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng bên trong AuthProvider");
  }
  return context;
}
