# Zeepin-TS-Sdk

Clone or download sdk, then run the following commands
### Downloading
``` 
git clone https://github.com/zeepin/Zeepin-TS-Sdk.git
git checkout dev
```

### Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Update lib
```
npm run lib
```

### Interface List

| 描述                | 方法                 | 参数                                                                                                                                                 | 返回值              |
|-------------------|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|------------------|
| 创建钱包              | [createWallet](#1-createWallet)       | "password: 账户密码 useName:账户名"                                                                                                                                    | 钱包地址、keystore、私钥 |
| 从私钥导入钱包           | [importByPrivateKey](#2-importByPrivateKey) | "password: 账户密码 privateKey: 私钥"                                                                                                                    | 钱包地址、keystore、私钥 |
| 从keystore导入钱包     | [importByKeystore](#3-importByKeystore)   | "password: 账户密码 keystore：keystore"                                                                                                                 | 钱包地址、keystore、私钥 |
| 更改钱包密码            | [modifyPassword](#4-modifyPassword)     | "oldPassword：旧密码 newPassword：修密码 keystore：keystore"                                                                                                | 钱包地址、keystore、私钥 |
| 查询ZPT和Gala余额      | [balanceOfNative](#5-balanceOfNative)    | address: 账户地址                                                                                                                                      |
| 查询ZUSD和7种矿石余额     | [balanceOfOthers](#6-balanceOfOthers)   | address: 账户地址       
| 根据交易哈希得到该交易信息 | [smartCodeEventByTxHash](#7-smartCodeEventByTxHash) | txhash : 交易哈希                                                                                                                            |
| zpt和gala转账交易      | [nativeTransfer](#8-nativeTransfer)     | "tokenType: 'zpt'或'gala',小写, string from: 转出地址, string to: 转入地址, string amount: 转账金额\(精度10000，如：需转账10，应填入100000\), string fromKey: 转出账户私钥, string" |
| zusd和7种矿石转账交易     | [wasmTransfer](#9-wasmTransfer)       | "tokenType: 'zusd'或7种矿石名,小写, string from: 转出地址, string to: 转入地址, string amount: 转账金额\(精度10000，如：需转账10，应填入100000\), string fromKey: 转出账户私钥, string" |
| zusd和7种矿石转账交易     | [wasmTransfers](#10-wasmTransfer)       | "contractAddr: GCP-10合约地址, string from: 转出地址, string to: 转入地址, string amount: 转账金额\(精度10000，如：需转账10，应填入100000\), string fromKey: 转出账户私钥, string" |
| 返回签名后的交易zpt/gala  | [nativeTransferStr](#11-nativeTransferStr)  | "tokenType: 'zpt'或'gala',小写, string from: 转出地址, string to: 转入地址, string amount: 转账金额\(精度10000，如：需转账10，应填入100000\), string fromKey: 转出账户私钥, string" | 交易签名             |
| 返回签名后的交易zust/七种矿石 | [wasmTransferStr](#12-wasmTransferStr)    | "tokenType: 'zusd'或7种矿石名,小写, string from: 转出地址, string to: 转入地址, string amount: 转账金额\(精度10000，如：需转账10，应填入100000\), string fromKey: 转出账户私钥, string" | 交易签名             |
| 返回该账户未提取的gala数量  |  [unboundGala](#13-unboundGala)       | address: 账户地址                                                                                                                                       |
| 提取该账户未提取的gala   |  [withdrawGala](#14-withdrawGala)       | "tokenType: 'gala',小写, string claimer:申请地址, string to: 转入地址, string amount: 转账金额\(精度10000，如：需转账10，应填入100000\), string claimerKey : 转出账户私钥, string" | 交易哈希                                                                                                                                                      |

#### 1. createWallet
```
ZeepinSDK.createWallet(password:string, useName:string)
```
##### 样例
```
import sdk from '../../packages/index.js'

let result = sdk.createWallet('11', 'xiaoming')
console.log(result)
```

#### 2. importByPrivateKey
```
ZeepinSDK.importByPrivateKey(password:string, privateKey:string)
```

#### 3. importByKeystore
```
ZeepinSDK.importByKeystore(password:string, keystore:string)
```

#### 4. modifyPassword
```
ZeepinSDK.modifyPassword(oldPassword:string, newPassword:string, keystore:string)
```

#### 5. balanceOfNative
```
ZeepinSDK.balanceOfNative(address:string)
```
##### 样例
```
import sdk from '../../packages/index.js'

sdk.setUrl('http://test1.zeepin.net:20334')
let native = await sdk.balanceOfNative('ZTMpJFXdmgosonQn5KVy3fi8YmBkztAs4Q')
console.log(native)
```

#### 6. balanceOfOthers
```
ZeepinSDK.balanceOfOthers(address:string)
```

#### 7. smartCodeEventByTxHash
```
ZeepinSDK.smartCodeEventByTxHash(txnhash:string)
```

#### 8. nativeTransfer
```
ZeepinSDK.nativeTransfer(tokenType:string, from:string, to:string, amount:string, fromKey:string)
```
##### 样例
```
import sdk from '../../packages/index.js'

let from = 'ZQXhii1uD8YNmx57LcPDnBWWhZVnW3QiFA'
let to = 'Za5YKANnk8mdgiqCVUbk16gPhZ5CxtBNmK'
let fromKey = 'c2fbcb381e1eb50209334306e37ab9c4853eb789a847092bb0879d0d69cfc344'
sdk.setUrl('http://test1.zeepin.net:20334')

let result = await sdk.nativeTransfer('zpt', from, to, '10000', fromKey)
console.log(result)
```

#### 9. wasmTransfer
```
ZeepinSDK.wasmTransfer(tokenType:string, from:string, to:string, amount:string, fromKey:string)
```

#### 10. wasmTransfers
```
ZeepinSDK.wasmTransfers(contractAddr:string, from:string, to:string, amount:string, fromKey:string)
```

#### 11. nativeTransferStr
```
ZeepinSDK.nativeTransferStr(tokenType:string, from:string, to:string, amount:string, fromKey:string)
```

#### 12. wasmTransferStr
```
ZeepinSDK.wasmTransferStr(tokenType:string, from:string, to:string, amount:string, fromKey:string)
```

#### 13. unboundGala
```
ZeepinSDK.unboundGala(address:string)
```

#### 14. withdrawGala
```
ZeepinSDK.withdrawGala(tokenType:string, claimer:string, to:string, amount:string, claimerKey:string)
```
