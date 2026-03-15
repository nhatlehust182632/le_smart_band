import { Ionicons } from "@expo/vector-icons";
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

export default function LocationScreen() {
  return (
    <SafeAreaView style={localStyles.safeGreen}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient colors={["#1B5E20", "#2E7D32"]} style={styles.header}>
            <View style={styles.centerHeader}>
              <Text style={styles.greeting}>Định vị</Text>
              <Text style={styles.subGreeting}>
                Theo dõi vị trí của người đeo
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="location" size={22} color="#2E7D32" />
              <Text style={styles.cardTitle}>Bản đồ vị trí hiện tại</Text>
            </View>

            <View style={styles.locationMap}>
              <Ionicons name="map" size={56} color="#2E7D32" />
              <View style={styles.locationPin}>
                <Ionicons name="location-sharp" size={28} color="#E53935" />
              </View>
              <Text style={styles.locationMapTitle}>Khu vực hiện tại</Text>
              <Text style={styles.locationMapSub}>Hai Bà Trưng, Hà Nội</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="navigate-circle" size={22} color="#1565C0" />
              <Text style={styles.cardTitle}>Thông tin định vị</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Vị trí cuối cùng</Text>
              <Text style={styles.infoValue}>Công viên Thống Nhất</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Thời gian cập nhật</Text>
              <Text style={styles.infoValue}>10:32 AM - 13/03/2026</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Độ chính xác</Text>
              <Text style={styles.infoValue}>12 mét</Text>
            </View>

            <View style={styles.infoItemNoBorder}>
              <Text style={styles.infoLabel}>Trạng thái GPS</Text>
              <Text style={[styles.infoValue, { color: "#2E7D32" }]}>
                Đang hoạt động
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="time-outline" size={22} color="#1565C0" />
              <Text style={styles.cardTitle}>Lịch sử di chuyển</Text>
            </View>

            <View style={styles.historyItem}>
              <Text style={styles.historyTime}>10:32</Text>
              <Text style={styles.historyValue}>Công viên Thống Nhất</Text>
            </View>

            <View style={styles.historyItem}>
              <Text style={styles.historyTime}>09:50</Text>
              <Text style={styles.historyValue}>Phố Huế</Text>
            </View>

            <View style={styles.historyItem}>
              <Text style={styles.historyTime}>08:40</Text>
              <Text style={styles.historyValue}>Bệnh viện Bạch Mai</Text>
            </View>

            <View style={styles.historyItem}>
              <Text style={styles.historyTime}>07:15</Text>
              <Text style={styles.historyValue}>Nhà riêng</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="shield-checkmark" size={22} color="#2E7D32" />
              <Text style={styles.cardTitle}>Vùng an toàn</Text>
            </View>

            <Text style={styles.safeZoneText}>
              Người đeo hiện vẫn nằm trong vùng an toàn đã thiết lập. Chưa phát
              hiện di chuyển ra ngoài khu vực cảnh báo.
            </Text>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeGreen: {
    flex: 1,
    backgroundColor: "#1B5E20",
  },
});
