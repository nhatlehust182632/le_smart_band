import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { styles } from "../../styles/appStyles";

export default function HeartRateScreen() {
  const currentHeartRate = 152;
  const averageHeartRate = 85;
  const highestHeartRate = 152;
  const lowestHeartRate = 68;

  return (
    <SafeAreaView style={localStyles.safeRed}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient colors={["#C62828", "#E53935"]} style={styles.header}>
            <View style={styles.centerHeader}>
              <Text style={styles.greeting}>Nhịp tim</Text>
              <Text style={styles.subGreeting}>
                Theo dõi nhịp tim bất thường
              </Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={["#E53935", "#FF6B6B"]}
            style={styles.mainHeartCard}
          >
            <Text style={styles.mainHeartLabel}>Nhịp tim hiện tại</Text>
            <View style={styles.mainHeartRow}>
              <FontAwesome5 name="heartbeat" size={34} color="#fff" />
              <Text style={styles.mainHeartValue}>{currentHeartRate}</Text>
              <Text style={styles.mainHeartUnit}>BPM</Text>
            </View>
            <Text style={styles.mainHeartWarning}>
              Cảnh báo rung nhĩ bất thường
            </Text>
          </LinearGradient>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="analytics" size={22} color="#1565C0" />
              <Text style={styles.cardTitle}>Biểu đồ nhịp tim</Text>
            </View>

            <View style={styles.fakeChart}>
              <View style={styles.chartPeakWrap}>
                <View style={styles.chartLineLow} />
                <View style={styles.chartLinePeak} />
                <View style={styles.chartLineMid} />
              </View>
              <Text style={styles.chartTime}>
                00:00 03:00 06:00 09:00 12:00
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="pulse" size={22} color="#E53935" />
              <Text style={styles.cardTitle}>Chỉ số hôm nay</Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryNumber}>{averageHeartRate}</Text>
                <Text style={styles.summaryLabel}>Trung bình</Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryNumber}>{highestHeartRate}</Text>
                <Text style={styles.summaryLabel}>Cao nhất</Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryNumber}>{lowestHeartRate}</Text>
                <Text style={styles.summaryLabel}>Thấp nhất</Text>
              </View>
            </View>
          </View>

          <View style={styles.alertCard}>
            <View style={styles.alertLeft}>
              <Ionicons name="warning" size={24} color="#D32F2F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Phân tích AI</Text>
              <Text style={styles.alertText}>
                Dữ liệu hiện tại cho thấy nhịp tim tăng cao bất thường. Cần tiếp
                tục theo dõi và gửi cảnh báo cho người quan sát nếu vượt ngưỡng
                trong thời gian dài.
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="time-outline" size={22} color="#1565C0" />
              <Text style={styles.cardTitle}>Lịch sử gần đây</Text>
            </View>

            <View style={styles.historyItem}>
              <Text style={styles.historyTime}>10:30</Text>
              <Text style={styles.historyValueHigh}>152 BPM - Bất thường</Text>
            </View>

            <View style={styles.historyItem}>
              <Text style={styles.historyTime}>09:45</Text>
              <Text style={styles.historyValue}>108 BPM - Theo dõi</Text>
            </View>

            <View style={styles.historyItem}>
              <Text style={styles.historyTime}>08:15</Text>
              <Text style={styles.historyValue}>82 BPM - Bình thường</Text>
            </View>

            <View style={styles.historyItem}>
              <Text style={styles.historyTime}>07:40</Text>
              <Text style={styles.historyValue}>76 BPM - Bình thường</Text>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeRed: {
    flex: 1,
    backgroundColor: "#C62828",
  },
});
