import { BigNumber } from 'bignumber.js';
import { Address } from "../wallet/address";
import { PrivateKey } from "../crypto/privateKey";
import { SignatureScheme } from "../crypto/cryptoParams";
import { Struct, getTokenContract, verifyAmount, buildNativeCodeScript, makeNativeContractTx } from "./transactionUtils";
import { Transaction, Transfer } from "./transaction";
import { TxSignature } from "./txSignature";
import {ERROR_CODE} from "../common/error";

export function makeTransferTx(
    tokenType: string,
    from: Address,
    to: Address,
    amount: number | string,
    gasPrice: string,
    gasLimit: string,
    payer?: Address
): Transfer {
    verifyAmount(amount);
    const num = new BigNumber(amount);
    const struct = new Struct();
    struct.add(from, to, num);
    const list = [];
    list.push([struct]);

    const contract = getTokenContract(tokenType);
    const params = buildNativeCodeScript(list);
    const tx: Transfer = makeNativeContractTx('transfer', params, contract, gasPrice, gasLimit) as any;

    tx.tokenType = tokenType;
    tx.from = from;
    tx.to = to;
    tx.amount = amount;
    tx.method = 'transfer';
    if (payer) {
        tx.payer = payer;
    } else {
        tx.payer = from;
    }
    return tx;
}

export const signTransaction = (tx: Transaction, privateKey: PrivateKey, schema?: SignatureScheme) => {
    const signature = TxSignature.create(tx, privateKey, schema);
    tx.sigs = [signature];
};

export function nativeTransfer(
    tokenType: string,
    from: string,
    to: string,
    amount: number | string,
    gasPrice: string,
    gasLimit: string,
    fromKey?: string,
    payer?: string,
    payerKey?: string
): string {
    if(tokenType !== 'zpt' && tokenType !== 'gala'){
        throw ERROR_CODE.INVALID_PARAMS;
    }
    const fromAddr = new Address(from);
    const toAddr = new Address(to);
    let tx;
    if(!payer) {
        if(fromKey) {
            tx = makeTransferTx(tokenType, fromAddr, toAddr, amount, gasPrice, gasLimit);
            const fromPK = new PrivateKey(fromKey)
            signTransaction(tx, fromPK);
        } else {
            throw ERROR_CODE.INVALID_PARAMS;
        }
    } else {
        const payerAddr = new Address(payer);
        if(payerKey) {
            tx = makeTransferTx(tokenType, fromAddr, toAddr, amount, gasPrice, gasLimit, payerAddr);
            const payerPK = new PrivateKey(payerKey);
            signTransaction(tx, payerPK);
        } else {
            throw ERROR_CODE.INVALID_PARAMS;
        }
    }
    return tx.serialize();
}
