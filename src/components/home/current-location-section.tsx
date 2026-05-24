import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { styles } from "../../styles/appStyles";
import type { CurrentLocation } from "./types";

type CurrentLocationSectionProps = {
  currentLocation: CurrentLocation | null;
  locationAddress: string;
};

export function CurrentLocationSection({
  currentLocation,
  locationAddress,
}: CurrentLocationSectionProps) {
  return (
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
  );
}
