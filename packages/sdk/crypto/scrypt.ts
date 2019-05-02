import * as asyncScrypt from 'scrypt-async';
//import asyncScrypt from './scrypt-async.min.js';
import { createCipheriv, createDecipheriv } from 'crypto';
import { DEFAULT_SCRYPT } from "../common/consts";
import { ERROR_CODE } from "../common/error";
import { hexstring2ab, isHexString } from "../common/functionsUtils";
import { Address } from "../wallet/address";


export interface ScryptParams {
    cost: number;
    blockSize: number;
    parallel: number;
    size: number;
}

/**
 * Synchronious call to scrypt-async-js.
 *
 * @param keyphrase Keyphrase to use
 * @param addressHash Hex encoded address
 * @param params Scrypt params
 */
function scrypt(keyphrase: string, addressHash: string, params: ScryptParams) {
    let derived: number[] = [];
    asyncScrypt(
        keyphrase.normalize('NFC'),
        hexstring2ab(addressHash),
        {
            N: params.cost,
            r: params.blockSize,
            p: params.parallel,
            dkLen: params.size
        },
        (result: string | number[]) => {
            derived = result as number[];
        }
    );
    return new Buffer(derived);
}

/**
 * Encrypt with aes-gcm-256
 * This is the default encryption algorithm for private key
 * @param privateKey Private key to encpryt with
 * @param address Adderss to encrypt with
 * @param salt Salt to encrypt with
 * @param keyphrase User's password
 * @param scryptParams Optional params to encrypt
 */
export function encryptWithGcm(
    privateKey: string,
    address: Address,
    salt: string,
    keyphrase: string,
    scryptParams: ScryptParams
) {
    if (!isHexString(privateKey)) {
        throw new Error(ERROR_CODE.INVALID_PARAMS + ', Invalid private key');
    }
    const derived = scrypt(keyphrase, salt, scryptParams);
    const derived1 = derived.slice(0, 12);
    const derived2 = derived.slice(32);
    const key = derived2;
    const iv = derived1;
    const aad = new Buffer(address.toBase58());
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(aad);
    const plainText = Buffer.from(privateKey, 'hex');
    let ciphertext = cipher.update(plainText);
    const final = cipher.final();
    const authTag = cipher.getAuthTag();
    ciphertext = Buffer.concat([ciphertext, final]);

    const result = Buffer.concat([ciphertext, authTag]);
    return result.toString('base64');
}

/**
 * Decrypt with aes-256-gcm
 * @param encrypted Encrypted private key
 * @param address Address to decrypt with
 * @param salt Salt to decrypt with
 * @param keyphrase User's password
 * @param scryptParams Optioanl params to decrypt with
 */
export function decryptWithGcm(
    encrypted: string,
    address: Address,
    salt: string,
    keyphrase: string,
    scryptParams: ScryptParams
) {
    if (salt.length !== 32) {
        throw ERROR_CODE.INVALID_PARAMS;
    }
    const result = Buffer.from(encrypted, 'base64');
    const ciphertext = result.slice(0, result.length - 16);
    const authTag = result.slice(result.length - 16);
    const derived = scrypt(keyphrase, salt, scryptParams);
    const derived1 = derived.slice(0, 12);
    const derived2 = derived.slice(32);
    const key = derived2;
    const iv = derived1;
    const aad = new Buffer(address.toBase58());
    // const auth = new Buffer(authTag, 'hex');
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(aad);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(ciphertext).toString('hex');
    try {
        decrypted += decipher.final().toString('hex');
    } catch (err) {
        throw ERROR_CODE.Decrypto_ERROR;
    }
    return decrypted;
}

