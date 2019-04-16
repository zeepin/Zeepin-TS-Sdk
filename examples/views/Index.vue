<template>
    <section>aaa</section>
</template>

<script>
    import sdk from '../../packages/index.js'
    import rpcClient from "../../packages/sdk/network/rpc/rpcClient";

    export default {
        name: 'Index',
        mounted () {
            // this.test()
            // this.searchCurrency()
            // this.testTransaction()
        },
        methods: {
            test () {
                let keystore = {
                    accounts:[
                        {
                            address:"ZNEo7CMRpQXGDgSwvhm2iDGPTXhVRJcMfc",
                            algorithm:"ECDSA",
                            'enc-alg':"aes-256-gcm",
                            hash:"sha256",
                            isDefault:true,
                            key:"nGr1kg/vAq8ofXj7nOWXcNN0rDMX2LPCQeGzdmRprZqk0duKnKFCoPcNus/yRMif",
                            label:"a44ca454",
                            lock:false,
                            parameters:{
                                curve:"P-256"
                            },
                            publicKey:"030efa73dffdb6572fe59f3f0bb1e72aadf78217a1834c3d7e3b78f75336bf23de",
                            salt:"zs29ln2IkzJiQQYo0FhBkA==",
                            signatureScheme:"SHA256withECDSA"
                        }
                    ],
                    defaultAccountAddress:"ZNEo7CMRpQXGDgSwvhm2iDGPTXhVRJcMfc",
                    name:"com.github.zeepin",
                    scrypt:{
                        dkLen:64,
                        n:16384,
                        p:8,
                        r:8
                    },
                    version:"1.0"
                }

                let result = sdk.createWallet('11', 'Junjie')
                // let result = sdk.importByPrivateKey('11', 'babac0633cff512fff14b887d237f38e76ced3fc3af2ee0c093872ea80838903')
                // let result = sdk.importByKeystore('11', keystore)
                // let result = sdk.modifyPassword('11', '111', keystore)

                console.log(result)
            },

            async searchCurrency () {
                // let native = await sdk.balanceOfNative('ZNEo7CMRpQXGDgSwvhm2iDGPTXhVRJcMfc')
                // let native = await sdk.balanceOfNative('ZCFinVtGTgkb46bczTnGQySHeRRmhYtrJg')
                // console.log(native)
                let otherAssets = await sdk.balanceOfOthers('ZNEo7CMRpQXGDgSwvhm2iDGPTXhVRJcMfc')
                console.log(otherAssets)
            },

            async testTransaction () {
                let from = 'ZTMpJFXdmgosonQn5KVy3fi8YmBkztAs4Q'
                let to = 'Za5YKANnk8mdgiqCVUbk16gPhZ5CxtBNmK'
                let fromKey = 'c2fbcb381e1eb50209334306e37ab9c4853eb789a847092bb0879d0d69cfc344'
                let result = await sdk.nativeTransfer('Gala', from, to, 10000, fromKey)
                console.log(result)
            }
        }
    }
</script>
