import * as elliptic from 'elliptic';
import { ab2hexstring, randomBytes, isBase64 } from "../common/functionsUtils";
import { ERROR_CODE } from "../common/error";
import { Key } from "./key"
import * as wif from "wif";
import { KeyType, KeyParameters, SignatureScheme } from "./cryptoParams";
import { PublicKey } from "./publicKey";
import { Address } from "../wallet/address";
import { encryptWithGcm, decryptWithGcm, ScryptParams } from "./scrypt";
import { Signature } from "./signature";
import { Signable} from "./signable";
import { DEFAULT_SCRYPT } from "../common/consts";

export class PrivateKey extends Key {
         /**
          * Generates random Private key using supplied Key type and parameters.
          *
          * If no Key type or parameters is supplied, default SDK key type with default parameters will be used.
          */
         static random(
           keyType?: KeyType,
           parameters?: KeyParameters
         ): PrivateKey {
           return new PrivateKey(randomBytes(32), keyType, parameters);
         }

         /**
          * Derives Public key out of Private key.
          */
         getPublicKey(): PublicKey {
           switch (this.algorithm) {
             case KeyType.ECDSA:
               return this.getEcDSAPublicKey();
             case KeyType.EDDSA:
               return this.getEdDSAPublicKey();
             // case KeyType.SM2:
             //     return this.getSM2PublicKey();
             default:
               throw new Error("Unsupported signature schema.");
           }
         }

         /**
          * Derives Public key out of Private key using EcDSA algorithm.
          */
         getEcDSAPublicKey(): PublicKey {
           const ec = new elliptic.ec(this.parameters.curve.preset);
           const keyPair = ec.keyFromPrivate(this.key, "hex");
           const pk = keyPair.getPublic(true, "hex");

           return new PublicKey(pk, this.algorithm, this.parameters);
         }

         /**
          * Derives Public key out of Private key using EdDSA algorithm.
          */
         getEdDSAPublicKey(): PublicKey {
           const eddsa = new elliptic.eddsa(
             this.parameters.curve.preset
           );
           const keyPair = eddsa.keyFromSecret(this.key, "hex");
           const pk = keyPair.getPublic(true, "hex");

           return new PublicKey(pk, this.algorithm, this.parameters);
         }

         /**
          * Creates PrivateKey from Wallet Import Format (WIF) representation.
          *
          * @param wifkey WIF private key representation
          *
          */
         static deserializeWIF(wifkey: string): PrivateKey {
           const key = ab2hexstring(wif.decode(wifkey, 128).privateKey);
           return new PrivateKey(key);
         }

         /**
          * Decrypts encrypted private key with supplied password.
          *
          * @param keyphrase Password to decrypt with
          * @param address For aad in decryption
          * @param 16 secure random bytes
          */
         decrypt(
           keyphrase: string,
           address: Address,
           salt: string,
           n?: number
         ): PrivateKey {
           if (salt.length === 24 && isBase64(salt)) {
             salt = Buffer.from(salt, "base64").toString("hex");
           }
           let params;
           if (!n) {
             params = DEFAULT_SCRYPT;
           } else {
             params = {
               cost: n,
               blockSize: 8,
               parallel: 8,
               size: 64,
             };
           }
           const decrypted = decryptWithGcm(
             this.key,
             address,
             salt,
             keyphrase,
             params
           );
           const decryptedKey = new PrivateKey(
             decrypted,
             this.algorithm,
             this.parameters
           );
           const pk = decryptedKey.getPublicKey();
           const addrTmp = Address.fromPubKey(pk);
           if (addrTmp.toBase58() !== address.toBase58()) {
             throw ERROR_CODE.Decrypto_ERROR;
           }
           return decryptedKey;
         }

         /**
          * Encrypts private key with supplied password.
          *
          * @param keyphrase Password to encrypt with
          * @param address For aad in encryption
          * @param salt 16 secure random bytes
          */
         encrypt(
           keyphrase: string,
           address: Address,
           salt: string,
           n?: number
         ): PrivateKey {
           const publicKey = this.getPublicKey();
           const addr = Address.fromPubKey(publicKey).toBase58();
           if (addr !== address.toBase58()) {
             throw ERROR_CODE.INVALID_ADDR;
           }
           let params;
           if (!n) {
             params = DEFAULT_SCRYPT;
           } else {
             params = {
               cost: n,
               blockSize: 8,
               parallel: 8,
               size: 64,
             };
           }
           const encrypted = encryptWithGcm(
             this.key,
             address,
             salt,
             keyphrase,
             params
           );
           return new PrivateKey(
             encrypted,
             this.algorithm,
             this.parameters
           );
         }

         /**
          * Signs the data with supplied private key using signature schema.
          *
          * If the signature schema is not provided, the default schema for this key type is used.
          *
          * This method is not suitable, if external keys (Ledger, TPM, ...) support is required.
          *
          * @param msg Hex encoded input data or Signable object
          * @param schema Signing schema to use
          * @param publicKeyId Id of public key
          */
         sign(
           msg: string | Signable,
           schema?: SignatureScheme,
           publicKeyId?: string
         ): Signature {
           if (schema === undefined) {
             schema = this.algorithm.defaultSchema;
           }

           if (!this.isSchemaSupported(schema)) {
             throw new Error(
               "Signature schema does not match key type."
             );
           }

           // retrieves content to sign if not provided directly
           if (typeof msg !== "string") {
             msg = msg.getSignContent();
           }

           let hash: string;
           if (schema === SignatureScheme.SM2withSM3) {
             // library sm.js (SM2withSM3) has implemented hashing as part of signing, therefore it is skipped
             hash = msg;
           } else {
             hash = this.computeHash(msg, schema);
           }

           const signed = this.computeSignature(hash, schema);
           return new Signature(schema, signed, publicKeyId);
         }

         /**
          * Computes signature of message hash using specified signature schema.
          *
          * @param hash Message hash
          * @param schema Signature schema to use
          */
         computeSignature(
           hash: string,
           schema: SignatureScheme
         ): string {
           switch (schema) {
             case SignatureScheme.ECDSAwithSHA224:
             case SignatureScheme.ECDSAwithSHA256:
             case SignatureScheme.ECDSAwithSHA384:
             case SignatureScheme.ECDSAwithSHA512:
             case SignatureScheme.ECDSAwithSHA3_224:
             case SignatureScheme.ECDSAwithSHA3_256:
             case SignatureScheme.ECDSAwithSHA3_384:
             case SignatureScheme.ECDSAwithSHA3_512:
             case SignatureScheme.ECDSAwithRIPEMD160:
               return this.computeEcDSASignature(hash);
             case SignatureScheme.EDDSAwithSHA512:
               return this.computeEdDSASignature(hash);
             // case SignatureScheme.SM2withSM3:
             //     return this.computeSM2Signature(hash);
             default:
               throw new Error("Unsupported signature schema.");
           }
         }

         /**
          * Computes EcDSA signature of message hash. Curve name is derrived from private key.
          *
          * @param hash Message hash
          */
         computeEcDSASignature(hash: string): string {
           const ec = new elliptic.ec(this.parameters.curve.preset);
           const signed = ec.sign(hash, this.key, { canonical: true });
           return Buffer.concat([
             signed.r.toArrayLike(Buffer, "be", 32),
             signed.s.toArrayLike(Buffer, "be", 32),
           ]).toString("hex");
         }

         /**
          * Computes EdDSA signature of message hash. Curve name is derrived from private key.
          *
          * @param hash Message hash
          */
         computeEdDSASignature(hash: string): string {
           const eddsa = new elliptic.eddsa(
             this.parameters.curve.preset
           );
           const signed = eddsa.sign(hash, this.key, null);
           return Buffer.concat([
             signed.R.toArrayLike(Buffer, "be", 32),
             signed.S.toArrayLike(Buffer, "be", 32),
           ]).toString("hex");
         }
       }
