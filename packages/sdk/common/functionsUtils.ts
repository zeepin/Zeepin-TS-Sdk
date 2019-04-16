import * as Long from 'long';
import * as cryptoJS from 'crypto-js'
import { ERROR_CODE } from "./error";

/**
 * Creates random bytes.
 *
 * @param data Hex encoded data
 */
export function randomBytes (len: number) {
    return cryptoJS.lib.WordArray.random(len).toString();;
}

/**
 * Computes sha-256 hash from hex encoded data.
 *
 * @param data Hex encoded data
 */
export function sha256 (data: string) {
    const hex = cryptoJS.enc.Hex.parse(data);
    const sha = cryptoJS.SHA256(hex).toString();
    return sha;
}

/**
 * Turn hex string into array buffer
 * @param str hex string
 */
export function hexstring2ab(str: string): number[] {
    const result = [];
    while (str.length >= 2) {
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
    }
    return result;
}

/**
 * Turn array buffer into hex string
 * @param arr Array like value
 */
export function ab2hexstring(arr: any): string {
    let result: string = '';
    const uint8Arr: Uint8Array = new Uint8Array(arr);
    for (let i = 0; i < uint8Arr.byteLength; i++) {
        let str = uint8Arr[i].toString(16);
        str = str.length === 0
            ? '00'
            : str.length === 1
                ? '0' + str
                : str;
        result += str;
    }
    return result;
}

/**
 * Converts a number to a big endian hexstring of a suitable size, optionally little endian
 * @param {number} num
 * @param {number} size - The required size in bytes, eg 1 for Uint8, 2 for Uint16. Defaults to 1.
 * @param {boolean} littleEndian - Encode the hex in little endian form
 * @return {string}
 */
export const num2hexstring = (num: number, size = 1, littleEndian = false) => {
    if (num < 0) {
        throw new RangeError('num must be >=0');
    }
    if (size % 1 !== 0) {
        throw new Error('size must be a whole integer');
    }
    if (!Number.isSafeInteger(num)) {
        throw new RangeError(`num (${num}) must be a safe integer`);
    }

    size = size * 2;
    let hexstring = num.toString(16);
    hexstring = hexstring.length % size === 0 ? hexstring : ('0'.repeat(size) + hexstring).substring(hexstring.length);
    if (littleEndian) {
        hexstring = reverseHex(hexstring);
    }
    return hexstring;
};

/**
 * Turn normal string into ArrayBuffer
 * @param str Normal string
 */
export function str2ab(str: string) {
    const buf = new ArrayBuffer(str.length); // 每个字符占用1个字节
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

/**
 * Turn ArrayBuffer or array-like oject into normal string
 * @param buf
 */
export function ab2str(buf: ArrayBuffer | number[]): string {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

/**
 * Turn normal string into hex string
 * @param str Normal string
 */
export function str2hexstr(str: string) {
    return ab2hexstring(str2ab(str));
}

/**
 * Turn hex string into normal string
 * @param str Hex string
 */
export function hexstr2str(str: string) {
    return ab2str(hexstring2ab(str));
}

/**
 * return the (length of bytes) + bytes
 * @param hex Hex string
 */
export function hex2VarBytes(hex: string) {
    let result = '';
    result += num2VarInt(hex.length / 2);
    result += hex;
    return result;
}

/**
 * Converts a number to a hex
 * @param {number} num - The number
 * @returns {string} hexstring of the variable Int.
 */
export const num2VarInt = (num: number) => {
    if (num < 0xfd) {
        return num2hexstring(num);
    } else if (num <= 0xffff) {
        // uint16
        return 'fd' + num2hexstring(num, 2, true);
    } else if (num <= 0xffffffff) {
        // uint32
        return 'fe' + num2hexstring(num, 4, true);
    } else {
        // uint64
        return 'ff' + num2hexstring(num, 8, true);
    }
};



// @ts-ignore
export function bigIntToBytes(value: Long) {
    let data = value.toBytesLE();
    const negData = value.neg().toBytesLE();
    let stop;
    if (value.isNegative()) {
        stop = 255;
    } else {
        stop = 0;
    }
    let b = stop;
    let pos = 0;
    for (let i = data.length - 1; i >= 0; i--) {
        if (data[i] !== stop) {
            b = value.isNegative() ? negData[i] : data[i];
            pos = i + 1;
            break;
        }
    }
    data = data.slice(0, pos);

    if (b >> 7 === 1) {
        data.push(value.isNegative() ? 255 : 0);
    }
    return new Buffer(data).toString('hex');
}

/**
 * Reverses a hex string, 2 chars as 1 byte
 * @example
 * reverseHex('abcdef') = 'efcdab'
 * @param {string} hex - HEX string
 * @return {string} reversed hex string.
 */
export const reverseHex = (hex: string) => {
    if (hex.length % 2 !== 0) {
        throw new Error(`Incorrect Length: ${hex}`);
    }
    let out = '';
    for (let i = hex.length - 2; i >= 0; i -= 2) {
        out += hex.substr(i, 2);
    }
    return out;
};


/**
 * Computes ripemd-160 hash of sha-256 hash from hex encoded data.
 *
 * @param data Hex encoded data
 */
export function hash160(SignatureScript: string): string {
    return ripemd160(sha256(SignatureScript));
}

/**
 * Computes ripemd-160 hash from hex encoded data.
 *
 * @param data Hex encoded data
 */
export function ripemd160(data: string) {
    const hex = cryptoJS.enc.Hex.parse(data);
    const ripemd = cryptoJS.RIPEMD160(hex).toString();
    return ripemd;
}

export function isHexString(str: string): boolean {
    const regexp = /^[0-9a-fA-F]+$/;
    return regexp.test(str) && (str.length % 2 === 0);
}

export function isBase64(str: string): boolean {
    return Buffer.from(str, 'base64').toString('base64') === str;
}

/**
 * Concat params as the query part in rest
 * @param params
 */
export function concatParams(params: Map<string, string>) {
    let result = '';
    if (params.size === 0) {
        return '';
    }

    for (const key of params.keys()) {
        let value = params.get(key);
        if (value) {
            value = encodeURIComponent(value);
        }
        result += `&${key}=${value}`;
    }

    return '?' + result.substr(1);
}

export function keystoreCheck(keystore: object) {
    if(!keystore.hasOwnProperty('accounts')) {
        throw ERROR_CODE.Keystore_ERROR;
    }

    let account = keystore.accounts[0];

    if(!account.hasOwnProperty('address')) {
        throw ERROR_CODE.Keystore_ERROR;
    }

    if(!account.hasOwnProperty('key')) {
        throw ERROR_CODE.Keystore_ERROR;
    }

    if(!account.hasOwnProperty('salt')) {
        throw ERROR_CODE.Keystore_ERROR;
    }
}
