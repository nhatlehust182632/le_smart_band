import { useAuth } from "@/context/AuthContext";
import { devicesSource } from "@/data-sources/devicesSource";
// import { heartRateHook } from "@/hooks/heartRate";
// import { userDevice } from "@/hooks/userDevice";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Buffer } from "buffer";
import { LinearGradient } from "expo-linear-gradient";
// import * as Location from "expo-location";
import { router } from "expo-router";
// import { Pedometer } from "expo-sensors";
import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  // Alert,
  FlatList,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BleManager, Device, Subscription } from "react-native-ble-plx";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from "../../styles/appStyles";

type UserDeviceInfo = {
  model_name: string;
  id?: number;
  idDevices?: string;
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

type ReadTarget = {
  serviceUUID: string;
  charUUID: string;
};

type DeviceDataPayload = {
  user_device_id: string;
  bpm: number;
};

export default function HomeScreen() {
  const { user } = useAuth();
  // const { getInfoDevice } = userDevice();
  // const { getInfoHeartRateByUser } = heartRateHook();

  const [heartRate, setHeartRate] = useState<HeartRate | null>(null);
  // const [loading, setLoading] = useState(false);
  // const [device, setDevice] = useState<UserDeviceInfo | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Curren | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [stepCount, setStepCount] = useState<number>(0);
  // const [, setIsPedometerAvailable] = useState<boolean | null>(null);
  const [scanModalVisible, setScanModalVisible] = useState(false);

  const latestBpm = Number(heartRate?.latest_bpm ?? 0);
  const isAbnormal = latestBpm > 120 || (latestBpm > 0 && latestBpm < 50);

  // =========================
  // Conect thiết bị BLE được chọn
  // =========================
  // const manager = new BleManager();

  const managerRef = useRef<BleManager | null>(null);

  if (!managerRef.current) {
    managerRef.current = new BleManager({
      restoreStateIdentifier: "SmartBandBleManager",
      restoreStateFunction: (restoredState) => {
        if (!restoredState) {
          console.log("BLE RESTORE: Không có trạng thái BLE cần khôi phục");
          return;
        }

        console.log("BLE RESTORE STATE:", restoredState);
      },
    });
  }

  const manager = managerRef.current;

  const [devices, setDevices] = useState<Device[]>([]);
  const [bleState, setBleState] = useState("Unknown");
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState("Chưa kết nối");
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  const notifySubs = useRef<Subscription[]>([]);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const deviceDataQueueRef = useRef<DeviceDataPayload[]>([]);
  const saveDeviceDataTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoConnectingRef = useRef(false);
  const skipSaveAfterAutoConnectRef = useRef(false);

  const decodeBase64 = (value: string) => {
    const buffer = Buffer.from(value, "base64");
    const bytes = Array.from(buffer);
    // console.log("hex BYTES:", buffer);
    console.log("DEC BYTES:", bytes);
    return {
      hex: buffer.toString("hex"),
      ascii: buffer.toString("ascii"),
      dec: bytes,
      base64: value,
    };
  };

  const printData = async (
    source: string,
    serviceUUID: string,
    charUUID: string,
    value: string
  ) => {
    const data = decodeBase64(value);

    console.log(`
      DATA RECEIVED [${source}]
      SERVICE: ${serviceUUID}
      CHAR: ${charUUID}
      HEX: ${data.hex}
      ASCII: ${data.ascii}
      DEC: ${data.dec}
      BASE64: ${data.base64}
      ----------------------
      `);

    if (!connectedDevice?.id) return;
    if (!user?.id) return;
    if (data.dec.length === 0) return;

    const payload: DeviceDataPayload = {
      user_device_id: user.id,
      bpm: 75, // tạm thời hardcode, sau này parse từ data.dec
    };

    // Tạm thời gom vào queue
    // Sau này API có rồi thì batch gửi lên backend
    deviceDataQueueRef.current.push(payload);

    console.log("DEVICE DATA QUEUE:", deviceDataQueueRef.current.length);
  };

  const flushDeviceDataQueue = async () => {
    try {
      if (deviceDataQueueRef.current.length === 0) return;

      const payloads = [...deviceDataQueueRef.current];

      // Xóa queue trước để tránh gửi trùng khi API chậm
      deviceDataQueueRef.current = [];

      console.log("DỮ LIỆU CHUẨN BỊ GỬI API:", payloads);

      // =========================
      // API sẽ bổ sung sau
      // Ví dụ:
      // const response = await devicesSource.saveDeviceData(payloads);
      //
      // if (!response?.success) {
      //   // Nếu lưu lỗi thì đưa lại vào queue
      //   deviceDataQueueRef.current = [
      //     ...payloads,
      //     ...deviceDataQueueRef.current,
      //   ];
      // }
      // =========================

    } catch (error) {
      console.log("Lỗi khi lưu dữ liệu thiết bị:", error);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== "android") return true;

    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);

    return Object.values(granted).every(
      (v) => v === PermissionsAndroid.RESULTS.GRANTED
    );
  };

  const stopAll = () => {
    notifySubs.current.forEach((s) => s.remove());
    notifySubs.current = [];

    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }

    manager.stopDeviceScan();
  };

  useEffect(() => {
    const sub = manager.onStateChange((state) => {
      setBleState(state);
    }, true);

    return () => {
      stopAll();

      if (saveDeviceDataTimerRef.current) {
        clearInterval(saveDeviceDataTimerRef.current);
        saveDeviceDataTimerRef.current = null;
      }
      sub.remove();
      manager.destroy();
    };
  }, []);

  const startScan = async () => {
    setScanModalVisible(true);
    const ok = await requestPermissions();

    if (!ok) {
      setStatus("Chưa cấp quyền Bluetooth");
      return;
    }

    if (bleState !== "PoweredOn") {
      setStatus("Bluetooth chưa bật");
      return;
    }

    stopAll();
    setDevices([]);
    setConnectedDevice(null);
    deviceRef.current = null;
    setScanning(true);
    setStatus("Đang quét...");

    manager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        console.log("SCAN ERROR:", error);
        setScanning(false);
        setStatus("Lỗi quét");
        return;
      }

      if (!device) return;

      const data = await devicesSource.checkDeviceExist(device.id, user?.id || "");
      console.log("CHECK DEVICE EXIST:", data);
      // if (!data?.device_code) {
      setDevices((prev) => {
        const exists = prev.some((d) => d.id === device.id);
        return exists ? prev : [...prev, device];
      });
      // }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setScanning(false);
      // setStatus("Đã dừng quét");
    }, 10000);
  };

  const connectDevice = async (device: Device) => {
    try {
      stopAll();
      setStatus("Đang kết nối...");

      const connected = await device.connect();
      deviceRef.current = connected;

      await connected.discoverAllServicesAndCharacteristics();

      const services = await connected.services();

      setConnectedDevice(connected);
      // setStatus(`Đã kết nối: ${connected.name || connected.id}`);
      setStatus(`Đã kết nối`);

      // ========================= Cứ mỗi 5 giây gom dữ liệu đã nhận và chuẩn bị gửi API
      if (saveDeviceDataTimerRef.current) {
        clearInterval(saveDeviceDataTimerRef.current);
      }

      saveDeviceDataTimerRef.current = setInterval(() => {
        flushDeviceDataQueue();
      }, 5000);
      //
      console.log("CONNECTED:", connected.name || connected.id);

      const readableTargets: ReadTarget[] = [];

      for (const service of services) {
        const chars = await service.characteristics();

        for (const char of chars) {
          // 1. Kênh nào notify/indicate được thì subscribe hết
          if (char.isNotifiable || char.isIndicatable) {
            try {
              const sub = char.monitor((error, characteristic) => {
                if (error) {
                  console.log("NOTIFY ERROR:", {
                    serviceUUID: service.uuid,
                    charUUID: char.uuid,
                    message: error.message,
                  });
                  return;
                }

                if (characteristic?.value) {
                  printData(
                    "NOTIFY",
                    service.uuid,
                    char.uuid,
                    characteristic.value
                  );
                }
              });

              notifySubs.current.push(sub);

            } catch (e) {
              console.log("SUBSCRIBE FAILED:", {
                serviceUUID: service.uuid,
                charUUID: char.uuid,
                error: e,
              });
            }
          }

          // 2. Kênh nào read được thì lưu lại để đọc lặp
          if (char.isReadable) {
            readableTargets.push({
              serviceUUID: service.uuid,
              charUUID: char.uuid,
            });

            try {
              const readNow = await connected.readCharacteristicForService(
                service.uuid,
                char.uuid
              );

            } catch (e) {
              console.log("READ NOW ERROR:", {
                serviceUUID: service.uuid,
                charUUID: char.uuid,
                error: e,
              });
            }
          }
        }
      }

      // 4. Poll tất cả kênh readable
      if (readableTargets.length > 0) {
        pollTimer.current = setInterval(async () => {
          const dev = deviceRef.current;
          if (!dev) return;

          for (const target of readableTargets) {
            try {
              const char = await dev.readCharacteristicForService(
                target.serviceUUID,
                target.charUUID
              );

              if (char?.value) {
                printData(
                  "POLL",
                  target.serviceUUID,
                  target.charUUID,
                  char.value
                );
              }
            } catch (e) {
              // không spam log
            }
          }
        }, 1000);
      }
    } catch (e) {
      console.log("CONNECT ERROR:", e);
      setStatus("Kết nối thất bại");
    }
  };

  const disconnect = async () => {
    try {
      stopAll();

      if (saveDeviceDataTimerRef.current) {
        clearInterval(saveDeviceDataTimerRef.current);
        saveDeviceDataTimerRef.current = null;
      }

      // Gửi nốt dữ liệu còn đang nằm trong queue
      await flushDeviceDataQueue();

      // Nếu thiết bị có kết nối thì mới gọi API ngắt kết nối, tránh trường hợp lỗi khi chưa kịp kết nối đã bấm ngắt
      if (deviceRef.current) {
        await deviceRef.current.cancelConnection();
      }

      deviceRef.current = null;
      setConnectedDevice(null);
      setStatus("Đã ngắt kết nối");
    } catch (e) {
      console.log("DISCONNECT ERROR:", e);
    }
  };

  useEffect(() => {
    const handleConnectedDevice = async () => {
      if (connectedDevice) {
        console.log("Gọi API saveDevicesWithUser", connectedDevice);
        setScanModalVisible(false);
        setStatus(`Đã kết nối`);

        // Nếu đây là kết nối tự động khi mở app,
        // thiết bị đã được lưu DB rồi => không gọi save lại
        if (skipSaveAfterAutoConnectRef.current) {
          skipSaveAfterAutoConnectRef.current = false;
          return;
        }

        if (!user?.id || !connectedDevice.id || !connectedDevice.name) return;
        const dataId = await devicesSource.saveDevicesWithUser(connectedDevice.id, user?.id || '', connectedDevice.name || "");

        if (!dataId?.success) {
          console.log("Lỗi lưu thiết bị vào database:", dataId);
          setStatus("Kết nối thất bại");
          return
        }
      }
    };

    handleConnectedDevice();
  }, [connectedDevice]);

  // Tự động kết nối lại thiết bị đã lưu trong DB
  useEffect(() => {
    const autoConnectSavedDevice = async () => {
      try {
        if (!user?.id) return;
        if (!user?.device_code) return;
        if (bleState !== "PoweredOn") return;
        if (connectedDevice) return;
        if (autoConnectingRef.current) return;

        autoConnectingRef.current = true;

        const ok = await requestPermissions();
        if (!ok) {
          setStatus("Chưa cấp quyền Bluetooth");
          autoConnectingRef.current = false;
          return;
        }

        setStatus("Đang tự động tìm thiết bị đã lưu...");
        setScanning(true);

        manager.startDeviceScan(null, null, async (error, scannedDevice) => {
          if (error) {
            console.log("AUTO SCAN ERROR:", error);
            manager.stopDeviceScan();
            setScanning(false);
            setStatus("Lỗi khi tự động quét thiết bị");
            autoConnectingRef.current = false;
            return;
          }

          if (!scannedDevice) return;

          // So khớp BLE id đã lưu trong DB với id thiết bị vừa quét được
          if (scannedDevice.id === user.device_code) {
            console.log("Tìm thấy thiết bị đã lưu:", scannedDevice.id);

            manager.stopDeviceScan();
            setScanning(false);

            // Báo để useEffect connectedDevice không save DB lại lần nữa
            skipSaveAfterAutoConnectRef.current = true;

            await connectDevice(scannedDevice);
            autoConnectingRef.current = false;
          }
        });

        // Sau 10 giây nếu không thấy thì dừng quét
        setTimeout(() => {
          if (!connectedDevice) {
            manager.stopDeviceScan();
            setScanning(false);

            if (autoConnectingRef.current) {
              setStatus("Không tìm thấy thiết bị đã lưu");
              autoConnectingRef.current = false;
            }
          }
        }, 10000);
      } catch (error) {
        console.log("AUTO CONNECT ERROR:", error);
        setStatus("Tự động kết nối thất bại");
        autoConnectingRef.current = false;
      }
    };

    // autoConnectSavedDevice(); 
  }, [user?.id, user?.device_code, bleState]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      console.log("APP STATE:", nextState);

      if (nextState === "active") {
        console.log("App đang mở trên màn hình");
      }

      if (nextState === "background") {
        console.log("App đã chuyển sang background");
      }

      if (nextState === "inactive") {
        console.log("App đang inactive, có thể do khóa màn hình hoặc chuyển trạng thái");
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // // =========================
  // // Lấy vị trí hiện tại
  // // =========================
  // const handleGetCurrentLocation = async () => {
  //   try {
  //     const { status } = await Location.requestForegroundPermissionsAsync();

  //     if (status !== "granted") {
  //       Alert.alert("Thông báo", "Bạn chưa cấp quyền truy cập vị trí");
  //       return;
  //     }

  //     const location = await Location.getCurrentPositionAsync({
  //       accuracy: Location.Accuracy.High,
  //     });

  //     const { latitude, longitude } = location.coords;

  //     setCurrentLocation({
  //       latitude,
  //       longitude,
  //       updatedAt: new Date().toLocaleString(),
  //     });

  //     const address = await Location.reverseGeocodeAsync({
  //       latitude,
  //       longitude,
  //     });

  //     if (address && address.length > 0) {
  //       const first = address[0];
  //       const fullAddress = [
  //         first.name,
  //         first.street,
  //         first.district,
  //         first.city,
  //         first.region,
  //         first.country,
  //       ]
  //         .filter(Boolean)
  //         .join(", ");

  //       setLocationAddress(fullAddress);
  //     }
  //   } catch (error) {
  //     console.log("Lỗi lấy vị trí:", error);
  //     Alert.alert("Lỗi", "Không lấy được vị trí hiện tại");
  //   }
  // };

  // // =========================
  // // Lấy số bước chân hôm nay
  // // =========================
  // const handleGetTodaySteps = async () => {
  //   try {
  //     const isAvailable = await Pedometer.isAvailableAsync();
  //     setIsPedometerAvailable(isAvailable);

  //     if (!isAvailable) {
  //       Alert.alert("Thông báo", "Thiết bị không hỗ trợ đếm bước chân");
  //       return;
  //     }

  //     const permission = await Pedometer.requestPermissionsAsync();
  //     if (!permission.granted) {
  //       Alert.alert(
  //         "Thông báo",
  //         "Bạn chưa cấp quyền truy cập dữ liệu bước chân"
  //       );
  //       return;
  //     }

  //     const end = new Date();
  //     const start = new Date();
  //     start.setHours(0, 0, 0, 0);

  //     const result = await Pedometer.getStepCountAsync(start, end);
  //     setStepCount(result.steps || 0);
  //   } catch (error) {
  //     console.log("Lỗi lấy số bước:", error);
  //     Alert.alert("Lỗi", "Không lấy được số bước chân hôm nay");
  //   }
  // };

  // // =========================
  // // Lấy thông tin thiết bị từ backend
  // // =========================
  // const handleGetDevice = async () => {
  //   if (loading) return;

  //   try {
  //     setLoading(true);
  //     const data = await getInfoDevice(user?.id || "");
  //     console.log("INFO DEVICE:", data);
  //     setDevice(data);
  //   } catch (error: any) {
  //     Alert.alert("Lỗi", error.message || "Không lấy được thông tin thiết bị");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // // =========================
  // // Theo dõi bước chân realtime
  // // =========================
  // useEffect(() => {
  //   let subscription: { remove: () => void } | null = null;

  //   const subscribeSteps = async () => {
  //     const isAvailable = await Pedometer.isAvailableAsync();
  //     if (!isAvailable) return;

  //     const permission = await Pedometer.requestPermissionsAsync();
  //     if (!permission.granted) return;

  //     subscription = Pedometer.watchStepCount((result) => {
  //       setStepCount((prev) => {
  //         const next = result.steps;
  //         return next > prev ? next : prev;
  //       });
  //     });
  //   };

  //   subscribeSteps();

  //   return () => {
  //     subscription?.remove();
  //   };
  // }, []);

  // // =========================
  // // Lấy nhịp tim mới nhất từ backend
  // // =========================
  // const handleGetHeartRate = async () => {
  //   if (loading) return;

  //   try {
  //     setLoading(true);
  //     const data = await getInfoHeartRateByUser(user?.id || "");
  //     setHeartRate(data);
  //   } catch (error) {
  //     console.log("Lỗi lấy nhịp tim:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // // =========================
  // // Load dữ liệu ban đầu
  // // =========================
  // useEffect(() => {
  //   handleGetDevice();
  //   handleGetCurrentLocation();
  //   handleGetTodaySteps();
  // }, []);

  // // =========================
  // // Poll nhịp tim
  // // =========================
  // useEffect(() => {
  //   if (!user?.id) return;
  //   handleGetHeartRate();
  // }, [user?.id]);

  return (
    <SafeAreaView style={localStyles.safeBlue}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient colors={["#0D47A1", "#1976D2"]} style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Xin chào, {user?.name}</Text>
                <Text style={styles.subGreeting}>
                  Theo dõi sức khỏe mỗi ngày
                </Text>
              </View>
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
                {connectedDevice && (<Text style={styles.deviceName}>
                  {connectedDevice.name || connectedDevice.id}
                </Text>)}

                <Text style={styles.deviceStatus}>
                  {status}
                </Text>
              </View>

              {connectedDevice ? (
                <TouchableOpacity style={styles.primaryBtnNKT} onPress={disconnect}>
                  <Text style={styles.primaryBtnText}>Ngắt kết nối</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.primaryBtn} onPress={startScan}>
                  <Text style={styles.primaryBtnText}>
                    {scanning ? "Đang quét..." : "Quét thiết bị"}
                  </Text>
                </TouchableOpacity>
              )}
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
                  {heartRate?.latest_bpm ?? "--"} BPM
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
              onPress={() => router.push("../tabs/heart-rate")}
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
            <TouchableOpacity
              style={localStyles.quickCard}
              onPress={connectedDevice === null ? startScan : disconnect}
            // disabled={connectedDevice !== null}
            >
              <View style={[styles.quickIcon, { backgroundColor: "#E3F2FD" }]}>
                <MaterialCommunityIcons
                  name="bluetooth-connect"
                  size={24}
                  color="#1565C0"
                />
              </View>
              <Text style={styles.quickTitle}>{connectedDevice !== null ? "Ngắt kết nối" : "Quét thiết bị"}</Text>
              <Text style={styles.quickDesc}>{connectedDevice !== null ? connectedDevice.name || connectedDevice.id : "Tìm và kết nối vòng tay"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={localStyles.quickCard}
              onPress={() => router.push("../tabs/heart-rate")}
            >
              <View style={[styles.quickIcon, { backgroundColor: "#FCE4EC" }]}>
                <FontAwesome5 name="heartbeat" size={22} color="#E53935" />
              </View>
              <Text style={styles.quickTitle}>Nhịp tim</Text>
              <Text style={styles.quickDesc}>Theo dõi bất thường</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={localStyles.quickCard}
              onPress={() => router.push("../tabs/location")}
            >
              <View style={[styles.quickIcon, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons name="location" size={24} color="#2E7D32" />
              </View>
              <Text style={styles.quickTitle}>Định vị</Text>
              <Text style={styles.quickDesc}>Xem vị trí cuối cùng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={localStyles.quickCard}
              onPress={() => router.push("../tabs/monitor")}
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
                <Text style={styles.summaryNumber}>
                  {heartRate?.avg_bpm ?? "--"}
                </Text>
                <Text style={styles.summaryLabel}>Nhịp tim TB</Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryNumber}>0</Text>
                <Text style={styles.summaryLabel}>Cảnh báo hôm nay</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        <Modal
          visible={scanModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => {
            setScanModalVisible(false);
          }}
        >
          <View style={localStyles.modalOverlay}>
            <View style={localStyles.modalContent}>
              <View style={localStyles.modalHeader}>
                <Text style={localStyles.modalTitle}>Thiết bị BLE tìm thấy</Text>
                <TouchableOpacity
                  onPress={() => {
                    setScanModalVisible(false);
                  }}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={devices?.filter((d) => d.name)} // chỉ hiển thị thiết bị có tên
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={localStyles.deviceItemBLE}
                    onPress={() => connectDevice(item)}
                  >
                    <Text style={localStyles.deviceName}>{item.name || "Unknown Device"}</Text>
                    <Text style={localStyles.deviceId}>{item.id}</Text>
                    <Text style={localStyles.deviceId}>RSSI: {item.rssi ?? "-"}</Text>
                  </TouchableOpacity>
                )}
              />

              <TouchableOpacity
                style={localStyles.scanAgainBtn}
                onPress={startScan}
                disabled={scanning}
              >
                <Text style={localStyles.scanAgainBtnText}>
                  {scanning ? "Đang quét..." : "Quét lại"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  packetLine: {
    fontSize: 13,
    color: "#334E68",
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0D1B2A",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#607D8B",
    marginBottom: 12,
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  deviceIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  deviceItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#102A43",
  },
  deviceItemId: {
    fontSize: 12,
    color: "#78909C",
    marginTop: 2,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: "#78909C",
  },
  scanAgainBtn: {
    backgroundColor: "#1565C0",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  scanAgainBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  deviceItemBLE: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
  },
  deviceId: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});