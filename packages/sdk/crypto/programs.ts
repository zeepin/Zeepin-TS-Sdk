import * as elliptic from 'elliptic';
import { BigInt } from "../common/classesUtils";
import { StringReader } from "../common/classesUtils";
import { PublicKey } from "./publicKey";
import opcode from "../common/opCode";
import { num2hexstring } from "../common/functionsUtils";
import { ERROR_CODE } from "../common/error";
import { KeyType } from "./cryptoParams";

export function comparePublicKeys(a: PublicKey, b: PublicKey) {
    if (a.algorithm !== b.algorithm) {
        return a.algorithm.hex - b.algorithm.hex;
    }
    switch (a.algorithm) {
        case KeyType.ECDSA:
            const ec = new elliptic.ec(a.parameters.curve.preset);
            const paKey = ec.keyFromPublic(a.key, 'hex', true);
            const pbKey = ec.keyFromPublic(b.key, 'hex', true);
            const pa = paKey.getPublic();
            const pb = pbKey.getPublic();
            if (pa.getX() !== pb.getX()) {
                return pa.getX() - pb.getX();
            } else {
                return pa.getY() - pb.getY();
            }
        case KeyType.EDDSA:
            return Number(a.key) - Number(b.key);
        default:
            return 0;
    }
}

export function programFromPubKey(pk: PublicKey): string {
    let result = '';
    result += pushPubKey(pk);
    result += pushOpCode(opcode.CHECKSIG);
    return result;
}

export function programFromMultiPubKey(pubkeys: PublicKey[], m: number): string {
    const n = pubkeys.length;
    if (!(1 <= m && m <= n && n <= 1024)) {
        throw new Error('Wrong multi-sig param');
    }

    pubkeys.sort(comparePublicKeys);

    let result = '';
    result += pushNum(m);

    for (const pk of pubkeys) {
        result += pushBytes(pk.serializeHex());
    }
    result += pushNum(n);
    result += pushOpCode(opcode.CHECKMULTISIG);
    return result;
}

export function pushNum(num: number): string {
    if ( num === 0 ) {
        return pushOpCode(opcode.PUSH0);
    } else if ( num <= 16 ) {
        return num2hexstring(num - 1 + opcode.PUSH1);
    }
    const bint = new BigInt(num.toString());
    return pushBytes(bint.toHexstr());
}

export function pushPubKey(pk: PublicKey): string {
    const pkStr = pk.serializeHex();
    return pushBytes(pkStr);
}

export function pushOpCode(op: opcode): string {
    return num2hexstring(op);
}

export function pushBytes(hexstr: string): string {
    let result = '';
    if (hexstr.length === 0) {
        throw new Error('pushBytes error, hexstr is empty.');
    }
    const len = hexstr.length / 2;
    if (len <= opcode.PUSHBYTES75 + 1 - opcode.PUSHBYTES1 ) {
        result += num2hexstring(len + opcode.PUSHBYTES1 - 1);
    } else if (len < 0x100) {
        result += num2hexstring(opcode.PUSHDATA1);
        result += num2hexstring(len);
    } else if (len < 0x10000) {
        result += num2hexstring(opcode.PUSHDATA2);
        result += num2hexstring(len, 2, true);
    } else if (len < 0x100000000) {
        result += num2hexstring(opcode.PUSHDATA4);
        result += num2hexstring(len, 4, true);
    } else {
        throw ERROR_CODE.INVALID_PARAMS;
    }
    result += hexstr;
    return result;
}

export function readOpcode(sr: StringReader) {
    return parseInt(sr.read(1), 16);
}

export function readBytes(sr: StringReader) {
    const code = readOpcode(sr);
    let keylen;
    if (code === opcode.PUSHDATA4) {
        keylen = sr.readUint32();
    } else if (code === opcode.PUSHDATA2) {
        keylen = sr.readUint16();
    } else if (code === opcode.PUSHDATA1) {
        keylen = sr.readUint8();
    } else if (code <= opcode.PUSHBYTES75 && code >= opcode.PUSHBYTES1) {
        keylen = code - opcode.PUSHBYTES1 + 1;
    } else {
        throw new Error('unexpected opcode: ' + code);
    }
    return sr.read(keylen);
}

export function getParamsFromProgram(hexstr: string): string[] {
    const sigs:string[] = [];
    const sr = new StringReader(hexstr);
    while (!sr.isEmpty()) {
        sigs.push(readBytes(sr));
    }
    return sigs;
}


export class ProgramInfo {
    M: number = 0;
    pubKeys: PublicKey[] = [];
}

export function readPubKey(sr: StringReader) {
    const pkStr = sr.readNextBytes();
    return PublicKey.deserializeHex(new StringReader(pkStr));
}

export function getProgramInfo(hexstr: string): ProgramInfo {
    const info = new ProgramInfo();
    const end = parseInt(hexstr.substr(-2, 2), 16);
    if (end === opcode.CHECKSIG) {
        const sr = new StringReader(hexstr);
        const pk = readPubKey(sr);
        info.M = 1;
        info.pubKeys = [pk];
        return info;
    } else if (end === opcode.CHECKMULTISIG) {
        const sr = new StringReader(hexstr);
        const m = parseInt(sr.read(1), 16) - opcode.PUSH1 + 1;
        const n = parseInt(hexstr.substr(-4, 2), 16) - opcode.PUSH1 + 1;
        info.M = m;
        info.pubKeys = [];
        for (let i = 0; i < n; i++) {
            const key = readPubKey(sr);
            info.pubKeys.push(key);
        }
        // const n = readNum(sr);
        return info;
    } else {
        throw new Error('Unsupported program.');
    }
}

export function programFromParams(sigs: string[]): string {
    let result = '';
    sigs.sort();
    for ( const s of sigs) {
        result += pushBytes(s);
    }
    return result;
}

