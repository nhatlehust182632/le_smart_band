import { heartRateSourceUser } from "@/api/services/heartRate.service";
import { useState } from "react";

export function heartRateHook() {
  const [loading, setLoading] = useState(false);

  const getInfoHeartRateByUser = async (id: string) => {
    if (loading) return;
    if (!id) {
      throw new Error("Lỗi chức năng");
    }
    try {
      setLoading(true);
      const response = await heartRateSourceUser.getInfoUserIdHeartRate(id);

      return response;
    } finally {
      setLoading(false);
    }
  };

  const getInfoHeartRateByTimes = async (id: string, type: string) => {
    if (loading) return;
    if (!id || !type) {
      throw new Error("Lỗi chức năng");
    }
    try {
      setLoading(true);
      const response = await heartRateSourceUser.getHeartRateSourceTimes(
        id,
        type,
      );

      return response;
    } finally {
      setLoading(false);
    }
  };

  const getInfoHeartRateHistory = async (id: string) => {
    if (loading) return;
    if (!id) {
      throw new Error("Lỗi chức năng");
    }
    try {
      setLoading(true);
      const response = await heartRateSourceUser.getHeartRateSourceHistory(id);

      return response;
    } finally {
      setLoading(false);
    }
  };

  return {
    getInfoHeartRateByUser,
    getInfoHeartRateByTimes,
    getInfoHeartRateHistory,
  };
}
