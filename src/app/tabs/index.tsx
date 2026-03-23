import { useAuth } from "@/context/AuthContext";
import { heartRateHook } from "@/hooks/heartRate";
import { userDevice } from "@/hooks/userDevice";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router } from "expo-router";
import { Pedometer } from "expo-sensors";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { styles } from "../../styles/appStyles";

type Device = {
  model_name: string;
  id?: number;
};
type Curren = {
  latitude: number;
  longitude: number;
  updatedAt: string;
};
type HeartRate = {
  model_name: string;
  max_bpm: string;
  min_bpm: string;
  avg_bpm: string;
  latest_bpm: string;
};
export default function HomeScreen() {
  // const heartRate = 110;
  const [heartRate, setHeartRate] = useState<HeartRate | null>();
  // const isAbnormal = heartRate.model_name > 120 || 80 > heartRate?.model_name; // đánh giá nhịp tim, sau sẽ phải viết bằng hàm
  const isAbnormal = true;
  const { getInfoDevice } = userDevice();
  const { getInfoHeartRateByUser } = heartRateHook();
  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState<Device | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Curren | null>();
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [stepCount, setStepCount] = useState<number>(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<
    boolean | null
  >(null);

  // hàm lấy vị trí từ điện thoại
  const handleGetCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Thông báo", "Bạn chưa cấp quyền truy cập vị trí");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      setCurrentLocation({
        latitude,
        longitude,
        updatedAt: new Date().toLocaleString(),
      });

      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (address && address.length > 0) {
        const first = address[0];
        const fullAddress = [
          first.name,
          first.street,
          first.district,
          first.city,
          first.region,
          first.country,
        ]
          .filter(Boolean)
          .join(", ");

        setLocationAddress(fullAddress);
      }
    } catch (error) {
      console.log("Lỗi lấy vị trí:", error);
      Alert.alert("Lỗi", "Không lấy được vị trí hiện tại");
    }
  };

  const { user } = useAuth();
  // hàm lấy số bước chân hôm nay
  const handleGetTodaySteps = async () => {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(isAvailable);

      if (!isAvailable) {
        Alert.alert("Thông báo", "Thiết bị không hỗ trợ đếm bước chân");
        return;
      }

      // Xin quyền nếu cần
      const permission = await Pedometer.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Thông báo",
          "Bạn chưa cấp quyền truy cập dữ liệu bước chân",
        );
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const result = await Pedometer.getStepCountAsync(start, end);
      setStepCount(result.steps || 0);
    } catch (error) {
      console.log("Lỗi lấy số bước:", error);
      Alert.alert("Lỗi", "Không lấy được số bước chân hôm nay");
    }
  };
  // lấy thông tin thiết bị
  const handleGetDevice = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const data = await getInfoDevice(user?.id || "");
      console.log("device: " + data);
      setDevice(data);
    } catch (error: any) {
      Alert.alert("Đăng nhập thất bại", error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };
  // Cập nhật realtime khi người dùng đang đi
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const subscribeSteps = async () => {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) return;

      const permission = await Pedometer.requestPermissionsAsync();
      if (!permission.granted) return;

      subscription = Pedometer.watchStepCount((result) => {
        setStepCount((prev) => {
          const next = result.steps;
          return next > prev ? next : prev;
        });
      });
    };

    subscribeSteps();

    return () => {
      subscription?.remove();
    };
  }, []);
  // lấy thông tin nhịp tim mới nhất
  const handleGetHeartRate = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const data = await getInfoHeartRateByUser(user?.id || "");
      setHeartRate(data);
    } catch (error) {
      console.log("Lỗi lấy nhịp tim:", error);
    }
  };

  useEffect(() => {
    handleGetDevice();
    handleGetCurrentLocation();
    handleGetTodaySteps();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    // gọi lần đầu
    handleGetHeartRate();

    // lặp mỗi 0.5 phút
    const interval = setInterval(() => {
      handleGetHeartRate();
    }, 30000); // 30000ms = 0.5 phút

    // cleanup khi unmount
    return () => clearInterval(interval);
  }, [user?.id]);

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
                <Text style={styles.greeting}>Xin chào, {user?.name}</Text>
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
                <Text style={styles.deviceName}>{device?.model_name}</Text>
                {/* <Text style={styles.deviceStatus}>Đã kết nối</Text> */}
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
                <Text style={styles.heartValue}>
                  {heartRate?.latest_bpm} BPM
                </Text>
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

          <View style={localStyles.quickGrid}>
            <TouchableOpacity style={localStyles.quickCard}>
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
              style={localStyles.quickCard}
              onPress={() => router.push("../heart-rate")}
            >
              <View style={[styles.quickIcon, { backgroundColor: "#FCE4EC" }]}>
                <FontAwesome5 name="heartbeat" size={22} color="#E53935" />
              </View>
              <Text style={styles.quickTitle}>Nhịp tim</Text>
              <Text style={styles.quickDesc}>Theo dõi bất thường</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={localStyles.quickCard}
              onPress={() => router.push("../location")}
            >
              <View style={[styles.quickIcon, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons name="location" size={24} color="#2E7D32" />
              </View>
              <Text style={styles.quickTitle}>Định vị</Text>
              <Text style={styles.quickDesc}>Xem vị trí cuối cùng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={localStyles.quickCard}
              onPress={() => router.push("../monitor")}
            >
              <View style={[styles.quickIcon, { backgroundColor: "#FFF3E0" }]}>
                <MaterialCommunityIcons
                  name="account-eye"
                  size={24}
                  color="#EF6C00"
                />
              </View>
              <Text style={styles.quickTitle}>Giám sát</Text>
              <Text style={styles.quickDesc}>Theo dõi người thân</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="location" size={22} color="#2E7D32" />
              <Text style={styles.cardTitle}>Vị trí hiện tại</Text>
            </View>

            {currentLocation ? (
              <>
                <View
                  style={{
                    height: 220,
                    borderRadius: 16,
                    overflow: "hidden",
                    marginTop: 12,
                  }}
                >
                  <MapView
                    style={{ flex: 1 }}
                    region={{
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                      }}
                      title="Vị trí hiện tại"
                      description={locationAddress || "Đang cập nhật địa chỉ"}
                    />
                  </MapView>
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={styles.mapText}>
                    {locationAddress || "Đang lấy địa chỉ..."}
                  </Text>
                  <Text style={styles.mapSubText}>
                    Cập nhật lúc: {currentLocation.updatedAt}
                  </Text>

                  <TouchableOpacity
                    style={styles.mapActionBtn}
                    onPress={handleGetCurrentLocation}
                  >
                    <Text style={styles.mapActionBtnText}>Lấy lại vị trí</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.mapPlaceholder}>
                <Ionicons name="locate" size={42} color="#90A4AE" />
                <Text style={styles.mapText}>Đang lấy vị trí hiện tại...</Text>
              </View>
            )}
          </View>

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
                <Text style={styles.summaryNumber}>{heartRate?.avg_bpm}</Text>
                <Text style={styles.summaryLabel}>Nhịp tim TB</Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryNumber}>0</Text>
                <Text style={styles.summaryLabel}>Cảnh báo hôm nay</Text>
              </View>
            </View>
            {/* <TouchableOpacity
              onPress={handleGetTodaySteps}
              // style={{ marginBottom: 10, marginTop: -10 }}
              style={styles.mapActionBtn}
            >
              <Text style={styles.mapActionBtnText}>Cập nhật hôm nay</Text>
            </TouchableOpacity> */}
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
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  quickCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
});
