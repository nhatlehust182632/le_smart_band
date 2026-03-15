import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
import { styles } from "../../styles/appStyles";

export default function HomeScreen() {
  const heartRate = 152;
  const isAbnormal = heartRate > 120;

  return (
    <SafeAreaView style={localStyles.safeBlue}>
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
              onPress={() => router.push("../heart-rate")}
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
                  name="bluetooth-connect"
                  size={24}
                  color="#1565C0"
                />
              </View>
              <Text style={styles.quickTitle}>Quét thiết bị</Text>
              <Text style={styles.quickDesc}>Tìm và kết nối vòng tay</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => router.push("../heart-rate")}
            >
              <View style={[styles.quickIcon, { backgroundColor: "#FCE4EC" }]}>
                <FontAwesome5 name="heartbeat" size={22} color="#E53935" />
              </View>
              <Text style={styles.quickTitle}>Nhịp tim</Text>
              <Text style={styles.quickDesc}>Theo dõi bất thường</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => router.push("../location")}
            >
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

              <TouchableOpacity
                style={styles.mapActionBtn}
                onPress={() => router.push("../location")}
              >
                <Text style={styles.mapActionBtnText}>Mở màn hình định vị</Text>
              </TouchableOpacity>
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

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeBlue: {
    flex: 1,
    backgroundColor: "#0D47A1",
  },
});
