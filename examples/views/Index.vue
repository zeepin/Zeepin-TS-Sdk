<template>
    <section>aaa</section>
</template>

<script>
    import sdk from '../../packages/index.js'
    import rpcClient from "../../packages/sdk/network/rpc/rpcClient";
    import {Address} from "../../packages/sdk/wallet/address";
    import { programFromMultiPubKey} from "../../packages/sdk/crypto/programs";
    import { Account } from "../../packages/sdk/wallet/account";
    import { PrivateKey } from "../../packages/sdk/crypto/privateKey";

    export default {
        name: 'Index',
        mounted () {
            // this.test()
            // this.testGetHashData()
            // this.testUnboundGala();
            this.testMutiSignAddress();
            // this.testWithdrawGala();
            // this.searchCurrency()
            // this.testTransaction()
            // this.testTransferStr()
            // this.testAddress()
            // this.testUrl()
        },
        methods: {
            test () {
            },

            async searchCurrency () {
                sdk.setUrl('http://main1.zeepin.net:20334')
                let native = await sdk.balanceOfNative('ZTMpJFXdmgosonQn5KVy3fi8YmBkztAs4Q')
                console.log(native)
                let otherAssets = await sdk.balanceOfOthers('ZTMpJFXdmgosonQn5KVy3fi8YmBkztAs4Q')
                console.log(otherAssets)
            },

            async testTransaction () {
                let from = 'ZK4xgvBom4D33F9YAmgg89fJW18iVss3tV'
                let to = 'ZRo3D87vgKP3MBxHPd2GSaqPFULmhmZcqX'
                let fromKey = '2cf804f021d94c33a3a288d6fc0d74f19854f6ef01de20f3ad8b19166b221d90'
                sdk.setUrl('http://test1.zeepin.net:20334')
                // let result = await sdk.nativeTransfer('gala', from, to, '1', fromKey)
                // let result = await sdk.wasmTransfer('gold', from, to, '1', fromKey)
                let result = await sdk.wasmTransfers('e5c0c001a4a76dfa1ceae2ded6fd634c3a2ff572', from, to, '1', fromKey)
                console.log(result)
            },

            async testMutiSignAddress(){
                sdk.setUrl('http://test1.zeepin.net:20334')
                let password = '11'
                let name = ''
                let privatekey1 = "49855b16636e70f100cc5f4f42bc20a6535d7414fb8845e7310f8dd065a97221"
                let privatekey2 = "1094e90dd7c4fdfd849c14798d725ac351ae0d924b29a279a9ffa77d5737bd96"
                let privatekey3 = "bc254cf8d3910bc615ba6bf09d4553846533ce4403bc24f58660ae150a6d64cf"
                let privatekey4 = "06bda156eda61222693cc6f8488557550735c329bc7ca91bd2994c894cd3cbc8"
                let privatekey5 = "f07d5a2be17bde8632ec08083af8c760b41b5e8e0b5de3703683c3bdcfb91549"
                let privatekey6 = "6c2c7eade4c5cb7c9d4d6d85bfda3da62aa358dd5b55de408d6a6947c18b9279"
                let privatekey7 = "24ab4d1d345be1f385c75caf2e1d22bdb58ef4b650c0308d9d69d21242ba8618"
                let privatekey8 = "87a209d232d6b4f3edfcf5c34434aa56871c2cb204c263f6b891b95bc5837cac"
                let privatekey9 = "1383ed1fe570b6673351f1a30a66b21204918ef8f673e864769fa2a653401114"

                let acct1 = Account.importAccountByPrivateKey(password, privatekey1, name)
                let acct2 = Account.importAccountByPrivateKey(password, privatekey2, name)
                let acct3 = Account.importAccountByPrivateKey(password, privatekey3, name)

                let acctArray = [acct1, acct2, acct3]
                let priArray = [privatekey1, privatekey2, privatekey3]
                console.log(acctArray)
                var pks = new Array();
               
                for(let i = 0;  i<priArray.length; i++){
                    const privatekey = new PrivateKey(priArray[i]);
                    pks[i] = privatekey.getPublicKey();
                }
                console.log(pks)
                let M = 2
                let sender = Address.fromMultiPubKeys(M, pks)
                console.log(sender.toBase58())

                let from = sender.toBase58()

                let to = 'ZK4xgvBom4D33F9YAmgg89fJW18iVss3tV'
                let txData = await sdk.makeMultiSignTransactionStr('gala', from, to, '4', 1,20000)
                console.log(from)
                let data1 = await sdk.signMultiAddrTransactionStr(privatekey1, '','','',pks,'2',txData.txData)
                let data2 = await sdk.signMultiAddrTransactionStr(privatekey2, '','','',pks,'2',data1.signedHash)
                let data3 = await sdk.signMultiAddrTransactionStr(privatekey3, '','','',pks,'2',data2.signedHash)
                let result = await sdk.sendSignTxnTransaction(data3.signedHash)
                console.log(result)

                let txData1 = await sdk.makeMultiSignWasmTransactionStr('0f27a43a74c963e07c0b633aff49ebb269e6d727',from, to, '1','1', '20000')
                console.log(txData1)
                console.log('avnlkasdkjoiewuoflsadnfldnsalfjldjsalfjlkdsj')
                let data11 = await sdk.signMultiAddrTransactionStr(privatekey1, '','','',pks,'2',txData1)
                let data22 = await sdk.signMultiAddrTransactionStr(privatekey2, '','','',pks,'2',data11.signedHash)
                console.log(data22.signedHash)
                 let results = await sdk.sendSignTxnTransaction(data22.signedHash)
                 console.log(results)
                console.log('=-=-=-=-=-sdgasdgasdfad=-=-=-=-=-=-=-=')
            },
            
            async testGetHashData(){
                console.log("=======")
                let txhash = 'dd3c70d7ec2d7b4caca46f0292ed614f6bb327ff302b5f44d230b9c9c72c0b28'
                sdk.setUrl('http://test1.zeepin.net:20334')
                let result = await sdk.smartCodeEventByTxHash(txhash)
                console.log(result)
            },

            testTransferStr() {
                let from = 'ZQXhii1uD8YNmx57LcPDnBWWhZVnW3QiFA'
                let to = 'Za5YKANnk8mdgiqCVUbk16gPhZ5CxtBNmK'
                // let to = 'ZD5mb72Q6poduRufVypjPwDredVwgV9ceq'
                let fromKey = 'c2fbcb381e1eb50209334306e37ab9c4853eb789a847092bb0879d0d69cfc344'
                // let payer = 'ZUS7J41Yry6oh4rgHg7P4AnGZcAtovR2Z5'
                // let payer = 'ZEuzshrCsE1cnvPuuRrDYgnVYNDtyt5d3X'
                // let result = sdk.wasmTransferStr('zusd', from, to, '5789', fromKey)
                let result = sdk.nativeTransferStr('zpt', from, to, '15', fromKey)
                console.log(result)
            },

              // unboundGala
            async testUnboundGala(){
                console.log("=======")
                sdk.setUrl('http://test1.zeepin.net:20334')
                let addr = 'ZK4xgvBom4D33F9YAmgg89fJW18iVss3tV'
                let result = await sdk.unboundGala(addr)
                console.log(result)
            },

             testWithdrawGala() {
                let claimer = 'ZK4xgvBom4D33F9YAmgg89fJW18iVss3tV'
                let to = 'ZK4xgvBom4D33F9YAmgg89fJW18iVss3tV'
                sdk.setUrl('http://test1.zeepin.net:20334')
                let claimerKey = '2cf804f021d94c33a3a288d6fc0d74f19854f6ef01de20f3ad8b19166b221d90'
                // let payer = 'ZUS7J41Yry6oh4rgHg7P4AnGZcAtovR2Z5'
                // let payer = 'ZEuzshrCsE1cnvPuuRrDYgnVYNDtyt5d3X'
                // let result = sdk.wasmTransferStr('zusd', from, to, '5789', fromKey)
                let result = sdk.withdrawGala('gala', claimer, to, '15', claimerKey)
                console.log("====")
                console.log(result)
            },

            testAddress() {
                let from = new Address('ZTMpJFXdmgosonQn5KVy3fi8YmBkztAs4Q')
                let to = new Address('Za5YKANnk8mdgiqCVUbk16gPhZ5CxtBNmK')
                console.log(from.toHexString())
                console.log(to.toHexString())
            },

            testUrl() {
                sdk.setUrl('https://galaxy.io')
                let url = sdk.getUrl()
                console.log(url)
            }

        }
    }
</script>
