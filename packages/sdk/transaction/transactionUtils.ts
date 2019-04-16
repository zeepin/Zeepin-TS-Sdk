import { Fixed64 } from '../common/classesUtils';
import { BigNumber } from 'bignumber.js'
import { TOKEN_TYPE, ZPT_CONTRACT, GALA_CONTRACT, NATIVE_INVOKE_NAME } from "../common/consts";
import opcode from '../common/opCode';
import { pushHexString, pushInt, pushBigNum, pushBool } from "../common/constsUtils";
import { str2hexstr, num2hexstring } from "../common/functionsUtils";
import { Address } from "../wallet/address";
import { InvokeCode } from "./payload";
import { TxType, Transaction, Transfer } from "./transaction";


export class Struct {
    list: any[];
    constructor() {
        this.list = [];
    }
    add(...args: any[]) {
        for (const a of args) {
            this.list.push(a);
        }
    }
}

export function getTokenContract(tokenType: string) {
    if (tokenType === TOKEN_TYPE.ZPT) {
        return new Address(ZPT_CONTRACT);
    } else if (tokenType === TOKEN_TYPE.GALA) {
        return new Address(GALA_CONTRACT);
    } else {
        throw new Error('Error token type.');
    }
}

export function verifyAmount(amount: number | string) {
    const value = new BigNumber(amount);
    if (!value.isInteger() || value.lte(new BigNumber(0))) {
        throw new Error('Amount is invalid.');
    }
}

export function createCodeParamScript(obj: any): string {
    let result = '';
    if (typeof obj === 'string') {
        result += pushHexString(obj);
    } else if (typeof obj === 'boolean') {
        result += pushBool(obj);
    } else if (typeof obj === 'number') {
        result += pushInt(obj);
    } else if (obj instanceof BigNumber) {
        result += pushBigNum(obj);
    } else if (obj instanceof Address) {
        result += pushHexString(obj.serialize());
    } else if (obj instanceof Struct) {
        for (const v of obj.list) {
            result += createCodeParamScript(v);
            result += num2hexstring(opcode.DUPFROMALTSTACK);
            result += num2hexstring(opcode.SWAP);
            result += num2hexstring(opcode.APPEND);
        }
    }
    return result;
}

export function buildNativeCodeScript(list: any[]) {
    let result = '';
    for (let i = list.length - 1; i >= 0; i--) {
        const val = list[i];
        // Consider string as hexstr
        if (typeof val === 'string') {
            result += pushHexString(val);
        } else if (typeof val === 'boolean') {
            result += pushBool(val);
        } else if (typeof val === 'number') {
            result += pushInt(val);
        } else if (val instanceof BigNumber) {
            result += pushBigNum(val);
        } else if (val instanceof Address) {
            result += pushHexString(val.serialize());
        } else if (val instanceof Struct) {
            result += pushInt(0);
            result += num2hexstring(opcode.NEWSTRUCT);
            result += num2hexstring(opcode.TOALTSTACK);
            for (const v of val.list) {
                result += createCodeParamScript(v);
                result += num2hexstring(opcode.DUPFROMALTSTACK);
                result += num2hexstring(opcode.SWAP);
                result += num2hexstring(opcode.APPEND);
            }
            result += num2hexstring(opcode.FROMALTSTACK);
        } else if (Array.isArray(val)) {
            result += buildNativeCodeScript(val);
            result += pushInt(val.length);
            result += num2hexstring(opcode.PACK);
        }
    }
    return result;
}

export function makeNativeContractTx(
    funcName: string,
    params: string,
    contractAddr: Address,
    gasPrice?: string,
    gasLimit?: string,
    payer?: Address
) {
    let code = '';
    code += params;
    code += pushHexString(str2hexstr(funcName));
    code += pushHexString(contractAddr.serialize());
    code += pushInt(0);
    code += num2hexstring(opcode.SYSCALL);
    code += pushHexString(str2hexstr(NATIVE_INVOKE_NAME));
    const payload = new InvokeCode();
    payload.code = code;
    let tx: Transaction;
    if (funcName === 'transfer' || funcName === 'transferFrom') {
        tx = new Transfer();
    } else {
        tx = new Transaction();
    }
    tx.type = TxType.Invoke;
    tx.payload = payload;
    if (gasLimit) {
        tx.gasLimit = new Fixed64(gasLimit);
    }
    if (gasPrice) {
        tx.gasPrice = new Fixed64(gasPrice);
    }
    if (payer) {
        tx.payer = payer;
    }
    return tx;
}
