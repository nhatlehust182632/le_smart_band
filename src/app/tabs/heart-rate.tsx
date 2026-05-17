import { useAuth } from "@/context/AuthContext";
import { heartRateHook } from "@/hooks/heartRate";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import { styles } from "../../styles/appStyles";

type HeartRate = {
  model_name: string;
  max_bpm: string;
  min_bpm: string;
  avg_bpm: string;
  latest_bpm: string;
};
type HeartRateTimes = {
  bpm: number;
  time_hhmm: string;
}[];
export default function HeartRateScreen() {
  const [loading, setLoading] = useState(false);
  const [heartRate, setHeartRate] = useState<HeartRate | null>(null);
  const [heartRateChartData, setHeartRateChartData] = useState<HeartRateTimes>(
    [],
  );
  const [heartRateHistory, setHeartRateHistory] = useState<HeartRateTimes>([]);
  const [timeRange, setTimeRange] = useState<"1H" | "6H" | "24H">("1H");
  const {
    getInfoHeartRateByUser,
    getInfoHeartRateByTimes,
    getInfoHeartRateHistory,
  } = heartRateHook();
  const { user } = useAuth();

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

  // lấy thông tin biểu đồ theo giờ
  const handleGetHeartRateByTimes = async () => {
    // if (loading) return;
    try {
      setLoading(true);
      const data = await getInfoHeartRateByTimes(user?.id || "", timeRange);

      setHeartRateChartData(data || []);
    } catch (error) {
      console.log("Lỗi lấy nhịp tim:", error);
    }
  };

  // lấy danh sách lịch sử gần đây
  const handleGetHeartRateHistory = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const data = await getInfoHeartRateHistory(user?.id || "");
      setHeartRateHistory(data || []);
    } catch (error) {
      console.log("Lỗi lấy nhịp tim:", error);
    }
  };

  const getHeartRateStatus = (bpm: number) => {
    if (bpm >= 120 || bpm < 50) {
      return {
        label: "Bất thường",
        colorStyle: styles.historyValueHigh,
      };
    }

    if ((bpm >= 100 && bpm < 120) || (bpm >= 50 && bpm < 60)) {
      return {
        label: "Theo dõi",
        colorStyle: styles.historyValue,
      };
    }

    return {
      label: "Bình thường",
      colorStyle: styles.historyValue,
    };
  };
  //---------------------

  useEffect(() => {
    if (!user?.id) return;

    // gọi lần đầu
    handleGetHeartRate();

    // lặp mỗi 10 giây
    const interval = setInterval(() => {
      handleGetHeartRate();
    }, 10000); // 10000ms = 10 giây

    // cleanup khi unmount
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    handleGetHeartRateByTimes();
  }, [user?.id, timeRange]);

  useEffect(() => {
    handleGetHeartRateHistory();
  }, []);

  // dựng biểu đồ
  const chartWidth = 400;
  const chartHeight = 220;
  const paddingLeft = 40; // chừa chỗ cho số BPM bên trái
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30; // chừa chỗ cho thời gian bên dưới

  console.log("heartRateChartData: " + heartRateChartData);

  const bpmValues = heartRateChartData?.map((item) => item?.bpm);

  // Có thể fix cứng range để chart ổn định hơn
  const maxValue = bpmValues ? Math.max(...bpmValues, 160) : 0;
  const minValue = Math.min(...bpmValues, 60);

  const getX = (index: number) => {
    return (
      paddingLeft +
      (index * (chartWidth - paddingLeft - paddingRight)) /
      (heartRateChartData?.length - 1)
    );
  };

  const getY = (value: number) => {
    return (
      chartHeight -
      paddingBottom -
      ((value - minValue) / (maxValue - minValue)) *
      (chartHeight - paddingTop - paddingBottom)
    );
  };

  const points = heartRateChartData
    .map((item, index) => `${getX(index)},${getY(item.bpm)}`)
    .join(" ");

  // Các mốc trục Y
  const yLabels = [minValue, Math.round((minValue + maxValue) / 2), maxValue];

  const getInterval = () => {
    switch (timeRange) {
      case "1H":
        return 10000; // 10s
      case "6H":
        return 15000; // 15s
      case "24H":
        return 30000; // 30s
    }
  };
  useEffect(() => {
    if (!user?.id) return;

    handleGetHeartRate();

    const interval = setInterval(() => {
      handleGetHeartRate();
    }, getInterval());

    return () => clearInterval(interval);
  }, [user?.id, timeRange]);

  const getVisibleIndexes = (length: number, labelCount: number) => {
    const step = length / labelCount;
    const indexes: number[] = [];

    for (let i = 0; i < labelCount; i++) {
      indexes.push(Math.floor(i * step));
    }

    return indexes;
  };
  const visibleIndexes = getVisibleIndexes(heartRateChartData.length, 6);
  return (
    <SafeAreaView style={localStyles.safeRed}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient colors={["#C62828", "#E53935"]} style={styles.header}>
            <View style={styles.centerHeader}>
              <Text style={styles.greeting}>Nhịp tim</Text>
              <Text style={styles.subGreeting}>
                Theo dõi nhịp tim bất thường
              </Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={["#E53935", "#FF6B6B"]}
            style={styles.mainHeartCard}
          >
            <Text style={styles.mainHeartLabel}>Nhịp tim hiện tại</Text>
            <View style={styles.mainHeartRow}>
              <FontAwesome5 name="heartbeat" size={34} color="#fff" />
              <Text style={styles.mainHeartValue}>{heartRate?.latest_bpm}</Text>
              <Text style={styles.mainHeartUnit}>BPM</Text>
            </View>
            <Text style={styles.mainHeartWarning}>
              Cảnh báo rung nhĩ bất thường
            </Text>
          </LinearGradient>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="analytics" size={22} color="#1565C0" />
              <Text style={localStyles.cardTitle}>Biểu đồ nhịp tim</Text>
              {["1H", "6H", "24H"].map((range) => (
                <Text
                  key={range}
                  style={[
                    localStyles.rangeButton,
                    timeRange === range && localStyles.rangeButtonActive,
                  ]}
                  onPress={() => setTimeRange(range as any)}
                >
                  {range}
                </Text>
              ))}
            </View>

            <View style={localStyles.chartContainer}>
              <Svg width={chartWidth} height={chartHeight}>
                {/* Trục Y */}
                <Line
                  x1={paddingLeft}
                  y1={paddingTop}
                  x2={paddingLeft}
                  y2={chartHeight - paddingBottom}
                  stroke="#D0D7DE"
                  strokeWidth="1"
                />

                {/* Trục X */}
                <Line
                  x1={paddingLeft}
                  y1={chartHeight - paddingBottom}
                  x2={chartWidth - paddingRight}
                  y2={chartHeight - paddingBottom}
                  stroke="#D0D7DE"
                  strokeWidth="1"
                />

                {/* Grid ngang + nhãn trục Y */}
                {yLabels.map((val, index) => {
                  const y = getY(val);
                  return (
                    <React.Fragment key={index}>
                      <Line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke="#EAECEF"
                        strokeWidth="1"
                      />
                      <SvgText x={8} y={y + 4} fontSize="11" fill="#666">
                        {val}
                      </SvgText>
                    </React.Fragment>
                  );
                })}

                {/* Đường biểu đồ */}
                <Polyline
                  points={points}
                  fill="none"
                  stroke="#E53935"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {/* Chấm tại từng điểm */}
                {heartRateChartData.map((item, index) => (
                  <Circle
                    key={index}
                    cx={getX(index)}
                    cy={getY(item.bpm)}
                    r="4"
                    fill="#E53935"
                  />
                ))}

                {/* Giá trị BPM tại từng điểm */}
                {heartRateChartData.map((item, index) => (
                  <SvgText
                    key={`value-${index}`}
                    x={getX(index) - 10}
                    y={getY(item.bpm) - 10}
                    fontSize="10"
                    fill="#E53935"
                    fontWeight="bold"
                  >
                    {item.bpm}
                  </SvgText>
                ))}

                {/* Nhãn trục X - thời gian */}
                {/* Tick trên trục X: tick nhỏ cho mọi điểm, tick dài cho mốc chính */}
                {heartRateChartData.map((item, index) => {
                  const x = getX(index);
                  const yAxis = chartHeight - paddingBottom;
                  const isMajor = visibleIndexes.includes(index);

                  return (
                    <Line
                      key={`tick-${index}`}
                      x1={x}
                      y1={yAxis}
                      x2={x}
                      y2={yAxis + (isMajor ? 8 : 4)}
                      stroke={isMajor ? "#7A7A7A" : "#C8CDD3"}
                      strokeWidth={isMajor ? "1.5" : "1"}
                    />
                  );
                })}
                {/* Tick trên trục X */}
                {heartRateChartData.map((item, index) => {
                  if (!visibleIndexes.includes(index)) return null;

                  const x = getX(index);

                  return (
                    <SvgText
                      key={`time-${index}`}
                      x={x}
                      y={chartHeight - 8}
                      fontSize="10"
                      fill="#666"
                      textAnchor="middle"
                    >
                      {item.time_hhmm}
                    </SvgText>
                  );
                })}
              </Svg>
            </View>

            <View style={localStyles.chartLabels}>
              {heartRateChartData.map((item, index) => (
                <Circle
                  key={index}
                  cx={getX(index)}
                  cy={getY(item.bpm)}
                  r="4"
                  fill="#E53935"
                />
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="pulse" size={22} color="#E53935" />
              <Text style={styles.cardTitle}>Chỉ số hôm nay</Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryNumber}>{heartRate?.min_bpm}</Text>
                <Text style={styles.summaryLabel}>Thấp nhất</Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryNumber}>{heartRate?.avg_bpm}</Text>
                <Text style={styles.summaryLabel}>Trung bình</Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryNumber}>{heartRate?.max_bpm}</Text>
                <Text style={styles.summaryLabel}>Cao nhất</Text>
              </View>
            </View>
          </View>

          <View style={styles.alertCard}>
            <View style={styles.alertLeft}>
              <Ionicons name="warning" size={24} color="#D32F2F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Phân tích AI</Text>
              <Text style={styles.alertText}>
                Dữ liệu hiện tại cho thấy nhịp tim tăng cao bất thường. Cần tiếp
                tục theo dõi và gửi cảnh báo cho người quan sát nếu vượt ngưỡng
                trong thời gian dài.
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="time-outline" size={22} color="#1565C0" />
              <Text style={styles.cardTitle}>Lịch sử gần đây</Text>
            </View>

            {heartRateHistory.length > 0 ? (
              heartRateHistory.map((item, index) => {
                const status = getHeartRateStatus(item.bpm);

                return (
                  <View
                    key={`${item.time_hhmm}-${index}`}
                    style={styles.historyItem}
                  >
                    <Text style={styles.historyTime}>{item.time_hhmm}</Text>
                    <Text style={status.colorStyle}>
                      {item.bpm} BPM - {status.label}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.historyItem}>
                <Text style={styles.historyTime}>--:--</Text>
                <Text style={styles.historyValue}>Chưa có dữ liệu</Text>
              </View>
            )}
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeRed: {
    flex: 1,
    backgroundColor: "#C62828",
  },
  chartContainer: {
    marginTop: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  chartLabels: {
    width: 320,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 8,
  },
  chartLabelText: {
    fontSize: 12,
    color: "#666",
  },

  rangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#eee",
    fontSize: 12,
    color: "#555",
  },

  rangeButtonActive: {
    backgroundColor: "#E53935",
    color: "#fff",
    fontWeight: "bold",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B2A41",
    marginRight: 50,
  },
});
