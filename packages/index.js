import {Wallet} from "./sdk/wallet/wallet"
import {keystoreCheck} from "./sdk/common/functionsUtils";
import RestClient from "./sdk/network/rest/restClient";
import {TEST_ZEEPIN_URL, ZUSD_TEST_CONTRACT} from "./sdk/common/consts";
import {Address} from "./sdk/wallet/address";
import {getContractBalance} from "./sdk/transaction/wasmTransaction";
import {nativeTransfer} from "./sdk/transaction/nativeTransaction";
import RpcClient from "./sdk/network/rpc/rpcClient";

export default class Zeepin {

    /**
     * 创建钱包
     *
     * password: 账户密码
     * 返回钱包地址、keystore、私钥
     */
    static createWallet(password) {
        let wallet = Wallet.createWallet(password);
        let obj = {
            address: wallet.accounts[0].address.toBase58(),
            keystore: wallet.toJsonObj(),
            privateKey: wallet.accounts[0].exportPrivateKey(password).key
        }
        return obj
    }


    /**
     * 从私钥导入钱包
     *
     * password: 账户密码
     * privateKey: 私钥
     * 返回钱包地址、keystore、私钥
     */
    static importByPrivateKey(password, privateKey) {
        let wallet = Wallet.importWalletByPrivateKey(password, privateKey);
        let obj = {
            address: wallet.accounts[0].address.toBase58(),
            keystore: wallet.toJsonObj(),
            privateKey: wallet.accounts[0].exportPrivateKey(password).key
        }
        return obj;
    }

    /**
     * 从keystore导入钱包
     *
     * password: 账户密码
     * 返回钱包地址、keystore、私钥
     */
    static importByKeystore(password, keystore) {
        keystoreCheck(keystore);
        let wallet = Wallet.importWalletByKeystore(password, keystore);
        let obj = {
            address: wallet.accounts[0].address.toBase58(),
            keystore: wallet.toJsonObj(),
            privateKey: wallet.accounts[0].exportPrivateKey(password).key
        }
        return obj;

    }


    /**
     * 更改钱包密码
     *
     * 返回钱包地址、keystore、私钥
     */
    static modifyPassword(oldPassword, newPassword, keystore) {
        keystoreCheck(keystore);
        let wallet = Wallet.modifyPassword(oldPassword, newPassword, keystore);
        let obj = {
            address: wallet.accounts[0].address.toBase58(),
            keystore: wallet.toJsonObj(),
            privateKey: wallet.accounts[0].exportPrivateKey(newPassword).key
        }
        return obj;
    }


    /**
     * 查询ZPT和Gala余额
     *
     * address: 账户地址
     */
    static balanceOfNative(address) {
        return new Promise((resolve, reject) => {
            const rest = new RestClient();
            rest.getBalance(new Address(address)).then((res) => {
                resolve(res.Result)
            })
        })
    }


    /**
     * 查询ZUSD余额
     *
     * address: 账户地址
     */
    static balanceOfZUSD(address) {
        return getContractBalance(ZUSD_TEST_CONTRACT, address);
    }


    /**
     * ZPT和Gala转账交易
     *
     * tokenType: 'ZPT'或'Gala'(注意大小写规范), string
     * from: 转出地址, string
     * to: 转入地址, string
     * amount: 转账金额(精度10000，如：需转账10，应填入100000), number
     * fromKey: 转出账户私钥, string
     */
    static nativeTransfer(tokenType, from, to, amount, fromKey) {
        return new Promise((resolve, reject) => {
            const rest = new RestClient();
            const TxString = nativeTransfer(tokenType, from, to, amount, '1', '20000', fromKey);
            rest.sendRawTransaction(TxString).then((res) => {
                resolve(res.Result)
            })
        })
    }
}
