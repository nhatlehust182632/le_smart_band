import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ConnectDeviceSection,
  type ConnectDeviceSectionRef,
} from "../../components/home/connect-device-section";
import { CurrentHeartRateSection } from "../../components/home/current-heart-rate-section";
import { CurrentLocationSection } from "../../components/home/current-location-section";
import { MainActionsSection } from "../../components/home/main-actions-section";
// import { TodaySummarySection } from "../../components/home/today-summary-section";
import type { HeartRate } from "../../components/home/types";
import { useDailyHealthSummary } from "../../hooks/useDailyHealthSummary";
import { useLocationTracking } from "../../hooks/useLocationTracking";
import { styles } from "../../styles/appStyles";

export default function HomeScreen() {
  const { user } = useAuth();
  const connectDeviceSectionRef = useRef<ConnectDeviceSectionRef>(null);

  const [heartRate, setHeartRate] = useState<HeartRate | null>(null);

  const { summary } = useDailyHealthSummary();

  // Sử dụng hook theo dõi vị trí
  const { currentLocation, locationAddress } = useLocationTracking(user?.id);

  const handleConnectActionPress = useCallback(() => {
    connectDeviceSectionRef.current?.runConnectionAction();
  }, []);

  return (
    <SafeAreaView edges={["top"]} style={localStyles.safeBlue}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient colors={["#0D47A1", "#1976D2"]} style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Xin chào, {user?.full_name}</Text>
                <Text style={styles.subGreeting}>
                  Theo dõi sức khỏe mỗi ngày
                </Text>
              </View>
            </View>
          </LinearGradient>

          <ConnectDeviceSection ref={connectDeviceSectionRef} />

          <CurrentHeartRateSection
            userId={user?.id}
            onHeartRateChange={setHeartRate}
          />

          <MainActionsSection onConnectPress={handleConnectActionPress} />

          <CurrentLocationSection
            currentLocation={currentLocation}
            locationAddress={locationAddress}
          />

          {/* <TodaySummarySection
            stepCount={summary.steps}
            calories={summary.calories}
          /> */}

          <View style={{ height: 0 }} />
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
