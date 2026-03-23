import { User, UserId } from "@/api/models/user.model";
import { useState } from "react";
import { profileService } from "../api/services/profileService";

export function useProfile() {
  const [loading, setLoading] = useState(false);

  const getInfoProfile = async (id: string) => {
    if (loading) return;
    if (!id) {
      throw new Error("Lỗi chức năng");
    }
    try {
      setLoading(true);
      const userId: UserId = {
        id: id,
        password_hash: "",
      };
      const response = await profileService.getProfileInfo({
        ...userId,
      });

      return response;
    } finally {
      setLoading(false);
    }
  };

  // validate dữ liệu
  const validateProfile = (data: {
    fullName: string;
    phone: string;
    emergencyContact: string;
    age: string;
    gender: string;
  }) => {
    if (!data.fullName) return "Vui lòng nhập họ tên";
    if (!data.phone) return "Vui lòng nhập số điện thoại";
    if (!/^[0-9]{9,11}$/.test(data.phone)) return "Số điện thoại không hợp lệ";

    if (!data.emergencyContact) return "Vui lòng nhập người liên hệ khẩn cấp";

    if (!data.age || isNaN(Number(data.age))) return "Tuổi không hợp lệ";

    if (!data.gender) return "Vui lòng nhập giới tính";

    return null;
  };

  // ✅ hàm update profile
  const updateProfile = async (formData: any) => {
    if (loading) return;

    const error = validateProfile(formData);
    if (error) {
      throw new Error(error);
    }

    try {
      setLoading(true);
      const useInfo: User = {
        id: "",
        email: "",
        phone: "",
        password_hash: "",
        full_name: "",
        gender: "",
        date_of_birth: null,
        height_cm: null,
        weight_kg: null,
        timezone: "",
        language: "",
        status: "active",
        created_at: "",
        updated_at: null,
        age: null,
        emergency_contact_name: "",
        emergency_contact_phone: "",
      };
      const response = await profileService.updateMyProfile({
        ...useInfo,
      });

      return response;
    } finally {
      setLoading(false);
    }
  };

  const getInfoUser = async (id: string) => {
    if (loading) return;
    if (!id) {
      throw new Error("Lỗi chức năng");
    }
    try {
      setLoading(true);
      const userId: UserId = {
        id: id,
        password_hash: "",
      };
      const response = await profileService.getProfileInfo({
        ...userId,
      });

      return response;
    } finally {
      setLoading(false);
    }
  };

  return {
    getInfoProfile,
    updateProfile,
    getInfoUser,
  };
}
