import {
    FontAwesome5,
    Ionicons,
    MaterialCommunityIcons,
} from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type RootStackParamList = {
  Home: undefined;
  HeartRate: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function HomeScreen({ navigation }: any) {
  const heartRate = 152;
  const isAbnormal = heartRate > 120;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient colors={["#0D47A1", "#1976D2"]} style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="menu" size={24} color="#fff" />
              </TouchableOpacity>

              <View>
                <Text style={styles.greeting}>Xin chào, Nam</Text>
                <Text style={styles.subGreeting}>
                  Theo dõi sức khỏe mỗi ngày
                </Text>
              </View>

              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="notifications-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <MaterialCommunityIcons
                name="watch-variant"
                size={22}
                color="#1565C0"
              />
              <Text style={styles.cardTitle}>Vòng tay sức khỏe</Text>
            </View>

            <View style={styles.deviceRow}>
              <View style={styles.deviceBadge}>
                <MaterialCommunityIcons
                  name="bluetooth-connect"
                  size={26}
                  color="#1565C0"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.deviceName}>VSK Smart Band A1</Text>
                <Text style={styles.deviceStatus}>Đã kết nối</Text>
              </View>

              <TouchableOpacity style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Quét lại</Text>
              </TouchableOpacity>
            </View>
          </View>

          <LinearGradient
            colors={["#E53935", "#FF6B6B"]}
            style={styles.heartCard}
          >
            <View style={styles.heartTop}>
              <View>
                <Text style={styles.heartLabel}>Nhịp tim hiện tại</Text>
                <Text style={styles.heartValue}>{heartRate} BPM</Text>
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
              onPress={() => navigation.navigate("HeartRate")}
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
                <Text style={styles.alertTitle}>Cảnh báo dung nhĩ</Text>
                <Text style={styles.alertText}>
                  Hệ thống AI phát hiện dấu hiệu nhịp tim bất thường. Hãy nghỉ
                  ngơi và liên hệ người thân hoặc bác sĩ nếu cần.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chức năng chính</Text>
          </View>

          <View style={styles.quickGrid}>
            <TouchableOpacity style={styles.quickCard}>
              <View style={[styles.quickIcon, { backgroundColor: "#E3F2FD" }]}>
                <MaterialCommunityIcons
                  name="bluetooth-searching"
                  size={24}
                  color="#1565C0"
                />
              </View>
              <Text style={styles.quickTitle}>Quét thiết bị</Text>
              <Text style={styles.quickDesc}>Tìm và kết nối vòng tay</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => navigation.navigate("HeartRate")}
            >
              <View style={[styles.quickIcon, { backgroundColor: "#FCE4EC" }]}>
                <FontAwesome5 name="heartbeat" size={22} color="#E53935" />
              </View>
              <Text style={styles.quickTitle}>Nhịp tim</Text>
              <Text style={styles.quickDesc}>Theo dõi bất thường</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickCard}>
              <View style={[styles.quickIcon, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons name="location" size={24} color="#2E7D32" />
              </View>
              <Text style={styles.quickTitle}>Định vị</Text>
              <Text style={styles.quickDesc}>Xem vị trí cuối cùng</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="location" size={22} color="#2E7D32" />
              <Text style={styles.cardTitle}>Vị trí cuối cùng</Text>
            </View>

            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={42} color="#90A4AE" />
              <Text style={styles.mapText}>Công viên Thống Nhất</Text>
              <Text style={styles.mapSubText}>Cập nhật 5 phút trước</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="stats-chart" size={22} color="#1565C0" />
              <Text style={styles.cardTitle}>Tổng quan hôm nay</Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryNumber}>8,245</Text>
                <Text style={styles.summaryLabel}>Bước chân</Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryNumber}>72</Text>
                <Text style={styles.summaryLabel}>Nhịp tim TB</Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryNumber}>7h20</Text>
                <Text style={styles.summaryLabel}>Giấc ngủ</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.bottomTab}>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="home" size={22} color="#1565C0" />
            <Text style={[styles.tabLabel, styles.tabActive]}>Trang chủ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate("HeartRate")}
          >
            <FontAwesome5 name="heartbeat" size={20} color="#90A4AE" />
            <Text style={styles.tabLabel}>Nhịp tim</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="location" size={22} color="#90A4AE" />
            <Text style={styles.tabLabel}>Định vị</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="person" size={22} color="#90A4AE" />
            <Text style={styles.tabLabel}>Hồ sơ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function HeartRateScreen({ navigation }: any) {
  const currentHeartRate = 152;
  const averageHeartRate = 85;
  const highestHeartRate = 152;
  const lowestHeartRate = 68;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={["#C62828", "#E53935"]}
            style={styles.hrHeader}
          >
            <View style={styles.hrHeaderTop}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>

              <View>
                <Text style={styles.hrTitle}>Nhịp tim</Text>
                <Text style={styles.hrSubtitle}>
                  Theo dõi nhịp tim bất thường
                </Text>
              </View>

              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
              </TouchableOpacity>
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
              <View style={styles.chartLine1} />
              <View style={styles.chartDotRow}>
                <View style={styles.chartDot} />
                <View style={styles.chartDot} />
                <View style={styles.chartDot} />
                <View style={styles.chartDot} />
                <View style={styles.chartDot} />
                <View style={styles.chartDot} />
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

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    // <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="HeartRate" component={HeartRateScreen} />
    </Stack.Navigator>
    // </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0D47A1",
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  subGreeting: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B2A41",
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B2A41",
  },
  deviceStatus: {
    marginTop: 4,
    color: "#2E7D32",
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: "#1565C0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  heartCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 18,
  },
  heartTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heartLabel: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.95,
  },
  heartValue: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
    marginTop: 6,
  },
  heartIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  heartDesc: {
    color: "#fff",
    fontSize: 14,
    marginTop: 14,
    lineHeight: 20,
  },
  secondaryWhiteBtn: {
    marginTop: 14,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryWhiteBtnText: {
    color: "#E53935",
    fontWeight: "700",
    fontSize: 15,
  },
  alertCard: {
    backgroundColor: "#FFF3F3",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  alertLeft: {
    marginRight: 10,
    marginTop: 2,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#C62828",
    marginBottom: 6,
  },
  alertText: {
    color: "#6D4C41",
    lineHeight: 20,
  },
  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B2A41",
  },
  quickGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    gap: 10,
  },
  quickCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1B2A41",
    textAlign: "center",
  },
  quickDesc: {
    fontSize: 12,
    color: "#607D8B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 17,
  },
  mapPlaceholder: {
    height: 170,
    borderRadius: 18,
    backgroundColor: "#EEF4F8",
    alignItems: "center",
    justifyContent: "center",
  },
  mapText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "#1B2A41",
  },
  mapSubText: {
    marginTop: 6,
    fontSize: 13,
    color: "#607D8B",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: "#F7FAFD",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1565C0",
  },
  summaryLabel: {
    marginTop: 6,
    fontSize: 13,
    color: "#607D8B",
  },
  bottomTab: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    height: 70,
    backgroundColor: "#fff",
    borderRadius: 22,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 12,
    color: "#90A4AE",
    marginTop: 4,
    fontWeight: "600",
  },
  tabActive: {
    color: "#1565C0",
  },

  hrHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  hrHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hrTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  hrSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  mainHeartCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
  },
  mainHeartLabel: {
    color: "#fff",
    fontSize: 15,
    opacity: 0.95,
  },
  mainHeartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 14,
  },
  mainHeartValue: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "800",
    marginLeft: 12,
  },
  mainHeartUnit: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
    marginBottom: 8,
  },
  mainHeartWarning: {
    color: "#fff",
    marginTop: 14,
    fontSize: 15,
    fontWeight: "600",
  },
  fakeChart: {
    height: 180,
    borderRadius: 18,
    backgroundColor: "#F8FBFF",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  chartLine1: {
    height: 3,
    backgroundColor: "#E53935",
    borderRadius: 3,
    marginBottom: 40,
  },
  chartDotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  chartDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E53935",
  },
  chartTime: {
    color: "#78909C",
    fontSize: 12,
    textAlign: "center",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF1",
  },
  historyTime: {
    fontSize: 14,
    color: "#607D8B",
    fontWeight: "600",
  },
  historyValue: {
    fontSize: 14,
    color: "#1B2A41",
    fontWeight: "600",
  },
  historyValueHigh: {
    fontSize: 14,
    color: "#D32F2F",
    fontWeight: "700",
  },
});
