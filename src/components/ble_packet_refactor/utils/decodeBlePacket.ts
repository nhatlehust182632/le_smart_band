import { Buffer } from "buffer";
import type {
    ParsedBlePacket,
    ParsedBlePayload,
} from "../types/blePacket.types";

/**
 * Giải mã 1 packet BLE Base64.
 *
 * Header chung:
 * - 6 byte đầu: MAC address
 * - 2 byte tiếp theo: header 16 bit
 *      [4 bit packetType][7 bit packetId][5 bit packetIndex]
 *
 * TYPE 5:
 * - Có 19 packet.
 * - Mọi packet, bao gồm packet index 19, đều:
 *      8 byte header + 498 byte payload = 506 byte
 *      498 / 6 = 83 mẫu x/y/z
 * - Mỗi mẫu 6 byte:
 *      2 byte x
 *      2 byte y
 *      2 byte z
 *
 * Lưu ý:
 * - Hàm decode này vẫn parse đủ 83 mẫu cho packet index 19.
 * - Việc bỏ 77 mẫu dư của packet index 19 được xử lý ở bước tổng hợp
 *   trong `type5SlidingWindows.ts` và `summarizeBlePackets.ts`.
 *
 * TYPE 6:
 * - 8 byte header + 500 byte payload = 508 byte
 * - 500 / 4 = 125 giá trị
 */
export const decodeBlePacket = (value: string): ParsedBlePacket => {
    // console.log("Decoding Base64 value:", value);
    const buffer = Buffer.from(value, "base64");
    // console.log("Decoded Buffer:", buffer);
    const dec = Array.from(buffer);
    // console.log("Hex data input:", buffer.toString("hex"));
    // console.log("Decimal byte values:", dec);

    if (buffer.length < 8) {
        return {
            isValid: false,
            error: "Packet length < 8 bytes",
            buffer,
            bufferLength: buffer.length,
            hex: buffer.toString("hex"),
            ascii: buffer.toString("ascii"),
            dec,
            base64: value,
        };
    }

    const macBytes = dec.slice(0, 6);
    const macAddress = macBytes
        .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
        .join(":");

    const headerByte1 = dec[6];
    const headerByte2 = dec[7];

    const header16 = (headerByte1 << 8) | headerByte2;
    const headerBits = header16.toString(2).padStart(16, "0");

    const packetTypeBits = headerBits.slice(0, 4);
    const packetIdBits = headerBits.slice(4, 11);
    const packetIndexBits = headerBits.slice(11, 16);

    const packetType = parseInt(packetTypeBits, 2);
    const packetId = parseInt(packetIdBits, 2);
    const packetIndex = parseInt(packetIndexBits, 2);

    const payloadBuffer = buffer.subarray(8);
    const payloadDec = Array.from(payloadBuffer);

    let parsedPayload: ParsedBlePayload;

    switch (packetType) {
        case 0: {
            /**
             * TYPE 0:
             * Payload byte đầu tiên = % pin.
             * Ví dụ: 85 => 85%
             */
            const rawBatteryPercent = payloadDec[1] ?? 0;

            const batteryPercent = Math.max(
                0,
                Math.min(100, rawBatteryPercent)
            );
            parsedPayload = {
                packetName: "TYPE_0",
                status: "BATTERY_LEVEL",

                payloadByteLength: payloadBuffer.length,
                batteryPercent,

                rawBytes: payloadDec,
            };

            break;
        }

        case 1: {
            /**
             * TYPE 1:
             * Payload byte đầu tiên = trạng thái sạc.
             * 1 = đang sạc
             * 0 = không sạc
             */
            const chargingValue = payloadDec[0] ?? 0;
            const isCharging = chargingValue === 1;

            parsedPayload = {
                packetName: "TYPE_1",
                status: isCharging ? "CHARGING" : "NOT_CHARGING",

                payloadByteLength: payloadBuffer.length,
                chargingRawValue: chargingValue,
                isCharging,

                rawBytes: payloadDec,
            };

            break;
        }

        case 2: {
            /**
             * TYPE 2:
             * Payload byte đầu tiên = mã trạng thái.
             * Các byte còn lại giữ lại để lưu DB/debug.
             */
            const statusCode = payloadDec[0] ?? 0;

            const statusNameMap: Record<number, string> = {
                0: "NORMAL",
                1: "LOW_BATTERY",
                2: "CHARGING",
                3: "FULL_BATTERY",
                4: "DEVICE_ERROR",
                5: "SENSOR_ERROR",
            };

            parsedPayload = {
                packetName: "TYPE_2",
                status: "DEVICE_PACKET_STATUS",

                payloadByteLength: payloadBuffer.length,
                statusCode,
                statusName: statusNameMap[statusCode] ?? "UNKNOWN_STATUS",
                statusPayload: payloadDec.slice(1),

                rawBytes: payloadDec,
            };

            break;
        }
        case 3:
        case 4:
            parsedPayload = {
                status: "Chưa xử lý loại gói này",
                payloadByteLength: payloadBuffer.length,
                rawBytes: payloadDec,
            };
            break;

        case 5: {
            const TYPE_5_SAMPLE_SIZE = 6;

            const xValues: number[] = [];
            const yValues: number[] = [];
            const zValues: number[] = [];

            let offset = 8;

            while (offset + TYPE_5_SAMPLE_SIZE <= buffer.length) {
                const x = buffer.readUInt16BE(offset);
                const y = buffer.readUInt16BE(offset + 2);
                const z = buffer.readUInt16BE(offset + 4);

                xValues.push(x);
                yValues.push(y);
                zValues.push(z);

                offset += TYPE_5_SAMPLE_SIZE;
            }

            const remainingBytes = Array.from(buffer.subarray(offset));

            parsedPayload = {
                packetName: "TYPE_5",

                expectedPayloadByteLength: 498,
                actualPayloadByteLength: payloadBuffer.length,

                bytesPerValue: TYPE_5_SAMPLE_SIZE,
                valueCount: xValues.length,

                xValues,
                yValues,
                zValues,

                remainingByteCount: remainingBytes.length,
                remainingBytes,

                rawBytes: payloadDec,
            };

            break;
        }

        case 6: {
            const TYPE_6_VALUE_SIZE = 4;
            const values: number[] = [];

            let offset = 8;

            while (offset + TYPE_6_VALUE_SIZE <= buffer.length) {
                const intValue = buffer.readUInt32BE(offset);
                const negativeValue = intValue > 0 ? -intValue : intValue;

                values.push(negativeValue);
                offset += TYPE_6_VALUE_SIZE;
            }

            const remainingBytes = Array.from(buffer.subarray(offset));
            // console.log("Parsed TYPE_6 values:", values);   
            parsedPayload = {
                packetName: "TYPE_6",

                expectedPayloadByteLength: 500,
                actualPayloadByteLength: payloadBuffer.length,

                bytesPerValue: TYPE_6_VALUE_SIZE,
                valueCount: values.length,
                values,

                remainingByteCount: remainingBytes.length,
                remainingBytes,

                rawBytes: payloadDec,
            };

            break;
        }

        default:
            parsedPayload = {
                status: "Loại gói không xác định",
                payloadByteLength: payloadBuffer.length,
                rawBytes: payloadDec,
            };
            break;
    }

    return {
        isValid: true,

        buffer,
        bufferLength: buffer.length,

        hex: buffer.toString("hex"),
        ascii: buffer.toString("ascii"),
        dec,
        base64: value,

        mac: {
            bytes: macBytes,
            address: macAddress,
        },

        header: {
            rawBytes: [headerByte1, headerByte2],
            decimal16: header16,
            bits16: headerBits,

            packetType: {
                bits: packetTypeBits,
                dec: packetType,
            },

            packetId: {
                bits: packetIdBits,
                dec: packetId,
            },

            packetIndex: {
                bits: packetIndexBits,
                dec: packetIndex,
            },
        },

        payload: parsedPayload,
    };
};
