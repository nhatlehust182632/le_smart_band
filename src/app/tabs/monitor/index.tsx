import { AddMonitorTab } from "@/components/monitor/AddMonitorTab";
import { ConfirmMonitorTab } from "@/components/monitor/ConfirmMonitorTab";
import { MonitoredTab } from "@/components/monitor/MonitoredTab";
import { useAuth } from "@/context/AuthContext";
import { monitorHook } from "@/hooks/monitor";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
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

export default function MonitorListScreen() {
  const [activeTab, setActiveTab] = useState<"monitored" | "confirm" | "add">("monitored");
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  const { user } = useAuth();
  const { getMonitorNotifications } = monitorHook();

  const notificationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastNotificationCountRef = useRef<number>(0);

  const checkNotifications = async () => {
    if (!user?.id) return;
    try {
      const data = await getMonitorNotifications(user.id);
      const notifications = Array.isArray(data) ? data : [];
      const count = notifications.length;

      if (count > 0 && count !== lastNotificationCountRef.current) {
        lastNotificationCountRef.current = count;
        const message = `Bạn có ${count} thông báo mới từ người được giám sát.`;
        setNotificationMessage(message);
        Alert.alert("Thông báo giám sát", message);
      }
    } catch (error) {
      console.log("Lỗi kiểm tra thông báo giám sát:", error);
    }
  };

  useEffect(() => {
    checkNotifications();

    notificationInterval.current = setInterval(() => {
      checkNotifications();
    }, 10000);

    return () => {
      if (notificationInterval.current) {
        clearInterval(notificationInterval.current);
      }
    };
  }, [user?.id]);

  const renderTabButton = (key: "monitored" | "confirm" | "add", label: string) => (
    <TouchableOpacity
      style={[
        localStyles.tabButton,
        activeTab === key && localStyles.tabButtonActive,
      ]}
      onPress={() => setActiveTab(key)}
    >
      <Text
        style={[
          localStyles.tabButtonText,
          activeTab === key && localStyles.tabButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["top"]} style={localStyles.safeOrange}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient colors={["#EF6C00", "#FB8C00"]} style={styles.header}>
            <View style={styles.centerHeader}>
              <Text style={styles.greeting}>Giám sát</Text>
              <Text style={styles.subGreeting}>Quản lý giám sát và thông báo</Text>
            </View>
          </LinearGradient>

          <View style={localStyles.tabsRow}>
            {renderTabButton("monitored", "Đang giám sát")}
            {renderTabButton("confirm", "Xác nhận giám sát")}
            {renderTabButton("add", "Thêm giám sát")}
          </View>

          {user?.id ? (
            <View style={{ flex: 1 }}>
              {activeTab === "monitored" && <MonitoredTab userId={user.id} />}
              {activeTab === "confirm" && <ConfirmMonitorTab userId={user.id} />}
              {activeTab === "add" && <AddMonitorTab userId={user.id} />}
            </View>
          ) : (
            <View style={localStyles.emptyState}>
              <Text style={localStyles.emptyText}>Vui lòng đăng nhập để xem thông tin giám sát.</Text>
            </View>
          )}

          {notificationMessage ? (
            <View style={localStyles.notificationBar}>
              <Text style={localStyles.notificationText}>{notificationMessage}</Text>
            </View>
          ) : null}

          <View style={{ height: 0 }} />
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
  tabsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: "#FFF3E0",
    padding: 6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#FB8C00",
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#BF360C",
  },
  tabButtonTextActive: {
    color: "#FFFFFF",
  },
  emptyState: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#FFF8E1",
  },
  emptyText: {
    color: "#795548",
    fontSize: 14,
  },
  notificationBar: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFF3E0",
  },
  notificationText: {
    color: "#BF360C",
    fontWeight: "700",
  },
});
