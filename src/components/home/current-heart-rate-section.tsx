import { alertService } from "@/api/services/alert.service";
import { heartRateHook } from "@/hooks/heartRate";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/appStyles";
import type { HeartRate } from "./types";

type CurrentHeartRateSectionProps = {
  userId?: string;
  onHeartRateChange: (heartRate: HeartRate | null) => void;
};

export function CurrentHeartRateSection({
  userId,
  onHeartRateChange,
}: CurrentHeartRateSectionProps) {
  const { getInfoHeartRateByUser } = heartRateHook();
  const getHeartRateRef = useRef(getInfoHeartRateByUser);
  const fetchingRef = useRef(false);
  const [heartRate, setHeartRate] = useState<HeartRate | null>(null);
  const [atrialAlertCount, setAtrialAlertCount] = useState(0);

  const latestBpm = Number(heartRate?.latest_bpm ?? 0);
  const isAbnormal =
    atrialAlertCount > 0 || latestBpm > 120 || (latestBpm > 0 && latestBpm < 50);

  useEffect(() => {
    getHeartRateRef.current = getInfoHeartRateByUser;
  }, [getInfoHeartRateByUser]);

  const handleGetHeartRate = useCallback(async () => {
    if (!userId) return;
    if (fetchingRef.current) return;

    try {
      fetchingRef.current = true;
      const data = await getHeartRateRef.current(userId);

      if (data) {
        setHeartRate(data);
        onHeartRateChange(data);
      }

      const countResp = await alertService.getAtrialAlertCount(userId);

      // console.log("[ATRIAL ALERT COUNT RESPONSE]", countResp);

      const countSource = Array.isArray(countResp) ? countResp[0] : countResp;

      const count = Number(
        countSource?.total_alerts_today ??
        countSource?.count ??
        countSource?.total ??
        countSource?.warning_count ??
        countSource ??
        0
      );

      setAtrialAlertCount(Number.isFinite(count) ? count : 0);
    } catch (error) {
      console.log("Lỗi lấy nhịp tim:", error);
    } finally {
      fetchingRef.current = false;
    }
  }, [onHeartRateChange, userId]);

  useEffect(() => {
    if (!userId) {
      setHeartRate(null);
      onHeartRateChange(null);
      return;
    }

    handleGetHeartRate();

    const timer = setInterval(() => {
      handleGetHeartRate();
    }, 30000);

    return () => {
      clearInterval(timer);
    };
  }, [handleGetHeartRate, onHeartRateChange, userId]);

  return (
    <>
      <LinearGradient
        colors={["#E53935", "#FF6B6B"]}
        style={styles.heartCard}
      >
        <View style={styles.heartTop}>
          <View>
            <Text style={styles.heartLabel}>Nhịp tim hiện tại</Text>
            <Text style={styles.heartValue}>
              {heartRate?.latest_bpm ?? "--"} BPM
            </Text>
          </View>

          <View style={styles.heartIconWrap}>
            <FontAwesome5 name="heartbeat" size={30} color="#fff" />
          </View>
        </View>

        <Text style={styles.heartDesc}>
          {isAbnormal
            ? "Phát hiện nhịp tim bất thường, cần theo dõi."
            : "Nhịp tim đang ở mức ổn định."}
        </Text>

        <TouchableOpacity
          style={styles.secondaryWhiteBtn}
          onPress={() => router.push("../tabs/heart-rate")}
        >
          <Text style={styles.secondaryWhiteBtnText}>
            Xem chi tiết nhịp tim
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {isAbnormal && (
        <View style={styles.alertCard}>
          <View style={styles.alertLeft}>
            <Ionicons name="warning" size={24} color="#D32F2F" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Cảnh báo rung nhĩ</Text>
            <Text style={styles.alertText}>
              Hệ thống AI phát hiện dấu hiệu nhịp tim bất thường. Hãy nghỉ
              ngơi và liên hệ người thân hoặc bác sĩ nếu cần.
            </Text>
          </View>
        </View>
      )}
    </>
  );
}
