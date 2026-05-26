import { alertService } from "@/api/services/alert.service";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { styles } from "../../styles/appStyles";

type TodaySummarySectionProps = {
  stepCount: number;
  calories: number;
};

export function TodaySummarySection({
  stepCount,
  calories,
}: TodaySummarySectionProps) {
  const { user } = useAuth();
  const [todayWarningsCount, setTodayWarningsCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchAtrialCount = async () => {
      if (!user?.id) {
        if (mounted) setTodayWarningsCount(0);
        return;
      }

      try {
        const countResp = await alertService.getAtrialAlertCount(user.id);
        console.log("Atrial Alert Count Response:", countResp);
        const count = Number(
          countResp?.count ??
          countResp?.total ??
          countResp?.warning_count ??
          countResp ??
          0
        );

        if (mounted) {
          setTodayWarningsCount(Number.isFinite(count) ? count : 0);
        }
      } catch (error) {
        if (mounted) setTodayWarningsCount(0);
        console.warn("Lỗi lấy số cảnh báo hôm nay:", error);
      }
    };

    void fetchAtrialCount();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return (
    <View style={styles.card}>
      <View style={styles.cardTitleRow}>
        <Ionicons name="stats-chart" size={22} color="#1565C0" />
        <Text style={styles.cardTitle}>Tổng quan hôm nay</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryNumber}>
            {stepCount.toLocaleString("vi-VN")}
          </Text>
          <Text style={styles.summaryLabel}>Bước chân</Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryNumber}>
            {calories.toLocaleString("vi-VN")}
          </Text>
          <Text style={styles.summaryLabel}>Calories</Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryNumber}>
            {todayWarningsCount.toLocaleString("vi-VN")}
          </Text>
          <Text style={styles.summaryLabel}>Cảnh báo hôm nay</Text>
        </View>
      </View>
    </View>
  );
}
