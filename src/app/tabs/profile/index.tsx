import { Profile } from "@/api/models/user.model";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "../../../context/AuthContext";
import { useProfileContext } from "../../../hooks/profile-context";
import { styles } from "../../../styles/appStyles";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Profile | null>(null);
  const [notifyFamily, setNotifyFamily] = useState(true);
  const [heartAlert, setHeartAlert] = useState(true);
  const [gpsTracking, setGpsTracking] = useState(true);
  const { logout, user } = useAuth();
  const { profile, refreshProfileData } = useProfileContext();

  const handleGetProfile = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await refreshProfileData();
    } catch (error: any) {
      Alert.alert("Đăng nhập thất bại", error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setData(profile);
  }, [profile]);

  useEffect(() => {
    if (user?.id) {
      void handleGetProfile();
    }
  }, [user?.id]);

  return (
    <SafeAreaView style={localStyles.safePurple}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient colors={["#4A148C", "#6A1B9A"]} style={styles.header}>
            <View style={styles.centerHeader}>
              <Text style={styles.greeting}>Hồ sơ</Text>
              <Text style={styles.subGreeting}>
                Thông tin người đeo và cài đặt
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.profileCard}>
            <View style={styles.avatarWrap}>
              <Ionicons name="person" size={42} color="#6A1B9A" />
            </View>
            <Text style={styles.profileName}>{data?.full_name ?? ""}</Text>
            <Text style={styles.profileRole}>Người đeo vòng sức khỏe</Text>

            <View style={styles.profileTagRow}>
              <View style={styles.profileTag}>
                <Text style={styles.profileTagText}>
                  Tuổi: {data?.age ?? "?"}
                </Text>
              </View>
              <View style={styles.profileTag}>
                <Text style={styles.profileTagText}>
                  {data?.gender == "male"
                    ? "Nam"
                    : data?.gender == "female"
                      ? "Nữ"
                      : "Khác"}
                </Text>
              </View>
              <View style={styles.profileTag}>
                <Text style={styles.profileTagText}>Nhóm nguy cơ</Text>
              </View>
            </View>
            <TouchableOpacity
              style={localStyles.editButton}
              onPress={() => router.push("/tabs/profile/edit")}
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={localStyles.editButtonText}>Cập nhật thông tin</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons
                name="person-circle-outline"
                size={22}
                color="#1565C0"
              />
              <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Họ và tên</Text>
              <Text style={styles.infoValue}>{data?.full_name ?? ""}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <Text style={styles.infoValue}>{data?.phone ?? ""}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Người liên hệ khẩn cấp</Text>
              <Text style={styles.infoValue}>
                {data?.emergency_contact_name ?? ""}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>SĐT liên hệ khẩn cấp</Text>
              <Text style={styles.infoValue}>
                {data?.emergency_contact_phone ?? ""}
              </Text>
            </View>

            <View style={styles.infoItemNoBorder}>
              <Text style={styles.infoLabel}>Thiết bị đang dùng</Text>
              <Text style={styles.infoValue}>{data?.model_name ?? ""}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="settings-outline" size={22} color="#1565C0" />
              <Text style={styles.cardTitle}>Cài đặt theo dõi</Text>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                Gửi cảnh báo cho người thân
              </Text>
              <Switch value={notifyFamily} onValueChange={setNotifyFamily} />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                Cảnh báo nhịp tim bất thường
              </Text>
              <Switch value={heartAlert} onValueChange={setHeartAlert} />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Theo dõi GPS liên tục</Text>
              <Switch value={gpsTracking} onValueChange={setGpsTracking} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons
                name="document-text-outline"
                size={22}
                color="#1565C0"
              />
              <Text style={styles.cardTitle}>Tóm tắt sức khỏe</Text>
            </View>

            <Text style={styles.profileSummaryText}>
              Người đeo đang sử dụng thiết bị để theo dõi nhịp tim và vị trí
              hằng ngày. Hệ thống AI sẽ phát hiện dấu hiệu bất thường về nhịp
              tim và gửi cảnh báo khi cần thiết.
            </Text>
          </View>

          <TouchableOpacity
            style={{
              marginHorizontal: 16,
              marginTop: 16,
              backgroundColor: "#D32F2F",
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
            }}
            onPress={() => {
              Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất không?", [
                { text: "Hủy", style: "cancel" },
                {
                  text: "Đăng xuất",
                  style: "destructive",
                  onPress: () => {
                    logout();
                    router.replace("/auth/login");
                  },
                },
              ]);
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
              Đăng xuất
            </Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safePurple: {
    flex: 1,
    backgroundColor: "#4A148C",
  },
  editButton: {
    marginTop: 16,
    backgroundColor: "#6A1B9A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 8,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
