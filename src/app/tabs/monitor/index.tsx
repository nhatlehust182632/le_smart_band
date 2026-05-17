import { useAuth } from "@/context/AuthContext";
import { monitorHook } from "@/hooks/monitor";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from "../../../styles/appStyles";

type HeartRate = {
  id: string,
  name: string,
  age: string,
  relation: string,
  heartRate: string,
  status: string,
  isConnected: string,
  location: string,
};
const monitoredPeople = [
  {
    id: "001",
    name: "Nguyễn Văn Nam",
    age: 67,
    relation: "Cha",
    heartRate: 148,
    status: "Cảnh báo",
    isConnected: true,
    location: "Công viên Thống Nhất",
  },
  {
    id: "002",
    name: "Trần Thị Lan",
    age: 63,
    relation: "Mẹ",
    heartRate: 78,
    status: "Bình thường",
    isConnected: true,
    location: "Nhà riêng",
  },
  {
    id: "003",
    name: "Phạm Quốc Minh",
    age: 72,
    relation: "Bệnh nhân",
    heartRate: 95,
    status: "Theo dõi",
    isConnected: false,
    location: "Bệnh viện Bạch Mai",
  },
];

export default function MonitorListScreen() {
  const [loading, setLoading] = useState(false);
  const [monitorFriend, setMonitorFriend] = useState<HeartRate[]>([]);
  const {
    getListMonitors
  } = monitorHook();
  const { user } = useAuth();

  const handleGetHeartRate = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const data = await getListMonitors(user?.id || "");
      console.log("monitor: " + data);

      setMonitorFriend(data);
    } catch (error) {
      console.log("Lỗi lấy nhịp tim:", error);
    } finally {
      setLoading(false);
    }
  };

  const getListFriend = async () => {
    if (loading) return;
    try {
      // console.log("LOCATION PAYLOAD =>", payload);
      // setLoading(true);
      // const data = await savePlaceNow(payload);

      // setDataLocation(data);

      // const data1 = await getListHistory(user?.id || "");
      // console.log("locationData: " + data1);
      // setDataHistory(data1);
    } catch (error) {
      console.log("Save location error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetHeartRate();
  }, [])

  return (
    <SafeAreaView style={localStyles.safeOrange}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient colors={["#EF6C00", "#FB8C00"]} style={styles.header}>
            <View style={styles.centerHeader}>
              <Text style={styles.greeting}>Giám sát</Text>
              <Text style={styles.subGreeting}>
                Danh sách người đang được theo dõi
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Người được giám sát</Text>
          </View>

          {monitorFriend?.map((person) => (
            <TouchableOpacity
              key={person.id}
              style={localStyles.personCard}
              onPress={() => router.push(`../tabs/monitor/${person.id}`)}
            >
              <View style={localStyles.avatarWrap}>
                <Ionicons name="person" size={28} color="#EF6C00" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={localStyles.personName}>{person.name}</Text>
                <Text style={localStyles.personMeta}>
                  {person.relation} • {person.age} tuổi
                </Text>

                <View style={localStyles.inlineRow}>
                  <MaterialCommunityIcons
                    name="heart-pulse"
                    size={16}
                    color="#E53935"
                  />
                  <Text style={localStyles.inlineText}>
                    {person.heartRate} BPM
                  </Text>

                  <Ionicons
                    name={person.isConnected ? "bluetooth" : "alert-circle"}
                    size={16}
                    color={person.isConnected ? "#2E7D32" : "#D32F2F"}
                    style={{ marginLeft: 14 }}
                  />
                  <Text style={localStyles.inlineText}>
                    {person.isConnected ? "Đã kết nối" : "Mất kết nối"}
                  </Text>
                </View>

                <Text style={localStyles.personLocation}>
                  Vị trí: {person.location}
                </Text>
              </View>

              <View
                style={[
                  localStyles.statusBadge,
                  person.status === "Cảnh báo"
                    ? localStyles.badgeDanger
                    : person.status === "Theo dõi"
                      ? localStyles.badgeWarning
                      : localStyles.badgeSafe,
                ]}
              >
                <Text
                  style={[
                    localStyles.statusBadgeText,
                    person.status === "Cảnh báo"
                      ? localStyles.badgeDangerText
                      : person.status === "Theo dõi"
                        ? localStyles.badgeWarningText
                        : localStyles.badgeSafeText,
                  ]}
                >
                  {person.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

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
  personCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  personName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1B2A41",
  },
  personMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "#607D8B",
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  inlineText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#455A64",
    fontWeight: "600",
  },
  personLocation: {
    marginTop: 8,
    fontSize: 13,
    color: "#607D8B",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 10,
  },
  badgeDanger: {
    backgroundColor: "#FFEBEE",
  },
  badgeWarning: {
    backgroundColor: "#FFF8E1",
  },
  badgeSafe: {
    backgroundColor: "#E8F5E9",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  badgeDangerText: {
    color: "#C62828",
  },
  badgeWarningText: {
    color: "#EF6C00",
  },
  badgeSafeText: {
    color: "#2E7D32",
  },
});
