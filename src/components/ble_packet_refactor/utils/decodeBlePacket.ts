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
    const buffer = Buffer.from(value, "base64");
    console.log("Decoded Buffer:", buffer);
    const dec = Array.from(buffer);

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
