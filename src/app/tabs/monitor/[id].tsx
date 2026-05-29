import { useAuth } from "@/context/AuthContext";
import { monitorHook } from "@/hooks/monitor";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../../styles/appStyles";

const monitorDetails: Record<string, any> = {
  "001": {
    name: "Nguyễn Văn Nam",
    age: 67,
    relation: "Cha",
    currentHeartRate: 148,
    heartStatus: "Cảnh báo",
    isConnected: true,
    battery: 78,
    lastSync: "2 phút trước",
    lastLocation: "Công viên Thống Nhất, Hà Nội",
    locationUpdatedAt: "10:32",
    riskLevel: "Cao",
  },
  "002": {
    name: "Trần Thị Lan",
    age: 63,
    relation: "Mẹ",
    currentHeartRate: 78,
    heartStatus: "Bình thường",
    isConnected: true,
    battery: 90,
    lastSync: "1 phút trước",
    lastLocation: "Nhà riêng",
    locationUpdatedAt: "10:35",
    riskLevel: "Thấp",
  },
  "003": {
    name: "Phạm Quốc Minh",
    age: 72,
    relation: "Bệnh nhân",
    currentHeartRate: 95,
    heartStatus: "Theo dõi",
    isConnected: false,
    battery: 20,
    lastSync: "15 phút trước",
    lastLocation: "Bệnh viện Bạch Mai",
    locationUpdatedAt: "10:10",
    riskLevel: "Trung bình",
  },
};

type HeartRate = {
  name: string,
  age: string,
  relation: string,
  heartRate: string,
  heartStatus: string,
  status: string,
  isConnected: string,
  lastLocation: string,
  riskLevel: string,
  locationUpdatedAt: string,
  lastSync: string,
  battery: string
};

export default function MonitorDetailScreen() {
  const [loading, setLoading] = useState(false);
  const { id } = useLocalSearchParams<{ id: string }>();
  // const person = monitorDetails[id || "001"];
  const [monitorId, setMonitorId] = useState<HeartRate | null>(null);
  const { user } = useAuth();
  const { getMonitorId, stopMonitoring } = monitorHook();

  const handleGetHeartRate = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const data = await getMonitorId(id || "");
      console.log("monitor: " + data);

      setMonitorId(data);
    } catch (error) {
      console.log("Lỗi lấy nhịp tim:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleStopMonitoring = async () => {
    if (!user?.id || !id) {
      Alert.alert("Lỗi", "Thiếu thông tin người dùng hoặc mã giám sát.");
      return;
    }

    Alert.alert(
      "Xác nhận",
      "Bạn có muốn hủy giám sát người này không?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy giám sát",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await stopMonitoring(user.id, id);
              Alert.alert("Thành công", "Đã hủy giám sát.");
              router.back();
            } catch (error) {
              console.log("Lỗi hủy giám sát:", error);
              Alert.alert("Lỗi", (error as Error)?.message || "Không thể hủy giám sát.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    handleGetHeartRate();
  }, [])

  // if (!person) {
  //   return (
  //     <SafeAreaView
  //       style={{
  //         flex: 1,
  //         backgroundColor: "#fff",
  //         justifyContent: "center",
  //         alignItems: "center",
  //       }}
  //     >
  //       <Text>Không tìm thấy người được giám sát</Text>
  //     </SafeAreaView>
  //   );
  // }

  return (
    <SafeAreaView style={localStyles.safeOrange}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient colors={["#EF6C00", "#FB8C00"]} style={styles.header}>
            <View style={localStyles.headerRow}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <Text style={styles.greeting}>Chi tiết giám sát</Text>
                <Text style={styles.subGreeting}>{monitorId?.name}</Text>
              </View>

              <View style={{ width: 40 }} />
            </View>
          </LinearGradient>

          <View style={styles.profileCard}>
            <View style={styles.avatarWrap}>
              <Ionicons name="person" size={42} color="#EF6C00" />
            </View>
            <Text style={styles.profileName}>{monitorId?.name}</Text>
            <Text style={styles.profileRole}>Người được giám sát</Text>

            <View style={styles.profileTagRow}>
              <View style={[styles.profileTag, localStyles.orangeTag]}>
                <Text
                  style={[styles.profileTagText, localStyles.orangeTagText]}
                >
                  Tuổi: {monitorId?.age}
                </Text>
              </View>
              <View style={[styles.profileTag, localStyles.orangeTag]}>
                <Text
                  style={[styles.profileTagText, localStyles.orangeTagText]}
                >
                  Quan hệ: {monitorId?.relation}
                </Text>
              </View>
              <View style={[styles.profileTag, localStyles.orangeTag]}>
                <Text
                  style={[styles.profileTagText, localStyles.orangeTagText]}
                >
                  Mức độ: {monitorId?.riskLevel}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <MaterialCommunityIcons
                name="watch-variant"
                size={22}
                color="#1565C0"
              />
              <Text style={styles.cardTitle}>Thiết bị đang đeo</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tên thiết bị</Text>
              <Text style={styles.infoValue}>VSK Smart Band A1</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Trạng thái kết nối</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: monitorId?.isConnected ? "#2E7D32" : "#D32F2F" },
                ]}
              >
                {monitorId?.isConnected ? "Đã kết nối" : "Mất kết nối"}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Pin thiết bị</Text>
              <Text style={styles.infoValue}>{monitorId?.battery}%</Text>
            </View>

            <View style={styles.infoItemNoBorder}>
              <Text style={styles.infoLabel}>Đồng bộ lần cuối</Text>
              <Text style={styles.infoValue}>{monitorId?.lastSync}</Text>
            </View>
          </View>

          <LinearGradient
            colors={["#E53935", "#FF6B6B"]}
            style={styles.mainHeartCard}
          >
            <Text style={styles.mainHeartLabel}>Nhịp tim hiện tại</Text>
            <View style={styles.mainHeartRow}>
              <FontAwesome5 name="heartbeat" size={34} color="#fff" />
              <Text style={styles.mainHeartValue}>
                {monitorId?.heartRate}
              </Text>
              <Text style={styles.mainHeartUnit}>BPM</Text>
            </View>
            <Text style={styles.mainHeartWarning}>
              Trạng thái: {monitorId?.heartStatus}
            </Text>
          </LinearGradient>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="location" size={22} color="#2E7D32" />
              <Text style={styles.cardTitle}>Vị trí cuối cùng</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Địa điểm</Text>
              <Text style={styles.infoValue}>{monitorId?.lastLocation}</Text>
            </View>

            <View style={styles.infoItemNoBorder}>
              <Text style={styles.infoLabel}>Cập nhật lúc</Text>
              <Text style={styles.infoValue}>{monitorId?.locationUpdatedAt}</Text>
            </View>

            <TouchableOpacity
              style={localStyles.actionButton}
              onPress={() => router.push("/tabs/location")}
            >
              <Text style={localStyles.actionButtonText}>
                Mở màn hình định vị
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={localStyles.cancelMonitorButton}
            onPress={handleStopMonitoring}
            disabled={loading}
          >
            <Text style={localStyles.cancelMonitorButtonText}>Hủy giám sát</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeOrange: {
    flex: 1,
    backgroundColor: "#EF6C00",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  orangeTag: {
    backgroundColor: "#FFF3E0",
  },
  orangeTagText: {
    color: "#EF6C00",
  },
  actionButton: {
    marginTop: 16,
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  cancelMonitorButton: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#D32F2F",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelMonitorButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});
