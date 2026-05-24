import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { styles } from "../../styles/appStyles";

type TodaySummarySectionProps = {
  stepCount: number;
  calories: number;
  todayWarnings: number;
};

export function TodaySummarySection({
  stepCount,
  calories,
  todayWarnings,
}: TodaySummarySectionProps) {
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
            {todayWarnings.toLocaleString("vi-VN")}
          </Text>
          <Text style={styles.summaryLabel}>Cảnh báo hôm nay</Text>
        </View>
      </View>
    </View>
  );
}
