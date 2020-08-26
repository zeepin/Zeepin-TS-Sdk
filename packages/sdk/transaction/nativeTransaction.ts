import { BigNumber } from 'bignumber.js';
import { Address } from "../wallet/address";
import { PrivateKey } from "../crypto/privateKey";
import { PublicKey } from '../crypto/publicKey';
import { SignatureScheme } from "../crypto/cryptoParams";
import { Struct, getTokenContract, verifyAmount, buildNativeCodeScript, makeNativeContractTx, createCodeParamScript } from "./transactionUtils";
import { Transaction, Transfer } from "./transaction";
import { TxSignature } from "./txSignature";
import { ERROR_CODE } from "../common/error";
import { reverseHex ,isBase64} from "../common/functionsUtils";
import { ZPT_CONTRACT, GALA_CONTRACT, TX_MAX_SIG_SIZE } from "../common/consts";
import { comparePublicKeys } from '../crypto/programs';

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
    const list:any[] = [];
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

export function makeWithdrawGala(
    from: Address,
    to: Address,
    amount: number | string,
    payer: Address,
    gasPrice: string,
    gasLimit: string
): Transfer {
    verifyAmount(amount);
    const num = new BigNumber(amount);
    const list = [];
    const struct = new Struct();
    struct.add(from, new Address(ZPT_CONTRACT), to, num);
    list.push(struct);
    const args = buildNativeCodeScript(list);
    const tx: Transfer = makeNativeContractTx(
        'transferFrom', args, new Address(GALA_CONTRACT), gasPrice, gasLimit) as any;
    tx.payer = payer;
    tx.tokenType = 'gala';
    tx.from = from;
    tx.to = to;
    tx.amount = amount;
    tx.method = 'transferFrom';
    return tx;
}

export const signTransaction = (tx: Transaction, privateKey: PrivateKey, schema?: SignatureScheme) => {
    const signature = TxSignature.create(tx, privateKey, schema);
    tx.sigs = [signature];
};

/**
 * Signs the transaction with multiple signatures with multi-sign keys.
 *
 * If there is already a signature, the new ones will be added to the end.
 * If the signature schema is not provided, default schema for Private key type is used.
 *
 * @param tx Transaction to sign
 * @param M m of the (m ,n) multi sign address threshold
 * @param pubKeys Array of Public keys of (m,n) multi sign address, the number is n
 * @param privateKey Private key to sign the tx.
 * @param scheme Signature scheme to use
 */
export const signTx = (tx: Transaction, M: number, pubKeys: PublicKey[],
    privateKey: PrivateKey, scheme?: SignatureScheme) => {

    if (tx.sigs.length === 0) {
        tx.sigs = [];
    } else {
        if (tx.sigs.length > TX_MAX_SIG_SIZE || M > pubKeys.length || M <= 0 || pubKeys.length === 0) {
            throw ERROR_CODE.INVALID_PARAMS;
        }
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < tx.sigs.length; i++) {
            if (equalPks(tx.sigs[i].pubKeys, pubKeys)) {
                if (tx.sigs[i].sigData.length + 1 > pubKeys.length) {
                    throw new Error('Too many sigData');
                }
                const signData = privateKey.sign(tx, scheme).serializeHex();
                tx.sigs[i].sigData.push(signData);
                return;
            }
        }
    }
    const sig = new TxSignature();
    sig.M = M;
    sig.pubKeys = pubKeys;
    sig.sigData = [privateKey.sign(tx, scheme).serializeHex()];
    tx.sigs.push(sig);
};

const equalPks = (pks1: PublicKey[], pks2: PublicKey[]): boolean => {
    if (pks1 === pks2) {
        return true;
    }
    pks1.sort(comparePublicKeys);
    pks2.sort(comparePublicKeys);
    if (pks1.length !== pks2.length) {
        return false;
    }
    for (let i = 0; i < pks1.length; i++) {
        if (pks1[i].key !== pks2[i].key) {
            return false;
        }
    }
    return true;
};

export function nativeTransfer(
    tokenType: string,
    from: string,
    to: string,
    amount: number | string,
    gasPrice: string,
    gasLimit: string,
    fromKey: string,
    payer?: string,
): string {
    if(tokenType !== 'zpt' && tokenType !== 'gala'){
        throw ERROR_CODE.INVALID_PARAMS;
    }
    const fromAddr = new Address(from);
    const toAddr = new Address(to);
    let tx;
    if(!payer) {
        tx = makeTransferTx(tokenType, fromAddr, toAddr, amount, gasPrice, gasLimit);
    } else {
        const payerAddr = new Address(payer);
        tx = makeTransferTx(tokenType, fromAddr, toAddr, amount, gasPrice, gasLimit, payerAddr);
    }
    const fromPK = new PrivateKey(fromKey)
    signTransaction(tx, fromPK);
    return tx.serialize();
}


export function withdrawGala(
    tokenType: string,
    claimer: string,
    to: string,
    amount: number | string,
    gasPrice: string,
    gasLimit: string,
    claimerKey: string,
    payer?: string,
): string {
    if (tokenType !== 'gala') {
        throw ERROR_CODE.INVALID_PARAMS;
    }
    const claimerAddr = new Address(claimer);
    const toAddr = new Address(to);
    let tx;
    tx = makeWithdrawGala(claimerAddr, toAddr, amount, claimerAddr, gasPrice, gasLimit);
    const claimerPK = new PrivateKey(claimerKey)
    signTransaction(tx, claimerPK);
    return tx.serialize();
}

export function makeMultiSignTransaction(asset: string, from: string, to: string, amount: string, gasPrice: string,
    gasLimit: string, payer?: string,) {
    let fromAddress: Address;
    let toAddress: Address;
    try {
        fromAddress = new Address(from);
        toAddress = new Address(to);
       
    } catch (err) {
        const result = {
            error: ERROR_CODE.INVALID_PARAMS,
            result: ''
        };
        return result;
    }
    let tx;
    if (!payer) {
        tx = makeTransferTx(asset, fromAddress, toAddress, amount, gasPrice, gasLimit);
    } else {
        const payerAddr = new Address(payer);
        tx = makeTransferTx(asset, fromAddress, toAddress, amount, gasPrice, gasLimit, payerAddr);
    }
    const result = {
        error: ERROR_CODE.SUCCESS,
        txHash: reverseHex(tx.getSignContent()),
        txData: tx.serialize()
    };
    return result;
}

export function signMultiAddrTransaction(
    encryptedPrivateKey: string,
    address: string,
    salt: string,
    password: string,
    pks: PublicKey[],
    requiredSignatureNum: string,
    txDada: string) {
    password = transformPassword(password);
    let privateKey = new PrivateKey(encryptedPrivateKey)
    // let privateKey: PrivateKey;
    // const encryptedPrivateKeyObj = new PrivateKey(encryptedPrivateKey);
    // try {
    //     const addr = new Address(address);
    //     const saltHex = Buffer.from(salt, 'base64').toString('hex');
    //     privateKey = encryptedPrivateKeyObj.decrypt(password, addr, saltHex);
    // } catch (err) {
    //     const result = {
    //         error: ERROR_CODE.Decrypto_ERROR,
    //         result: ''
    //     };
    //     return result;
    // }
    const M = parseInt(requiredSignatureNum, 10);
    const tx = Transaction.deserialize(txDada);
    // const pubs = JSON.parse(allRelatedPks);
    // const pks = pubs.map((p: string) => new PublicKey(p));
    signTx(tx, M, pks, privateKey);
    const result = {
        error: ERROR_CODE.SUCCESS,
        signedHash: tx.serialize()
    };
    return result;
}

export function transformPassword(password: string) {
    if (isBase64(password)) {
        return Buffer.from(password, 'base64').toString();
    }
    return password;
}

