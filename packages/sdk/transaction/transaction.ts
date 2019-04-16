import * as cryptoJS from 'crypto-js';
import { Fixed64, StringReader } from "../common/classesUtils";
import { randomBytes, num2hexstring } from "../common/functionsUtils";
import { Address } from "../wallet/address";
import { Payload, InvokeCode } from "./payload";
import { Signable } from "../crypto/signable";
import { TxSignature } from "./txSignature";

export enum TxType  {
    BookKeeper      = 0x02,
    Claim           = 0x03,
    Deploy          = 0xd0,
    Invoke          = 0xd1,
    Enrollment      = 0x04,
    Vote            = 0x05
}

export class Transaction implements Signable {
    type: TxType = 0xd1;
    version: number = 0x00;
    payload: Payload;
    nonce: string;
    txAttributes: number = 0x00;
    gasPrice: Fixed64;
    gasLimit: Fixed64;
    payer: Address;
    sigs: TxSignature[] = [];

    constructor() {
        this.payload = new InvokeCode();
        this.nonce = randomBytes(4);
        this.gasPrice = new Fixed64();
        this.gasLimit = new Fixed64();
        this.payer = new Address('0000000000000000000000000000000000000000');
    }

    static deserialize(hexstring: string): Transaction {
        const tx = new Transaction();
        const ss = new StringReader(hexstring);

        tx.version = parseInt(ss.read(1), 16);
        tx.type = parseInt(ss.read(1), 16);
        tx.nonce = ss.read(4);
        tx.gasPrice = Fixed64.deserialize(ss);
        tx.gasLimit = Fixed64.deserialize(ss);
        tx.payer = new Address(ss.read(20));

        let payload;
        switch (tx.type) {
            case TxType.Invoke :
                payload = new InvokeCode();
                break;
            // case TxType.Deploy:
            //     payload = new DeployCode();
            //     break;
            default :
                payload = new InvokeCode();
        }
        payload.deserialize(ss);
        tx.payload = payload;
        tx.txAttributes = parseInt(ss.read(1), 16);
        tx.sigs = [];

        const sigLength = ss.readNextLen();
        for (let i = 0; i < sigLength; i++) {
            tx.sigs.push(TxSignature.deserialize(ss));
        }

        return tx;
    }

    /**
     * Serialize transaction to hex string
     * The result is used to send to blockchain.
     */
    serialize(): string {
        const unsigned = this.serializeUnsignedData();
        const signed = this.serializeSignedData();

        return unsigned + signed;
    }

    /**
     * Serialize transaction data exclueds signatures
     */
    serializeUnsignedData() {
        let result = '';
        result += num2hexstring(this.version);
        result += num2hexstring(this.type);

        // nonce 4bytes
        result += this.nonce;
        result += this.gasPrice.serialize();
        result += this.gasLimit.serialize();
        result += this.payer.serialize();
        result += this.payload.serialize();

        result += num2hexstring(this.txAttributes);

        return result;
    }

    /**
     * Serialize signatures
     */
    serializeSignedData() {
        let result = '';
        // programs
        result += num2hexstring(this.sigs.length);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.sigs.length; i++) {
            result += this.sigs[i].serialize();
        }

        return result;
    }

    /**
     * Get the signable content
     */
    getSignContent() {
        const data = this.serializeUnsignedData();

        const ProgramHexString = cryptoJS.enc.Hex.parse(data);
        const ProgramSha256 = cryptoJS.SHA256(ProgramHexString).toString();
        const ProgramSha2562 = cryptoJS.SHA256(cryptoJS.enc.Hex.parse(ProgramSha256)).toString();

        return ProgramSha2562;
    }

    /**
     * Get the hash of transaction
     * @deprecated Use getSignContent instead
     */
    getHash() {
        return this.getSignContent();
    }
}


export class Transfer extends Transaction {
    amount: number | string | undefined;
    tokenType: string | undefined;
    from: Address | undefined;
    to: Address | undefined;
    method: string | undefined;
    constructor() {
        super();
    }
}
