import { BigNumber } from 'bignumber.js';
import opcode from "./opCode";
import { BigInt } from "./classesUtils";
import { num2hexstring } from "./functionsUtils";

export const pushBool = (param: boolean) => {
    let result = '';
    if (param) {
        result += num2hexstring(opcode.PUSHT);
    } else {
        result += num2hexstring(opcode.PUSHF);
    }
    return result;
};

export const pushInt = (param: number) => {
    let result = '';
    if (param === -1) {
        result = num2hexstring(opcode.PUSHM1);
    } else if (param === 0) {
        result = num2hexstring(opcode.PUSH0);
    } else if (param > 0 && param < 16) {
        const num = opcode.PUSH1 - 1 + param;
        result = num2hexstring(num);
    } else {
        const biHex = new BigInt(param.toString()).toHexstr();
        result = pushHexString(biHex);
    }

    return result;
};

export const pushBigNum = (param: BigNumber) => {
    let result = '';
    if (param.isEqualTo(-1)) {
        result = num2hexstring(opcode.PUSHM1);
    } else if (param.isEqualTo(0)) {
        result = num2hexstring(opcode.PUSH0);
    } else if (param.isGreaterThan(0) && param.isLessThan(16)) {
        const num = opcode.PUSH1 - 1 + param.toNumber();
        result = num2hexstring(num);
    } else {
        const biHex = new BigInt(param.toString()).toHexstr();
        result = pushHexString(biHex);
    }
    return result;
};

export const pushHexString = (param: string) => {
    let result = '';
    const len = param.length / 2;
    if (len <= opcode.PUSHBYTES75) {
        result += num2hexstring(len);
    } else if (len < 0x100) {
        result += num2hexstring(opcode.PUSHDATA1);
        result += num2hexstring(len);
    } else if (len < 0x10000) {
        result += num2hexstring(opcode.PUSHDATA2);
        result += num2hexstring(len, 2, true);
    } else {
        result += num2hexstring(opcode.PUSHDATA4);
        result += num2hexstring(len, 4, true);
    }
    result += param;
    return result;
};
