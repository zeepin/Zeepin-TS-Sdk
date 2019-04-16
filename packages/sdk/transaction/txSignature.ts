import { StringReader } from "../common/classesUtils";
import { hex2VarBytes } from "../common/functionsUtils";
import { SignatureScheme } from "../crypto/cryptoParams";
import { getParamsFromProgram, getProgramInfo, programFromParams, programFromPubKey, programFromMultiPubKey } from "../crypto/programs";
import { PrivateKey } from "../crypto/privateKey";
import { PublicKey } from "../crypto/publicKey";
import { Signable } from "../crypto/signable";

export class TxSignature {
    /**
     * Public keys used to create this signature.
     */
    pubKeys: PublicKey[] = [];

    // Cardinality of the signature
    M: number = 1;

    // Signature values
    sigData: string[] = [];


    static deserialize(sr: StringReader) {
        const sig = new TxSignature();
        const invocationScript = sr.readNextBytes();
        const verificationScript = sr.readNextBytes();
        const sigData = getParamsFromProgram(invocationScript);
        const info = getProgramInfo(verificationScript);
        sig.M = info.M;
        sig.pubKeys = info.pubKeys;
        sig.sigData = sigData;
        return sig;
    }

    /**
     * Creates Transaction signature of hash with supplied private key and scheme.
     *
     * If the signature schemas is not provided, the default schemes for the key types are used.
     *
     * @param hash hash of the transaction or signable transaction
     * @param privateKey Private key to use
     * @param scheme Signature scheme to use
     */
    static create(hash: string | Signable, privateKey: PrivateKey, scheme?: SignatureScheme) {
        const signature = new TxSignature();

        signature.M = 1;
        signature.pubKeys = [privateKey.getPublicKey()];
        signature.sigData = [privateKey.sign(hash, scheme).serializeHex()];

        return signature;
    }


    /**
     * Serializes signature to Hex representation.
     *
     */
    serialize(): string {
        let result = '';
        const invocationScript = programFromParams(this.sigData);
        let verificationScript = '';
        if (this.pubKeys.length === 0) {
            throw new Error('No pubkeys in sig');
        } else if (this.pubKeys.length === 1) {
            verificationScript = programFromPubKey(this.pubKeys[0]);
        } else {
            verificationScript = programFromMultiPubKey(this.pubKeys, this.M);
        }
        result += hex2VarBytes(invocationScript);
        result += hex2VarBytes(verificationScript);
        return result;
    }
}
