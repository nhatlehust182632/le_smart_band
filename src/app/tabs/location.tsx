import { useAuth } from "@/context/AuthContext";
import { locationPlace } from "@/hooks/location";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from "../../styles/appStyles";

type LocationCoords = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};

type HistoryItem = {
  id: string;
  time: string;
  address: string;
  latitude: number;
  longitude: number;
  visitCount?: number;
};

type TopPlaceItem = {
  address: string;
  count: number;
};

type LocationPayload = {
  id: string;
  latitude: number;
  longitude: number;
  place_key: string;
  place_name: string;
};

type InfoLocation = {
  id: string;
  latitude: string;
  longitude: string;
  place_key: string;
  place_name: string;
  created_at: string;
};

type LocationNew = {
  historyData: InfoLocation[],
  topData: InfoLocation[],
};

export default function LocationScreen() {
  const mapRef = useRef<MapView | null>(null);

  const [dataLocation, setDataLocation] = useState<LocationNew | null>(null);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [address, setAddress] = useState<string>("Đang lấy vị trí...");
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [gpsStatus, setGpsStatus] = useState<string>("Đang kiểm tra...");
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const lastSavedPlaceKeyRef = useRef<string>("");
  const { savePlaceNow, getListHistory } = locationPlace();
  const { user } = useAuth();

  // lay vị tri lien tuc khi phace_key thay doi
  function buildPlaceKeyFromCoords(latitude: number, longitude: number) {
    return `${latitude.toFixed(3)}_${longitude.toFixed(3)}`;
  }

  const buildLocationPayload = (
    latitude: number,
    longitude: number,
    placeName: string,
    id: string
  ): LocationPayload => {
    return {
      id,
      latitude,
      longitude,
      place_key: buildPlaceKeyFromCoords(latitude, longitude),
      place_name: placeName,
    };
  };

  const saveLocationToDatabase = async (payload: LocationPayload) => {
    try {
      // console.log("LOCATION PAYLOAD =>", payload);
      setLoading(true);
      const data = await savePlaceNow(payload);

      setDataLocation(data);
    } catch (error) {
      console.log("Save location error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveLocationIfNeeded = async (
    latitude: number,
    longitude: number,
    placeName: string
  ) => {
    const payload = buildLocationPayload(latitude, longitude, placeName, user?.id || "");

    const currentKey = payload.place_key;
    const lastKey = lastSavedPlaceKeyRef.current;

    // console.log("===== LOCATION DEBUG =====");
    // console.log("Place name:", placeName);
    // console.log("Latitude:", latitude);
    // console.log("Longitude:", longitude);
    // console.log("New place_key:", currentKey);
    // console.log("Last place_key:", lastKey);
    // console.log("Last place_name:", placeName);

    // Lần đầu
    if (!lastKey) {
      // console.log("👉 FIRST SAVE");
      await saveLocationToDatabase(payload);
      lastSavedPlaceKeyRef.current = currentKey;
      return;
    }

    // Không đổi vị trí
    if (currentKey === lastKey) {
      // console.log("⛔ SKIP - SAME PLACE");
      return;
    }

    // Di chuyển sang nơi mới
    // console.log("✅ SAVE - NEW PLACE");
    await saveLocationToDatabase(payload);
    lastSavedPlaceKeyRef.current = currentKey;
  };

  //

  const addToHistory = (
    latitude: number,
    longitude: number,
    currentAddress: string
  ) => {
    const normalizedAddress = normalizeAddress(currentAddress);

    setHistory((prev) => {
      const matchedItem = prev.find(
        (item) =>
          normalizeAddress(item.address) === normalizedAddress ||
          (Math.abs(item.latitude - latitude) < 0.00015 &&
            Math.abs(item.longitude - longitude) < 0.00015)
      );

      if (matchedItem) {
        return prev.map((item) =>
          item.id === matchedItem.id
            ? {
              ...item,
              time: formatDateTime(new Date()),
              latitude,
              longitude,
              address: currentAddress,
              visitCount: (item.visitCount || 1) + 1,
            }
            : item
        );
      }

      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random()}`,
        time: formatDateTime(new Date()),
        address: currentAddress,
        latitude,
        longitude,
        visitCount: 1,
      };

      return [newItem, ...prev].slice(0, 30);
    });
  };

  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const reverse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverse.length > 0) {
        const place = reverse[0];
        const fullAddress = [
          place.name,
          place.street,
          place.district,
          place.city,
          place.region,
        ]
          .filter(Boolean)
          .join(", ");

        return fullAddress || "Không xác định được địa chỉ";
      }

      return "Không xác định được địa chỉ";
    } catch (error) {
      console.log("Reverse geocode error:", error);
      return "Không xác định được địa chỉ";
    }
  };

  const getLocationOnce = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setGpsStatus("Không được cấp quyền");
        setAddress("Bạn chưa cấp quyền truy cập vị trí");
        Alert.alert(
          "Thiếu quyền vị trí",
          "Vui lòng cấp quyền truy cập vị trí để hiển thị bản đồ hiện tại."
        );
        return;
      }

      setGpsStatus("Đang hoạt động");

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy,
      };

      setLocation(coords);
      setUpdatedAt(formatDateTime(new Date()));

      mapRef.current?.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );

      const fullAddress = await getAddressFromCoords(
        coords.latitude,
        coords.longitude
      );

      setAddress(fullAddress);
      addToHistory(coords.latitude, coords.longitude, fullAddress);

      await saveLocationIfNeeded(
        coords.latitude,
        coords.longitude,
        fullAddress
      );
    } catch (error) {
      console.log("Location error:", error);
      setGpsStatus("Lỗi");
      setAddress("Không thể lấy vị trí hiện tại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const initLocation = async () => {
      await getLocationOnce();

      try {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 5,
          },
          async (newLocation) => {
            const newCoords = {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              accuracy: newLocation.coords.accuracy,
            };

            setLocation(newCoords);
            setUpdatedAt(formatDateTime(new Date()));

            mapRef.current?.animateToRegion(
              {
                latitude: newCoords.latitude,
                longitude: newCoords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              1000
            );

            const fullAddress = await getAddressFromCoords(
              newCoords.latitude,
              newCoords.longitude
            );

            setAddress(fullAddress);
            addToHistory(newCoords.latitude, newCoords.longitude, fullAddress);

            await saveLocationIfNeeded(
              newCoords.latitude,
              newCoords.longitude,
              fullAddress
            );
          }
        );
      } catch (e) {
        console.log("Watch location error:", e);
      }
    };

    initLocation();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const region = useMemo(() => {
    return {
      latitude: location?.latitude || 21.0278,
      longitude: location?.longitude || 105.8342,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }, [location]);

  const topPlaces: TopPlaceItem[] = useMemo(() => {
    const placeMap = new Map<string, number>();

    history.forEach((item) => {
      const key = normalizeAddress(item.address);
      if (!key) return;

      placeMap.set(key, (placeMap.get(key) || 0) + (item.visitCount || 1));
    });

    return Array.from(placeMap.entries())
      .map(([addr, count]) => ({
        address: addr,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [history]);

  console.log("place_name: " + dataLocation?.historyData);

  return (
    <SafeAreaView style={localStyles.safeGreen}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient colors={["#1B5E20", "#2E7D32"]} style={styles.header}>
            <View style={styles.centerHeader}>
              <Text style={styles.greeting}>Định vị</Text>
              <Text style={styles.subGreeting}>
                Theo dõi vị trí hiện tại và lịch sử di chuyển
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="location" size={22} color="#2E7D32" />
              <Text style={styles.cardTitle}>Bản đồ vị trí hiện tại</Text>
            </View>

            <View style={localStyles.mapContainer}>
              {loading ? (
                <View style={localStyles.loadingBox}>
                  <ActivityIndicator size="large" color="#2E7D32" />
                  <Text style={localStyles.loadingText}>Đang tải bản đồ...</Text>
                </View>
              ) : (
                <MapView
                  ref={mapRef}
                  style={localStyles.map}
                  initialRegion={region}
                  showsUserLocation
                  showsMyLocationButton
                >
                  {location && (
                    <Marker
                      coordinate={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                      }}
                      title="Vị trí hiện tại"
                      description={address}
                    />
                  )}
                </MapView>
              )}
            </View>

            <Text style={styles.locationMapTitle}>Vị trí hiện tại</Text>
            <Text style={styles.locationMapSub}>{address}</Text>

            <TouchableOpacity
              style={localStyles.refreshButton}
              onPress={getLocationOnce}
            >
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={localStyles.refreshButtonText}>Lấy lại vị trí</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="navigate-circle" size={22} color="#1565C0" />
              <Text style={styles.cardTitle}>Thông tin định vị</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Vĩ độ</Text>
              <Text style={styles.infoValue}>
                {location ? location.latitude.toFixed(6) : "--"}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Kinh độ</Text>
              <Text style={styles.infoValue}>
                {location ? location.longitude.toFixed(6) : "--"}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Thời gian cập nhật</Text>
              <Text style={styles.infoValue}>{updatedAt || "--"}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Độ chính xác</Text>
              <Text style={styles.infoValue}>
                {location?.accuracy ? `${Math.round(location.accuracy)} mét` : "--"}
              </Text>
            </View>

            <View style={styles.infoItemNoBorder}>
              <Text style={styles.infoLabel}>Trạng thái GPS</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: gpsStatus === "Đang hoạt động" ? "#2E7D32" : "#E53935" },
                ]}
              >
                {gpsStatus}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="time-outline" size={22} color="#1565C0" />
              <Text style={styles.cardTitle}>Lịch sử di chuyển</Text>
            </View>

            {/* {history.length === 0 ? ( */}
            {/* {dataHistory.length === 0 ? ( */}
            {!dataLocation || dataLocation?.historyData == null || dataLocation.historyData.length === 0 ? (
              <Text style={localStyles.emptyText}>Chưa có dữ liệu di chuyển</Text>
            ) : (
              dataLocation.historyData.map((item) => (
                <View key={item.id} style={localStyles.historyItem}>
                  <View style={localStyles.historyHeaderRow}>
                    <Text style={localStyles.historyTime}>{formatDateTimeV2(item.created_at)}</Text>
                    {/* <Text style={localStyles.historyBadge}>
                      {(item.visitCount || 1)} lần
                    </Text> */}
                  </View>

                  <Text style={localStyles.historyAddress}>{item.place_name}</Text>

                  {/* <Text style={localStyles.historyCoords}>
                    {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                  </Text> */}
                </View>
              ))
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="trophy-outline" size={22} color="#FF8F00" />
              <Text style={styles.cardTitle}>Top 3 vị trí đến nhiều nhất</Text>
            </View>

            {/* {topPlaces.length === 0 ? ( */}
            {!dataLocation || dataLocation?.topData == null || dataLocation.topData.length === 0 ? (
              <Text style={localStyles.emptyText}>Chưa có dữ liệu để thống kê</Text>
            ) : (
              dataLocation.topData.map((place, index) => (
                <View
                  key={`${place.place_key}-${index}`}
                  style={[
                    localStyles.topPlaceItem,
                    index === topPlaces.length - 1 && {
                      borderBottomWidth: 0,
                      paddingBottom: 0,
                    },
                  ]}
                >
                  <View style={localStyles.rankCircle}>
                    <Text style={localStyles.rankText}>{index + 1}</Text>
                  </View>

                  <View style={localStyles.topPlaceContent}>
                    <Text style={localStyles.topPlaceAddress}>
                      {place.place_name}
                    </Text>
                    {/* <Text style={localStyles.topPlaceCount}>
                      Đã đến {place.count} lần
                    </Text> */}
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function normalizeAddress(value: string) {
  return value.trim().toLowerCase();
}

function formatDateTime(date: Date) {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${hh}:${mm} - ${dd}/${MM}/${yyyy}`;
}

function formatDateTimeV2(isoString: string) {
  const date = new Date(isoString);

  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");

  const dd = String(date.getDate()).padStart(2, "0");
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${hh}:${mm} - ${dd}/${MM}/${yyyy}`;
}

const localStyles = StyleSheet.create({
  safeGreen: {
    flex: 1,
    backgroundColor: "#1B5E20",
  },
  mapContainer: {
    height: 260,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: "#F1F8E9",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "500",
  },
  refreshButton: {
    marginTop: 8,
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    paddingVertical: 12,
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 10,
  },
  historyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1565C0",
  },
  historyBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  historyAddress: {
    fontSize: 14,
    color: "#212121",
    fontWeight: "600",
    marginBottom: 3,
  },
  historyCoords: {
    fontSize: 12,
    color: "#777",
  },
  topPlaceItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 12,
  },
  rankCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF8F00",
  },
  topPlaceContent: {
    flex: 1,
  },
  topPlaceAddress: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  topPlaceCount: {
    fontSize: 13,
    color: "#666",
  },
});