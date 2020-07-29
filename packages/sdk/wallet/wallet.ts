import { DEFAULT_SCRYPT } from "../common/consts";
import { Account } from "./account";

export class Wallet {
    name: string = 'com.github.zeepin';
    version: string = '1.0';
    scrypt = {
        dkLen: DEFAULT_SCRYPT.size,
        n: DEFAULT_SCRYPT.cost,
        p: DEFAULT_SCRYPT.parallel,
        r: DEFAULT_SCRYPT.blockSize
    };
    defaultAccountAddress: string;
    accounts: Account[];


    /**
     * create wallet
     */
    static createWallet(password: string, name?: string): Wallet {
        const wallet = new Wallet();
        wallet.accounts = [];
        wallet.accounts.push(Account.createAccount(password, name));
        wallet.defaultAccountAddress = wallet.accounts[0].address.toBase58();
        return wallet;
    }

    /**
     * import wallet
     */
    static importWalletByPrivateKey(password: string, privateKey: string, name?: string): Wallet {
        const wallet = new Wallet();
        wallet.accounts = [];
        wallet.accounts.push(Account.importAccountByPrivateKey(password, privateKey, name));
        wallet.defaultAccountAddress = wallet.accounts[0].address.toBase58();
        return wallet;
    }

    static importWalletByWIFPrivateKey(password: string, privateKey: string, name?: string): Wallet {
        const wallet = new Wallet();
        wallet.accounts = [];
        wallet.accounts.push(Account.importAccountByWIFPrivateKey(password, privateKey, name));
        wallet.defaultAccountAddress = wallet.accounts[0].address.toBase58();
        return wallet;
    }

    static importWalletByKeystore(password: string, keystore: object): Wallet {
        const wallet = new Wallet();
		// @ts-ignore
        wallet.defaultAccountAddress = keystore.accounts[0].address;
        wallet.accounts = [];
        wallet.accounts.push(Account.importAccountByKeystore(password, keystore));
        // @ts-ignore
        wallet.scrypt.n = keystore.scrypt.n;
        return wallet;
    }

    static modifyPassword(oldPassword: string, newPassword: string, keystore: object): Wallet {
        const wallet = new Wallet();
		// @ts-ignore
        wallet.defaultAccountAddress = keystore.accounts[0].address;
        wallet.accounts = [];
        wallet.accounts.push(Account.modifyPassword(oldPassword, newPassword, keystore));
        return wallet;
    }

    addAccount(account: Account): void {
        for (const ac of this.accounts) {
            if (ac.address.toBase58() === account.address.toBase58()) {
                return;
            }
        }
        this.accounts.push(account);
    }

    setDefaultAccount(address: string): void {
        this.defaultAccountAddress = address;
    }

    /**
     * keystore
     */
    toJson(): string {
        return JSON.stringify(this.toJsonObj());
    }

    toJsonObj(): any {
        const obj = {
            accounts: this.accounts.map((a) => a.toJsonObj()),
            defaultAccountAddress: this.defaultAccountAddress,
            name: this.name,
            scrypt: this.scrypt,
            version: this.version
        };
        return obj;
    }
}
