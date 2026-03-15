import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/appStyles";

export default function ProfileScreen() {
  const [notifyFamily, setNotifyFamily] = React.useState(true);
  const [heartAlert, setHeartAlert] = React.useState(true);
  const [gpsTracking, setGpsTracking] = React.useState(true);
  const { logout } = useAuth();

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
            <Text style={styles.profileName}>Nguyễn Văn Nam</Text>
            <Text style={styles.profileRole}>Người đeo vòng sức khỏe</Text>

            <View style={styles.profileTagRow}>
              <View style={styles.profileTag}>
                <Text style={styles.profileTagText}>Tuổi: 67</Text>
              </View>
              <View style={styles.profileTag}>
                <Text style={styles.profileTagText}>Nam</Text>
              </View>
              <View style={styles.profileTag}>
                <Text style={styles.profileTagText}>Nhóm nguy cơ</Text>
              </View>
            </View>
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
              <Text style={styles.infoValue}>Nguyễn Văn Nam</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <Text style={styles.infoValue}>0901 234 567</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Người liên hệ khẩn cấp</Text>
              <Text style={styles.infoValue}>Nguyễn Thị Lan</Text>
            </View>

            <View style={styles.infoItemNoBorder}>
              <Text style={styles.infoLabel}>Thiết bị đang dùng</Text>
              <Text style={styles.infoValue}>VSK Smart Band A1</Text>
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
              logout();
              router.replace("/auth/login");
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
});
