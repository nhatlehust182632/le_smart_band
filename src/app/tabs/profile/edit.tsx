import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfileContext } from "../../../hooks/profile-context";
import { styles } from "../../../styles/appStyles";

export default function EditProfileScreen() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [emergency_phone, setEmergency_phone] = useState("");
  const [date_of_birth, setDate_of_birth] = useState("");
  const [gender, setGender] = useState("1");
  const [height_cm, setHeight_cm] = useState("");
  const [weight_kg, setWeight_kg] = useState("");
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();
  const { profileDetail, loading, refreshProfileData, saveProfileDetail } =
    useProfileContext();

  const formatDateInput = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 8);

    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;

    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4)}`;
  };

  const formatDateFromApi = (date?: string | null) => {
    if (!date) return "";

    const onlyDate = String(date).split("T")[0];
    const [year, month, day] = onlyDate.split("-");

    if (!year || !month || !day) return "";

    return `${day}-${month}-${year}`;
  };

  const isValidDateParts = (day: number, month: number, year: number) => {
    if (year < 1900 || year > new Date().getFullYear()) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

  const formatDateToApi = (date: string) => {
    const value = date.trim();
    if (!value) return null;

    const [day, month, year] = value.split("-");

    if (!day || !month || !year) return null;
    if (day.length !== 2 || month.length !== 2 || year.length !== 4) return null;

    const dayNumber = Number(day);
    const monthNumber = Number(month);
    const yearNumber = Number(year);

    if (!isValidDateParts(dayNumber, monthNumber, yearNumber)) return null;

    return `${year}-${month}-${day}`;
  };

  const normalizeDecimalInput = (text: string) => {
    const cleaned = text.replace(",", ".").replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");

    if (parts.length <= 1) return cleaned;

    return `${parts[0]}.${parts.slice(1).join("")}`;
  };

  useEffect(() => {
    if (!user?.id) return;

    refreshProfileData().catch((error: any) => {
      Alert.alert("Lỗi", error?.message || "Không thể lấy thông tin hồ sơ.");
    });
  }, [user?.id, refreshProfileData]);

  useEffect(() => {
    if (!profileDetail) return;

    setFullName(profileDetail?.full_name ?? "");
    setPhone(profileDetail?.phone ?? "");
    setDate_of_birth(formatDateFromApi(profileDetail?.date_of_birth));
    setHeight_cm(
      profileDetail?.height_cm !== null && profileDetail?.height_cm !== undefined
        ? String(profileDetail.height_cm)
        : "",
    );
    setWeight_kg(
      profileDetail?.weight_kg !== null && profileDetail?.weight_kg !== undefined
        ? String(profileDetail.weight_kg)
        : "",
    );
    setEmergency_phone(profileDetail?.emergency_phone ?? "");
    setGender(profileDetail?.gender ? String(profileDetail.gender) : "1");
  }, [profileDetail]);

  const handleSave = async () => {
    if (saving) return;

    const trimmedFullName = fullName.trim();
    const trimmedEmergencyPhone = emergency_phone.trim();
    const apiDateOfBirth = formatDateToApi(date_of_birth);

    if (!user?.id) {
      Alert.alert("Lỗi", "Không tìm thấy người dùng đang đăng nhập.");
      return;
    }

    if (!trimmedFullName) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập họ và tên.");
      return;
    }

    if (date_of_birth.trim() && !apiDateOfBirth) {
      Alert.alert("Dữ liệu chưa đúng", "Ngày sinh phải đúng định dạng DD-MM-YYYY.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        id: user.id,
        full_name: trimmedFullName,
        gender: Number(gender),
        date_of_birth: apiDateOfBirth,
        height_cm: height_cm.trim() ? Number(height_cm) : null,
        weight_kg: weight_kg.trim() ? Number(weight_kg) : null,
        emergency_phone: trimmedEmergencyPhone || null,
        enable_heart_rate_alert: Number(profileDetail?.enable_heart_rate_alert ?? 1),
      };

      await saveProfileDetail(payload as any);

      Alert.alert("Thành công", "Cập nhật thông tin thành công.");
      router.back();
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể cập nhật thông tin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={localStyles.safePurple}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <LinearGradient colors={["#4A148C", "#6A1B9A"]} style={styles.header}>
          <View style={localStyles.headerRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>Cập nhật hồ sơ</Text>
              <Text style={styles.subGreeting}>Chỉnh sửa thông tin người dùng</Text>
            </View>

            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={localStyles.formCard}>
            <Text style={localStyles.label}>Họ và tên</Text>
            <TextInput
              style={localStyles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên"
              placeholderTextColor="#90A4AE"
            />

            <Text style={localStyles.label}>Số điện thoại</Text>
            <TextInput
              style={localStyles.input}
              value={phone}
              editable={false}
              onFocus={() => {
                Alert.alert("Thông báo", "Không thể thay đổi số điện thoại");
              }}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#90A4AE"
              keyboardType="phone-pad"
            />

            <Text style={localStyles.label}>Ngày sinh</Text>
            <TextInput
              style={localStyles.input}
              value={date_of_birth}
              placeholder="DD-MM-YYYY"
              placeholderTextColor="#90A4AE"
              keyboardType="number-pad"
              maxLength={10}
              onChangeText={(text) => {
                setDate_of_birth(formatDateInput(text));
              }}
            />

            <Text style={localStyles.label}>Giới tính</Text>
            <TouchableOpacity
              style={localStyles.selectBox}
              onPress={() => setGenderModalVisible(true)}
            >
              <Text
                style={[
                  localStyles.selectBoxText,
                  !gender && localStyles.placeholderText,
                ]}
              >
                {gender === "1" ? "Nam" : gender === "2" ? "Nữ" : "Khác"}
              </Text>

              <Ionicons name="chevron-down" size={20} color="#607D8B" />
            </TouchableOpacity>

            <Text style={localStyles.label}>Chiều cao</Text>
            <TextInput
              style={localStyles.input}
              value={height_cm}
              placeholder="Nhập chiều cao"
              placeholderTextColor="#90A4AE"
              keyboardType="decimal-pad"
              onChangeText={(text) => {
                setHeight_cm(normalizeDecimalInput(text));
              }}
            />

            <Text style={localStyles.label}>Cân nặng</Text>
            <TextInput
              style={localStyles.input}
              value={weight_kg}
              placeholder="Nhập cân nặng"
              placeholderTextColor="#90A4AE"
              keyboardType="decimal-pad"
              onChangeText={(text) => {
                setWeight_kg(normalizeDecimalInput(text));
              }}
            />

            <Text style={localStyles.label}>Số điện thoại khẩn cấp</Text>
            <TextInput
              style={localStyles.input}
              value={emergency_phone}
              onChangeText={setEmergency_phone}
              placeholder="Nhập số điện thoại khẩn cấp"
              placeholderTextColor="#90A4AE"
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={[localStyles.saveButton, (saving || loading) && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving || loading}
            >
              <Text style={localStyles.saveButtonText}>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={localStyles.cancelButton} onPress={() => router.back()}>
              <Text style={localStyles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 0 }} />
        </ScrollView>
      </View>

      <Modal
        visible={genderModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setGenderModalVisible(false)}>
          <View style={localStyles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={localStyles.modalContent}>
                <Text style={localStyles.modalTitle}>Chọn giới tính</Text>

                {[
                  { name: "Nam", value: "1" },
                  { name: "Nữ", value: "2" },
                  { name: "Khác", value: "3" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={localStyles.modalOption}
                    onPress={() => {
                      setGender(item.value);
                      setGenderModalVisible(false);
                    }}
                  >
                    <Text style={localStyles.modalOptionText}>{item.name}</Text>

                    {gender === item.value && (
                      <Ionicons name="checkmark" size={20} color="#6A1B9A" />
                    )}
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={localStyles.modalCancelButton}
                  onPress={() => setGenderModalVisible(false)}
                >
                  <Text style={localStyles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safePurple: {
    flex: 1,
    backgroundColor: "#4A148C",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  formCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B2A41",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E3EAF2",
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#1B2A41",
    backgroundColor: "#F9FBFD",
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: "#6A1B9A",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: "#F3E5F5",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#6A1B9A",
    fontWeight: "700",
    fontSize: 16,
  },
  selectBox: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E3EAF2",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#F9FBFD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectBoxText: {
    fontSize: 15,
    color: "#1B2A41",
  },
  placeholderText: {
    color: "#90A4AE",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1B2A41",
    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#1B2A41",
    fontWeight: "600",
  },
  modalCancelButton: {
    marginTop: 16,
    backgroundColor: "#f5e5e5ff",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#6A1B9A",
    fontWeight: "700",
    fontSize: 15,
  },
});
