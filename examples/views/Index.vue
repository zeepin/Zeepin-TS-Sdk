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
            // this.searchCurrency()
            this.testTransaction()
            // this.testTransferStr()
            // this.testAddress()
            // this.testUrl()
        },
        methods: {
            test () {

                let keystore = `{"accounts":[{"address":"ZUCHNKtj5SFcatHtrKHYGsV3ra2brPTDVL","algorithm":"ECDSA","enc-alg":"aes-256-gcm","hash":"sha256","isDefault":true,"key":"XmQOYWnNoWzQyjrqVLt+MXxdcBQMx/Ec3qRqr4+Ov4/n3atg96yWc+8HPDDPD9Xr","label":"04b15180","lock":false,"parameters":{"curve":"P-256"},"publicKey":"036780dd6ee735aa7ed8859dfd19a0d1e684b36c5341f34a305c7a41a141bd511f","salt":"j3yypOTPqHwabaFwkxiGtQ==","signatureScheme":"SHA256withECDSA"}],"createTime":"","defaultAccountAddress":"ZUCHNKtj5SFcatHtrKHYGsV3ra2brPTDVL","defaultGid":"","identities":[],"name":"com.github.zeepin","scrypt":{"dkLen":64,"n":16384,"p":8,"r":8},"version":"1.0"}`


                // let keystore = {
                //     accounts:[
                //         {
                //             address:"ZNEo7CMRpQXGDgSwvhm2iDGPTXhVRJcMfc",
                //             algorithm:"ECDSA",
                //             'enc-alg':"aes-256-gcm",
                //             hash:"sha256",
                //             isDefault:true,
                //             key:"nGr1kg/vAq8ofXj7nOWXcNN0rDMX2LPCQeGzdmRprZqk0duKnKFCoPcNus/yRMif",
                //             label:"a44ca454",
                //             lock:false,
                //             parameters:{
                //                 curve:"P-256"
                //             },
                //             publicKey:"030efa73dffdb6572fe59f3f0bb1e72aadf78217a1834c3d7e3b78f75336bf23de",
                //             salt:"zs29ln2IkzJiQQYo0FhBkA==",
                //             signatureScheme:"SHA256withECDSA"
                //         }
                //     ],
                //     defaultAccountAddress:"ZNEo7CMRpQXGDgSwvhm2iDGPTXhVRJcMfc",
                //     name:"com.github.zeepin",
                //     scrypt:{
                //         dkLen:64,
                //         n:16384,
                //         p:8,
                //         r:8
                //     },
                //     version:"1.0"
                // }

                // let result = sdk.createWallet('11', 'Junjie')
                // let result = sdk.importByPrivateKey('11', 'babac0633cff512fff14b887d237f38e76ced3fc3af2ee0c093872ea80838903')
                // let result = sdk.importByKeystore('11', keystore)

                // let result = sdk.importByKeystore('11', JSON.parse(keystore))
                let result = sdk.modifyPassword('11', '111', JSON.parse(keystore))

                console.log(result)
            },

            async searchCurrency () {
                sdk.setUrl('http://main1.zeepin.net:20334')
                let native = await sdk.balanceOfNative('ZTMpJFXdmgosonQn5KVy3fi8YmBkztAs4Q')
                console.log(native)
                let otherAssets = await sdk.balanceOfOthers('ZTMpJFXdmgosonQn5KVy3fi8YmBkztAs4Q')
                console.log(otherAssets)
            },

            async testTransaction () {
                let from = 'ZQXhii1uD8YNmx57LcPDnBWWhZVnW3QiFA'
                let to = 'ZSUYN8cSZYoepMfD4TTFimPbzFo9a3FNuw'
                let fromKey = 'E32A57D676E1CF0142ADE7F37C1CFC0F341DE48B4ED8D4E827040E4E7B8B8554'
                sdk.setUrl('main1.zeepin.net')
                // let result = await sdk.nativeTransfer('zpt', from, to, '10000', fromKey)
                let result = await sdk.wasmTransfer('gold', from, to, '1', fromKey)
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
