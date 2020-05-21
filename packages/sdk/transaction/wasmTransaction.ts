import { Fixed64 } from "../common/classesUtils";
import { Address } from "../wallet/address";
import { TxType, Transaction } from "./transaction";
import { InvokeCode } from "./payload";
import {str2hexstr, reverseHex, num2hexstring, hexstr2str} from "../common/functionsUtils";
import {CONTRACTS_TEST, defaultPayer, defaultPrivateKey} from "../common/consts";
import RestClient from "../network/rest/restClient";
import {PrivateKey} from "../crypto/privateKey";
import {makeTransferTx, signTransaction} from "./nativeTransaction";
import { ERROR_CODE } from "../common/error";
import opcode from "../common/opCode";
import { Parameter } from '../smartcontract/abi/parameter';
import AbiFunction from '../smartcontract/abi/abiFunction';
import { buildWasmContractParam, createCodeParamsScript, serializeAbiFunction, writeVarBytes } from './scriptBuilder';
import { ParameterType } from './../smartcontract/abi/parameter';

export class contractParams{
    type:string='string';
    value:string='';
}

export class sendingParams{
    Params:Array<contractParams> = new Array<contractParams>();
}

export function makeInvokeTransaction (
    method: string,
    args: any,
    contractAddr: string,
    gasPrice?: string,
    gasLimit?: string,
    payer?: Address
    ): Transaction {
        const tx = new Transaction();
        tx.type = TxType.Invoke;
        let params : Array<contractParams> = new Array<contractParams>();

        for(let i=0; i<args.length; i++){
            let _param = new contractParams();
            _param.value = args[i];
            params.push(_param);
        }

        let sendingArg = new sendingParams();
        sendingArg.Params = params;

        let argstr = JSON.stringify(sendingArg);

        let resultByte = str2hexstr('1') + reverseHex(contractAddr) + num2hexstring(method.length)
            + str2hexstr(method) + num2hexstring(argstr.length) + str2hexstr(argstr);

        const payload = new InvokeCode();
        payload.code = resultByte;
        tx.payload = payload;
        tx.txAttributes = 0x01;

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
};

export const makeMutilInvokeTransaction = (
    funcName: string,
    params: Parameter[] | string,
    contractAddr: Address,
    gasPrice?: string,
    gasLimit?: string,
    payer?: Address,
    ledgerCompatible: boolean = true
) => {
    const tx = new Transaction();
    tx.type = TxType.Invoke;

    let args = '';
    if (typeof params === 'string') {
        args = params;
    } else {
        const abiFunc = new AbiFunction(funcName, '', params);
        args = serializeAbiFunction(abiFunc, ledgerCompatible);
    }
    let code = args + num2hexstring(opcode.APPCALL);
    code += contractAddr.serialize();

    const payload = new InvokeCode();
    payload.code = code;
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
};

export function getContractBalance(
    url: string,
    contractAddr: string,
    address: string
): Promise<any> {
    return new Promise((resolve, reject) => {
        const payer = new Address(defaultPayer);
        const privateKey = new PrivateKey(defaultPrivateKey);
        let args:string[] = [];
        args.push(address);
        let tx = makeInvokeTransaction('balanceOf', args, contractAddr, '1', '20000', payer);
        signTransaction(tx, privateKey);
        const rest = new RestClient(url);
        rest.sendRawTransaction(tx.serialize(), true).then((res)=> {
            const balance = hexstr2str(res.Result.Result);
            if(balance === '')
                resolve('0');
            resolve(balance);
        });
    })
}

export function wasmTransfer(
    contractAddr: string,
    from: string,
    to: string,
    amount: string,
    gasPrice: string,
    gasLimit: string,
    fromKey: string,
    payer?: string,
): String {
    let args:string[] = [];
    args.push(from);
    args.push(to);
    args.push(amount);
    let tx;
    if(!payer) {
        const fromAddr = new Address(from);
        tx = makeInvokeTransaction('transfer', args, contractAddr, gasPrice, gasLimit, fromAddr);
    } else {
        const payerAddr = new Address(payer);
        tx = makeInvokeTransaction('transfer', args, contractAddr, gasPrice, gasLimit, payerAddr);
    }
    const fromPK = new PrivateKey(fromKey)
    signTransaction(tx, fromPK);
    return tx.serialize();
}

export function makeMultiSignWasmTransaction(
    contractAddr: string,
    from: string,
    to: string,
    amount: string,
    gasPrice: string,
    gasLimit: string,
    payer?: string,
): String {
    let args: string[] = [];
    args.push(from);
    args.push(to);
    args.push(amount);
    let tx;
    if (!payer) {
        const fromAddr = new Address(from);
        tx = makeInvokeTransaction('transfer', args, contractAddr, gasPrice, gasLimit, fromAddr);
    } else {
        const payerAddr = new Address(payer);
        tx = makeInvokeTransaction('transfer', args, contractAddr, gasPrice, gasLimit, payerAddr);
    }
    return tx.serialize();
}

