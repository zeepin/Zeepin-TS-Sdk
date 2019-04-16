import { StringReader } from "../common/classesUtils";
import { KeyType, KeyParameters, Curve } from "./cryptoParams";
import { Key } from "./key";
import { num2hexstring } from "../common/functionsUtils";

export class PublicKey extends Key {

    static deserializeHex(sr: StringReader, length: number = 33): PublicKey {
        if (length === 33) { // ECDSA
            const algorithm = KeyType.ECDSA;
            const curve = Curve.SECP256R1;
            const pk = sr.read(33);
            return new PublicKey(pk, algorithm, new KeyParameters(curve));
        } else {
            const algorithmHex = parseInt(sr.read(1), 16);
            const curveHex = parseInt(sr.read(1), 16);
            const pk = sr.read(length - 2);

            return new PublicKey(
                pk,
                KeyType.fromHex(algorithmHex),
                new KeyParameters(Curve.fromHex(curveHex))
            );
        }
    }

    /**
     * Serializes public key to Hex representation.
     */
    serializeHex(): string {
        let result = '';
        switch (this.algorithm) {
            case KeyType.ECDSA:
                result += this.key;
                break;
            case KeyType.EDDSA:
            case KeyType.SM2:
                result += num2hexstring(this.algorithm.hex);
                result += num2hexstring(this.parameters.curve.hex);
                result += this.key;
                break;
        }
        return result;
    }

}
