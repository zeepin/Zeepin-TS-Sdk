import { Address } from './address'
import { randomBytes } from "../common/functionsUtils";
import { PrivateKey } from "../crypto/privateKey";

export class Account {
    address: Address;
    label: string;
    encryptedKey: PrivateKey;
    publicKey: string;
    'enc-alg': string = 'aes-256-gcm';
    hash: string = 'sha256';
    algorithm: string = 'ECDSA';
    parameters: object = {curve: 'P-256'};
    salt: string;
    isDefault: boolean;
    lock: boolean;


    /**
     * create account
     */
    static createAccount(password: string, label?: string) {
        const account = new Account();
        if (!label) {
            label = randomBytes(4);
        }
        account.label = label;
        account.isDefault = true;
        account.lock = false;

        const privateKey = PrivateKey.random();  //随机生成私钥

        const publicKey = privateKey.getPublicKey();
        account.publicKey = publicKey.serializeHex();

        const address = Address.fromPubKey(publicKey);
        account.address = address;

        const salt = randomBytes(16);
        account.salt = Buffer.from(salt, 'hex').toString('base64');

        account.encryptedKey = privateKey.encrypt(password, address, salt);

        return account;
    }

    /**
     * Import account
     */
    static importAccountByPrivateKey(password: string, privateKey: string, label?: string): Account {
        const account = new Account();
        if (!label) {
            label = randomBytes(4);
        }
        account.label = label;
        account.isDefault = true;
        account.lock = false;

        const privatekey = new PrivateKey(privateKey);
        const publicKey = privatekey.getPublicKey();
        account.publicKey = publicKey.serializeHex();

        const address = Address.fromPubKey(publicKey);
        account.address = address;

        const salt = randomBytes(16);
        account.salt = Buffer.from(salt, 'hex').toString('base64');

        account.encryptedKey = privatekey.encrypt(password, address, salt);

        return account;
    }

    static importAccountByKeystore(password: string, keystore: object): Account {
        const account = new Account();
		// @ts-ignore
        const address = new Address(keystore.accounts[0].address);
        account.address = new Address(address.serialize());
		// @ts-ignore
        account.label = keystore.accounts[0].label;
		// @ts-ignore
        account.salt = keystore.accounts[0].salt;
        account.lock = false;
        account.isDefault = true;
		// @ts-ignore
        account.encryptedKey = new PrivateKey(keystore.accounts[0].key);
        // @ts-ignore
        const privateKey = account.exportPrivateKey(password, keystore.scrypt.n);
        account.publicKey = privateKey.getPublicKey().serializeHex();
        return account;
    }

    /**
     * modify password
     */
    static modifyPassword(oldPassword: string, newPassword: string, keystore: object): Account {
        const account = new Account();
		// @ts-ignore
        const address = new Address(keystore.accounts[0].address);
        account.address = new Address(address.serialize());
		// @ts-ignore
        account.label = keystore.accounts[0].label;
		// @ts-ignore
        account.salt = keystore.accounts[0].salt;
        account.lock = false;
        account.isDefault = true;
		// @ts-ignore
        account.encryptedKey = new PrivateKey(keystore.accounts[0].key);
        // @ts-ignore
        const privateKey = account.exportPrivateKey(oldPassword, keystore.scrypt.n);
        account.publicKey = privateKey.getPublicKey().serializeHex();
        const salt = randomBytes(16);
        account.salt = Buffer.from(salt, 'hex').toString('base64');
        account.encryptedKey = privateKey.encrypt(newPassword, account.address, salt);
        return account;
    }

    toJson(): string {
        return JSON.stringify(this.toJsonObj());
    }

    /**
     * accounts in keystore
     */
    toJsonObj(): any {
        const obj = {
            'address': this.address.toBase58(),
            'algorithm': this.algorithm,
            'enc-alg': this['enc-alg'],
            'hash': this.hash,
            'isDefault': this.isDefault,
            'key': this.encryptedKey.key,
            'label': this.label,
            'lock': this.lock,
            'parameters': this.parameters,
            'publicKey': this.publicKey,
            'salt': this.salt,
            'signatureScheme': this.encryptedKey.algorithm.defaultSchema.label
        };
        return obj;
    }

    exportPrivateKey(password: string, n?: number) {
        return this.encryptedKey.decrypt(password, this.address, this.salt, n);
    }
}
