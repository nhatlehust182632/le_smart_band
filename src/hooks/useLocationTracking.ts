import { locationService } from "@/api/services/location.service";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CurrentLocation } from "../components/home/types";

const LOCATION_UPDATE_INTERVAL = 30000;
const DISTANCE_THRESHOLD = 100;

function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

interface SaveLocationData {
    latitude: number;
    longitude: number;
    userId: string;
}

function formatAddress(address: Location.LocationGeocodedAddress): string {
    return [
        address.name,
        address.street,
        address.district,
        address.city,
        address.region,
        address.country,
    ]
        .filter(Boolean)
        .join(", ");
}

export function useLocationTracking(userId: string | undefined) {
    const [currentLocation, setCurrentLocation] =
        useState<CurrentLocation | null>(null);
    const [locationAddress, setLocationAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isMountedRef = useRef(true);

    const fetchLocationAddress = useCallback(
        async (latitude: number, longitude: number): Promise<void> => {
            try {
                const addresses = await Location.reverseGeocodeAsync({
                    latitude,
                    longitude,
                });

                const firstAddress = addresses[0];

                if (!firstAddress) {
                    if (isMountedRef.current) {
                        setLocationAddress("Không xác định được tên vị trí");
                    }
                    return;
                }

                const formattedAddress = formatAddress(firstAddress);

                if (isMountedRef.current) {
                    setLocationAddress(
                        formattedAddress || "Không xác định được tên vị trí"
                    );
                }
            } catch (err) {
                console.error("Lỗi lấy tên vị trí:", err);

                if (isMountedRef.current) {
                    setLocationAddress("Không thể lấy tên vị trí");
                }
            }
        },
        []
    );

    const fetchCurrentLocation =
        useCallback(async (): Promise<CurrentLocation | null> => {
            try {
                const { status } =
                    await Location.requestForegroundPermissionsAsync();

                if (status !== "granted") {
                    if (isMountedRef.current) {
                        setError("Quyền truy cập vị trí bị từ chối");
                    }

                    return null;
                }

                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

                const currentLoc: CurrentLocation = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    updatedAt: new Date().toLocaleTimeString("vi-VN"),
                };

                if (isMountedRef.current) {
                    setCurrentLocation(currentLoc);
                    setError(null);
                }

                await fetchLocationAddress(
                    currentLoc.latitude,
                    currentLoc.longitude
                );

                return currentLoc;
            } catch (err) {
                const errorMsg =
                    err instanceof Error ? err.message : "Không thể lấy vị trí";

                if (isMountedRef.current) {
                    setError(errorMsg);
                }

                return null;
            }
        }, [fetchLocationAddress]);

    const updateLocationIfNeeded = useCallback(
        async (current: CurrentLocation): Promise<void> => {
            if (!userId) return;

            try {
                if (isMountedRef.current) {
                    setLoading(true);
                }

                const savedLocations =
                    await locationService.getHistoryData(userId);
                const lastSavedLocation = savedLocations?.[0];

                const locationData: SaveLocationData = {
                    latitude: current.latitude,
                    longitude: current.longitude,
                    userId,
                };

                if (!lastSavedLocation) {
                    await locationService.saveLocationPlace(locationData);
                    console.log("✓ Vị trí đã được lưu lên BE lần đầu tiên");
                    return;
                }

                const distance = calculateDistance(
                    current.latitude,
                    current.longitude,
                    lastSavedLocation.latitude,
                    lastSavedLocation.longitude
                );

                console.log(
                    `Khoảng cách từ vị trí đã lưu: ${distance.toFixed(2)}m`
                );

                if (distance >= DISTANCE_THRESHOLD) {
                    await locationService.saveLocationPlace(locationData);
                    console.log("✓ Vị trí đã được lưu lên BE");
                } else {
                    console.log("Vị trí chưa cách đủ 100m, không cần lưu");
                }
            } catch (err) {
                const errorMsg =
                    err instanceof Error
                        ? err.message
                        : "Lỗi khi cập nhật vị trí trên BE";

                console.error("Lỗi cập nhật vị trí:", errorMsg);
            } finally {
                if (isMountedRef.current) {
                    setLoading(false);
                }
            }
        },
        [userId]
    );

    const handleLocationUpdate = useCallback(async (): Promise<void> => {
        const current = await fetchCurrentLocation();

        if (current) {
            await updateLocationIfNeeded(current);
        }
    }, [fetchCurrentLocation, updateLocationIfNeeded]);

    useEffect(() => {
        if (!userId) return;

        handleLocationUpdate();

        intervalRef.current = setInterval(() => {
            handleLocationUpdate();
        }, LOCATION_UPDATE_INTERVAL);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [userId, handleLocationUpdate]);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    return {
        currentLocation,
        locationAddress,
        loading,
        error,
    };
}
