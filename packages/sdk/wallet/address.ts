import * as base58 from 'base-58';
import { ADDR_VERSION } from '../common/consts';
import { ERROR_CODE } from '../common/error';
import opcode from '../common/opCode';
import { sha256, ab2hexstring, hash160, reverseHex, num2hexstring} from '../common/functionsUtils';
import { comparePublicKeys, programFromPubKey, pushBigInt, pushHexString} from '../crypto/programs';
import { PublicKey } from "../crypto/publicKey";

export class Address {
    /**
     * Base58 or Hex encoded address
     */
    value: string;

    constructor(value: string) {
        if (value.length === 40 || value.length === 34) {
            this.value = value;
        } else {
            throw ERROR_CODE.INVALID_PARAMS;
        }
    }

    /**
     * Generate address from public key.
     *
     * @param publicKey Public key to use
     */
    static fromPubKey(publicKey: PublicKey): Address {
        const program = programFromPubKey(publicKey);
        const programHash = hash160(program);
        return new Address(programHash);
    }

    /**
     * Generates (m, n) threshold address.
     *
     * m - threshold
     * n - total number of public keys
     *
     * @param m The threshold
     * @param publicKeys Public key
     */
    static fromMultiPubKeys(m: number, publicKeys: PublicKey[]): Address {
        const n = publicKeys.length;

        if (m <= 0 || m > n || n > 24) {
            throw ERROR_CODE.INVALID_PARAMS;
        }

        // const pkHexStrs = publicKeys.map((p) => p.serializeHex());
        // pkHexStrs.sort();
        publicKeys.sort(comparePublicKeys);
        let result = '';
        result += pushBigInt(m);
        for (const s of publicKeys) {
            result += pushHexString(s.serializeHex());
        }
        result += pushBigInt(n);
        result += num2hexstring(opcode.CHECKMULTISIG);
        const programHash = hash160(result);
        return new Address(programHash);
    }

    /**
     * Gets Base58 encoded representation of the address.
     */
    toBase58() {
        if (this.value.length === 34) {
            return this.value;
        } else {
            return hexToBase58(this.value);
        }
    }

    /**
     * Gets Hex encoded representation of the address.
     */
    toHexString() {
        if (this.value.length === 40) {
            return reverseHex(this.value);
        } else {
            return reverseHex(base58ToHex(this.value));
        }
    }

    serialize() {
        if (this.value.length === 40) {
            return this.value;
        } else {
            return base58ToHex(this.value);
        }
    }
}

function hexToBase58(hexEncoded: string): string {
    const data = ADDR_VERSION + hexEncoded;
    const hash = sha256(data);
    const checksum = hash.slice(0, 8);
    const datas = data + checksum;
    return base58.encode(new Buffer(datas, 'hex'));
}

function base58ToHex(base58Encoded: string) {
    const decoded = base58.decode(base58Encoded);
    const hexEncoded = ab2hexstring(decoded).substr(2, 40);
    if (base58Encoded !== hexToBase58(hexEncoded)) {
        throw new Error('[addressToU160] decode encoded verify failed');
    }
    return hexEncoded;
}
