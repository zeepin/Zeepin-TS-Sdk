import { Wallet } from "./sdk/wallet/wallet"
import { keystoreCheck } from "./sdk/common/functionsUtils";
import { resultParams } from "./sdk/common/classesUtils";
import RestClient from "./sdk/network/rest/restClient";
import {CONTRACTS_TEST, ZUSD_TEST_CONTRACT} from "./sdk/common/consts";
import { Address } from "./sdk/wallet/address";
import {contractParams, getContractBalance} from "./sdk/transaction/wasmTransaction";
import { nativeTransfer } from "./sdk/transaction/nativeTransaction";
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
        const rest = new RestClient();
        let result = [];
        return new Promise((resolve, reject) => {
            rest.getBalance(new Address(address)).then((res) => {
                let param1 = new resultParams();
                param1.name = 'ZPT';
                param1.value = res.Result.zpt;
                result.push(param1);
                let param2 = new resultParams();
                param2.name = 'Gala';
                param2.value = res.Result.gala;
                result.push(param2);
                resolve(result);
            })
        })
    }


    /**
     * 查询ZUSD余额
     *
     * address: 账户地址
     */
    static balanceOfOthers(address) {
        let result = [];
        return new Promise((resolve, reject) => {
            for (let i = 0; i < CONTRACTS_TEST.length; i++) {
                getContractBalance(CONTRACTS_TEST[i].contractAddr , address).then((res) => {
                    let param = new resultParams();
                    param.name = CONTRACTS_TEST[i].name;
                    param.value = res;
                    result.push(param);
                    if(i === CONTRACTS_TEST.length - 1)
                        resolve(result);
                })
            }
        })
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
            const rpc = new RpcClient();
            const TxString = nativeTransfer(tokenType, from, to, amount, '1', '20000', fromKey);
            rest.sendRawTransaction(TxString).then((res) => {
                if(typeof res.Result === 'string' && res.Result.length === 64) {
                    let timer = setInterval(() => {
                        rpc.getSmartCodeEvent(res.Result).then((getRes) => {
                            if(getRes.result !== null) {
                                clearInterval(timer);
                                timer = null;
                                console.log(getRes);
                                if(getRes.result.State === 1)
                                    resolve(true);
                                else
                                    resolve(false);
                            }
                        })
                    }, 1000)
                } else {
                    resolve(false);
                }
            })
        })
    }
}
