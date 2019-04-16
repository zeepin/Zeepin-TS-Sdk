import { BigNumber } from "bignumber.js";
import { ERROR_CODE } from "./error";
import * as Long from "long";
import { bigIntToBytes, reverseHex } from "./functionsUtils";


export class BigInt {
    value: string | number;

    constructor(value: string | number) {
        const bi = new BigNumber(value);
        if (!bi.isInteger() || bi.isNegative()) {
            throw ERROR_CODE.INVALID_PARAMS;
        }
        this.value = value;
    }

    /**
     * Create BigInt from string
     * @param hex Byte string value
     */
    static fromHexstr(hex: string): BigInt {
        hex = reverseHex(hex);
        const bi = new BigNumber(hex, 16).toString();
        return new BigInt(bi);
    }
    /**
     * Create hex string from BigInt
     */
    toHexstr(): string {
        const bi = Long.fromValue(this.value);
        const hex = bigIntToBytes(bi);
        return hex;
    }
}



export class Fixed64 {
    static deserialize(sr: StringReader) {
        const f = new Fixed64();
        let v = sr.read(8);
        // f.value = hexstr2str(v)
        v = reverseHex(v);
        while (v.substr(0, 2) === '00' ) {
            v = v.substring(2);
        }
        f.value = new BigNumber(v, 16).toString();
        return f;
    }

    // 8 bytes
    value: string;
    constructor(value?: string) {
        if (value && value.length > 16 || value && !/^[0-9]\d*$/.test(value)) {
            throw new Error('Invalid value.' + value);
        }
        this.value = value || '0000000000000000';
    }

    serialize() {
        // return str2hexstr(this.value)
        let hexstring = new BigNumber(this.value).toString(16);
        const size = 8 * 2;

        hexstring = hexstring.length % size === 0
            ? hexstring
            : ('0'.repeat(size) + hexstring).substring(hexstring.length);

        hexstring = reverseHex(hexstring);
        return hexstring;
    }
}



/**
 * @class StringReader
 * @classdesc A string helper used to read given string as bytes.2 chars as one byte.
 * @param {string} str - The string to read.
 */
export class StringReader {
    str: string;
    pos: number;
    size: number;
    constructor(str = '') {
        if (str.length % 2 !== 0) {
            throw new Error('Param\'s length is not even.');
        }
        this.str = str;
        this.pos = 0;
        this.size = this.str.length / 2;
    }

    /**
     * Checks if reached the end of the string.
     */
    isEmpty() {
        return this.pos >= this.str.length;
    }

    /**
     * Reads some bytes.
     * @param {number} bytes - Number of bytes to read
     */
    read(bytes: number) {
        if (this.isEmpty()) {
            throw new Error('StringReader reached the end.');
        }
        const out = this.str.substr(this.pos, bytes * 2);
        this.pos += bytes * 2;
        return out;
    }

    unreadBytes(bytes: number) {
        if ( (this.pos - bytes * 2) < 0 ) {
            throw new Error('Can not unread too many bytes.');
        }
        this.pos -= bytes * 2;
        return;
    }

    /**
     * Reads string terminated by NULL.
     */
    readNullTerminated(): string {
        const index = this.str.indexOf('00', this.pos);
        if (index === -1) {
            throw new Error('No ending NULL found');
        }

        const out = this.str.substring(this.pos, index);
        this.pos = index + 2;
        return out;
    }

    /**
     * First, read one byte as the length of bytes to read. Then read the following bytes.
     */
    readNextBytes() {
        const bytesToRead = this.readNextLen();
        if (bytesToRead === 0) {
            return '';
        }

        return this.read(bytesToRead);
    }

    /**
     * Reads one byte as int, which may indicates the length of following bytes to read.
     * @returns {number}
     */
    readNextLen() {
        let len = parseInt(this.read(1), 16);

        if (len === 0xfd) {
            len = parseInt(reverseHex(this.read(2)), 16);
        } else if (len === 0xfe) {
            len = parseInt(reverseHex(this.read(4)), 16);
        } else if (len === 0xff) {
            len = parseInt(reverseHex(this.read(8)), 16);
        }

        return len;
    }

    /**
     * Read Uint8
     */
    readUint8() {
        return parseInt(reverseHex(this.read(1)), 16);
    }

    /**
     * read 2 bytes as uint16 in littleEndian
     */
    readUint16() {
        return parseInt(reverseHex(this.read(2)), 16);
    }

    /**
     * Read 4 bytes as uint32 in littleEndian
     */
    readUint32() {
        return parseInt(reverseHex(this.read(4)), 16);
    }

    /**
     * Read 4 bytes as int in littleEndian
     */
    readInt() {
        return parseInt(reverseHex(this.read(4)), 16);
    }

    /**
     * Read 8 bytes as long in littleEndian
     */
    readLong() {
        return parseInt(reverseHex(this.read(8)), 16);
    }

    readBoolean() {
        return parseInt(this.read(1), 16) !== 0;
    }
}
