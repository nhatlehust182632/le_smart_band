import { User, UserId } from "@/api/models/user.model";
import { useState } from "react";
import { profileService } from "../api/services/profileService";

export function useProfile() {
  const [loading, setLoading] = useState(false);

  const getInfoProfile = async (id: string) => {
    if (loading) return;
    if (!id) throw new Error("Thiếu id người dùng");

    try {
      setLoading(true);

      const userId: UserId = {
        id,
        password_hash: "",
      };

      return await profileService.getProfileInfo(userId);
    } finally {
      setLoading(false);
    }
  };

  const validateProfile = (data: Partial<User>) => {
    if (!data.id) return "Thiếu id người dùng";
    if (!data.full_name?.trim()) return "Vui lòng nhập họ tên";

    return null;
  };

  const updateProfile = async (formData: Partial<User>) => {
    if (loading) return;

    const error = validateProfile(formData);
    if (error) throw new Error(error);

    try {
      setLoading(true);
      return await profileService.updateMyProfile(formData as User);
    } finally {
      setLoading(false);
    }
  };

  const getInfoUser = async (id: string) => {
    return getInfoProfile(id);
  };

  return {
    loading,
    getInfoProfile,
    updateProfile,
    getInfoUser,
  };
}
