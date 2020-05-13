<template>
    <section>aaa</section>
</template>

<script>
    import sdk from '../../packages/index.js'
    import rpcClient from "../../packages/sdk/network/rpc/rpcClient";
    import {Address} from "../../packages/sdk/wallet/address";

    export default {
        name: 'Index',
        mounted () {
            // this.test()
            // this.testGetHashData()
            // this.testUnboundGala();
            this.testWithdrawGala();
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
                let result = await sdk.wasmTransfers('93f750f3480934e5952543d617e9671e0e4ffe9c', from, to, '1', fromKey)
                console.log(result)
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
