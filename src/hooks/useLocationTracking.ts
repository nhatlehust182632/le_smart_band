import { locationService } from "@/api/services/location.service";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CurrentLocation } from "../components/home/types";

const LOCATION_UPDATE_INTERVAL = 30000;
const MIN_REVERSE_GEOCODE_INTERVAL_MS = 60_000;
const PLACE_KEY_PRECISION = 3;
const MIN_SAVE_LOCATION_INTERVAL_MS = 10_000;

// function calculateDistance(
//     lat1: number,
//     lon1: number,
//     lat2: number,
//     lon2: number
// ): number {
//     const R = 6371000;
//     const dLat = ((lat2 - lat1) * Math.PI) / 180;
//     const dLon = ((lon2 - lon1) * Math.PI) / 180;

//     const a =
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos((lat1 * Math.PI) / 180) *
//         Math.cos((lat2 * Math.PI) / 180) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);

//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     return R * c;
// }

export type SaveLocationData = {
    userId: string | number;
    latitude: number;
    longitude: number;
    place_key: string;
};

// interface SavedLocation {
//     latitude: number | string;
//     longitude: number | string;
// }

// function formatAddress(address: Location.LocationGeocodedAddress): string {
//     return [
//         address.name,
//         address.street,
//         address.district,
//         address.city,
//         address.region,
//         address.country,
//     ]
//         .filter(Boolean)
//         .join(", ");
// }

export function useLocationTracking(userId: string | undefined) {
    const [currentLocation, setCurrentLocation] =
        useState<CurrentLocation | null>(null);
    const [locationAddress, setLocationAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isMountedRef = useRef(true);
    const addressCacheRef = useRef<Record<string, string>>({});
    const lastReverseGeocodeAtRef = useRef(0);
    const lastReverseGeocodePlaceKeyRef = useRef<string | null>(null);

    const lastSaveLocationAttemptAtRef = useRef(0);
    const isSavingLocationRef = useRef(false);


    const buildPlaceKey = (latitude: number, longitude: number) => {
        return `${latitude.toFixed(PLACE_KEY_PRECISION)}_${longitude.toFixed(
            PLACE_KEY_PRECISION
        )}`;
    };

    const buildAddressPlaceKey = (latitude: number, longitude: number) => {
        return `${latitude.toFixed(PLACE_KEY_PRECISION)},${longitude.toFixed(
            PLACE_KEY_PRECISION
        )}`;
    };

    const normalizePlaceKey = (placeKey?: string | null) => {
        return typeof placeKey === "string" ? placeKey.trim() : "";
    };

    const formatAddress = (address: Location.LocationGeocodedAddress) => {
        const parts = [
            address.name,
            address.street,
            address.district,
            address.city,
            address.region,
            address.country,
        ].filter(Boolean);

        return parts.join(", ");
    };

    const fetchLocationAddress = useCallback(
        async (latitude: number, longitude: number): Promise<string> => {
            const unknownAddress = "Không xác định được tên vị trí";
            const errorAddress = "Không thể lấy tên vị trí";

            const addressPlaceKey = buildAddressPlaceKey(latitude, longitude);

            const cachedAddress = addressCacheRef.current[addressPlaceKey];

            if (cachedAddress) {
                if (isMountedRef.current) {
                    setLocationAddress(cachedAddress);
                }

                return cachedAddress;
            }

            if (lastReverseGeocodePlaceKeyRef.current === addressPlaceKey) {
                return locationAddress || unknownAddress;
            }

            const now = Date.now();

            if (
                now - lastReverseGeocodeAtRef.current <
                MIN_REVERSE_GEOCODE_INTERVAL_MS
            ) {
                return locationAddress || unknownAddress;
            }

            try {
                lastReverseGeocodePlaceKeyRef.current = addressPlaceKey;
                lastReverseGeocodeAtRef.current = now;

                const addresses = await Location.reverseGeocodeAsync({
                    latitude,
                    longitude,
                });

                const firstAddress = addresses[0];

                if (!firstAddress) {
                    if (isMountedRef.current) {
                        setLocationAddress(unknownAddress);
                    }

                    return unknownAddress;
                }

                const formattedAddress =
                    formatAddress(firstAddress) || unknownAddress;

                addressCacheRef.current[addressPlaceKey] = formattedAddress;

                if (isMountedRef.current) {
                    setLocationAddress(formattedAddress);
                }

                return formattedAddress;
            } catch (err) {
                console.error("Lỗi lấy tên vị trí:", err);

                if (isMountedRef.current) {
                    setLocationAddress(errorAddress);
                }

                return errorAddress;
            }
        },
        [locationAddress]
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

                const placeName = await fetchLocationAddress(
                    currentLoc.latitude,
                    currentLoc.longitude
                );

                return {
                    ...currentLoc,
                    placeName,
                };
            } catch (err) {
                const errorMsg =
                    err instanceof Error ? err.message : "Không thể lấy vị trí";

                if (isMountedRef.current) {
                    setError(errorMsg);
                }

                return null;
            }
        }, [fetchLocationAddress]);

    // const extractSavedLocationList = (response: unknown): SavedLocation[] => {
    //     if (Array.isArray(response)) {
    //         return response as SavedLocation[];
    //     }

    //     if (
    //         response &&
    //         typeof response === "object" &&
    //         "data" in response &&
    //         Array.isArray((response as { data?: unknown }).data)
    //     ) {
    //         return (response as { data: SavedLocation[] }).data;
    //     }

    //     if (
    //         response &&
    //         typeof response === "object" &&
    //         "historyData" in response &&
    //         Array.isArray((response as { historyData?: unknown }).historyData)
    //     ) {
    //         return (response as { historyData: SavedLocation[] }).historyData;
    //     }

    //     return [];
    // };

    const updateLocationIfNeeded = async (
        current: CurrentLocation
    ): Promise<void> => {
        if (!userId) return;

        if (isSavingLocationRef.current) {
            return;
        }

        const now = Date.now();
        const isSaveTooSoon =
            now - lastSaveLocationAttemptAtRef.current <
            MIN_SAVE_LOCATION_INTERVAL_MS;

        if (isSaveTooSoon) {
            return;
        }

        lastSaveLocationAttemptAtRef.current = now;
        isSavingLocationRef.current = true;

        try {
            setLoading(true);

            const currentPlaceKey = buildPlaceKey(
                current.latitude,
                current.longitude
            );

            const savedLocationsResponse =
                await locationService.getHistoryData(userId, 3);

            const locationList = Array.isArray(savedLocationsResponse)
                ? savedLocationsResponse
                : Array.isArray(savedLocationsResponse?.data)
                    ? savedLocationsResponse.data
                    : [];

            const lastSavedLocation = locationList[0];

            const lastSavedPlaceKey = normalizePlaceKey(
                lastSavedLocation?.place_key
            );

            // console.log("[LOCATION COMPARE]", {
            //     current_place_key: currentPlaceKey,
            //     last_saved_place_key: lastSavedPlaceKey || null,
            //     should_save:
            //         !lastSavedLocation || lastSavedPlaceKey !== currentPlaceKey,
            // });

            const shouldSaveLocation =
                !lastSavedLocation || lastSavedPlaceKey !== currentPlaceKey;

            if (!shouldSaveLocation) {
                // console.log("Vị trí trùng place_key, không lưu mới", {
                //     place_key: currentPlaceKey,
                // });
                return;
            }

            // await locationService.saveLocationPlace({
            //     latitude: current.latitude,
            //     longitude: current.longitude,
            //     userId,
            //     place_key: currentPlaceKey,
            // });

            // console.log("Đã lưu vị trí mới", {
            //     old_place_key: lastSavedPlaceKey || null,
            //     new_place_key: currentPlaceKey,
            // });
        } catch (err) {
            console.error("Lỗi cập nhật vị trí:", err);
        } finally {
            isSavingLocationRef.current = false;
            setLoading(false);
        }
    };

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
