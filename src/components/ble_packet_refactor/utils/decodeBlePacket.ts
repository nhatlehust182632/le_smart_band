import { Buffer } from "buffer";
import type {
    ParsedBlePacket,
    ParsedBlePayload,
} from "../types/blePacket.types";

/**
 * Decode 1 chuỗi Base64 BLE sang packet đã parse.
 *
 * Frame đang dùng:
 * - 6 byte MAC
 * - 2 byte header 16 bit:
 *      [4 bit packetType][7 bit packetId][5 bit packetIndex]
 * - payload còn lại
 */
export const decodeBlePacket = (value: string): ParsedBlePacket => {
    const buffer = Buffer.from(value, "base64");
    const dec = Array.from(buffer);

    // =========================
    // 1. Kiểm tra packet tối thiểu
    // =========================
    // Cần ít nhất:
    // - 6 byte MAC
    // - 2 byte header
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

    // =========================
    // 2. 6 byte đầu là MAC
    // =========================
    const macBytes = dec.slice(0, 6);

    const macAddress = macBytes
        .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
        .join(":");

    // =========================
    // 3. 2 byte tiếp theo là header 16 bit
    // =========================
    const headerByte1 = dec[6];
    const headerByte2 = dec[7];

    const header16 = (headerByte1 << 8) | headerByte2;
    const headerBits = header16.toString(2).padStart(16, "0");

    // [4 bit type][7 bit id][5 bit index]
    const packetTypeBits = headerBits.slice(0, 4);
    const packetIdBits = headerBits.slice(4, 11);
    const packetIndexBits = headerBits.slice(11, 16);

    const packetType = parseInt(packetTypeBits, 2);
    const packetId = parseInt(packetIdBits, 2);
    const packetIndex = parseInt(packetIndexBits, 2);

    // =========================
    // 4. Payload sau 8 byte đầu
    // =========================
    const payloadBuffer = buffer.subarray(8);
    const payloadDec = Array.from(payloadBuffer);

    let parsedPayload: ParsedBlePayload;

    switch (packetType) {
        // =========================
        // Loại 1 -> 4: để xử lý sau
        // =========================
        case 1:
        case 2:
        case 3:
        case 4:
            parsedPayload = {
                status: "Chưa xử lý loại gói này",
                payloadByteLength: payloadBuffer.length,
                rawBytes: payloadDec,
            };
            break;

        // =========================
        // Loại 5
        // - Payload = 500 byte
        // - Mỗi dữ liệu = 6 byte
        // - 500 / 6 = 83 dữ liệu, dư 2 byte
        // =========================
        case 5: {
            const TYPE_5_VALUE_SIZE = 6;
            const values: number[] = [];

            let offset = 8;

            while (offset + TYPE_5_VALUE_SIZE <= buffer.length) {
                const intValue = buffer.readUIntBE(
                    offset,
                    TYPE_5_VALUE_SIZE
                );

                values.push(intValue);
                offset += TYPE_5_VALUE_SIZE;
            }

            const remainingBytes = Array.from(buffer.subarray(offset));

            parsedPayload = {
                packetName: "TYPE_5",

                expectedPayloadByteLength: 500,
                actualPayloadByteLength: payloadBuffer.length,

                bytesPerValue: TYPE_5_VALUE_SIZE,
                valueCount: values.length,
                values,

                remainingByteCount: remainingBytes.length,
                remainingBytes,

                rawBytes: payloadDec,
            };

            break;
        }

        // =========================
        // Loại 6
        // - Payload = 500 byte
        // - Mỗi dữ liệu = 4 byte
        // - 500 / 4 = 125 dữ liệu
        // =========================
        case 6: {
            const TYPE_6_VALUE_SIZE = 4;
            const values: number[] = [];

            let offset = 8;

            while (offset + TYPE_6_VALUE_SIZE <= buffer.length) {
                const intValue = buffer.readUInt32BE(offset);

                values.push(intValue);
                offset += TYPE_6_VALUE_SIZE;
            }

            const remainingBytes = Array.from(buffer.subarray(offset));

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

        // =========================
        // Loại khác
        // =========================
        default:
            parsedPayload = {
                status: "Loại gói không xác định",
                payloadByteLength: payloadBuffer.length,
                rawBytes: payloadDec,
            };
            break;
    }

    // =========================
    // 5. Trả packet đã parse
    // =========================
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