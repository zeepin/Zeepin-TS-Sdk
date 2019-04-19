import axios from 'axios';
import { TEST_ZEEPIN_URL } from "../../common/consts";
import { concatParams, hex2VarBytes, hexstr2str } from "../../common/functionsUtils";
import UrlConsts from "./urlConsts";
import { Address } from "../../wallet/address";
import { ERROR_CODE } from "../../common/error";

export default class RestClient {
    url: string;
    version: string;
    action: string;

    constructor(url?:string) {
        this.url = url || TEST_ZEEPIN_URL.REST_URL;
        this.version = 'v1.0.0';
        this.action = 'sendrawtransaction';
    }

    sendRawTransaction(hexData: string, preExec: boolean = false): Promise<any> {
        const param = new Map<string, string>();
        if(preExec) {
            param.set('preExec', '1');
        }
        let url = this.url + UrlConsts.Url_send_transaction;
        url += concatParams(param);
        const body = {
            Action: this.action,
            Version: this.version,
            Data: hexData
        };
        return axios.post(url, body).then((res) => {
                return res.data;
        });
    }

    getRawTransaction(txHash: string): Promise<any> {
        const param = new Map<string, string>();

        param.set('raw', '1');
        let url = this.url + UrlConsts.Url_get_transaction + txHash;
        url += concatParams(param);
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getRawTransactionJson(txHash: string): Promise<any> {
        const param = new Map<string, string>();
        param.set('raw', '0');
        let url = this.url + UrlConsts.Url_get_transaction + txHash;
        url += concatParams(param);
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getNodeCount(): Promise<any> {
        const url = this.url + UrlConsts.Url_get_node_count;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getBlockHeight(): Promise<any>{
        const url = this.url + UrlConsts.Url_get_block_height;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getBlock(value: number | string): Promise<any> {
        const params = new Map<string, string>();
        params.set('raw', '1');

        let url = '';
        if (typeof value === 'number') {
            url = this.url + UrlConsts.Url_get_block_by_height + value;
        } else if (typeof value === 'string') {
            url = this.url + UrlConsts.Url_get_block_by_hash + value;
        }
        url += concatParams(params);

        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get contract info by code hash.The result is hex encoded string.
     * @param codeHash Code hash of contract.The value is reversed contract address.
     */
    getContract(codeHash: string): Promise<any> {
        const params = new Map<string, string>();
        params.set('raw', '1');

        let url = this.url + UrlConsts.Url_get_contract_state + codeHash;
        url += concatParams(params);

        // console.log('url: '+url);
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get contract info by code hash. The result is json.
     * @param codeHash Code hash of contract.
     */
    getContractJson(codeHash: string): Promise<any> {
        const params = new Map<string, string>();
        params.set('raw', '0');
        let url = this.url + UrlConsts.Url_get_contract_state + codeHash;
        url += concatParams(params);
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getSmartCodeEvent(value: string | number): Promise<any> {
        let url = '';
        if (typeof value === 'string') {
            url = this.url + UrlConsts.Url_get_smartcodeevent_by_txhash + value;
        } else if (typeof value === 'number') {
            url = this.url + UrlConsts.Url_get_smartcodeevent_txs_by_height + value;
        }
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get the block height by reversed transaction hash.
     * @param hash Reversed transaction hash.
     */
    getBlockHeightByTxHash(hash: string): Promise<any> {
        const url = this.url + UrlConsts.Url_get_block_height_by_txhash + hash;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get the stored value in smart contract by the code hash and key.
     * @param codeHash Code hash of the smart contract
     * @param key Key of the stored value
     */
    getStorage(codeHash: string, key: string): Promise<any> {
        const url = this.url + UrlConsts.Url_get_storage + codeHash + '/' + key;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get the merkle proof by transaction hash
     * @param hash Reversed transaction hash
     */
    getMerkleProof(hash: string): Promise<any> {
        const url = this.url + UrlConsts.Url_get_merkleproof + hash;

        // tslint:disable-next-line:no-console

        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get balance of some address
     * The result contains balance of ZPT and Gala
     * @param address Address
     */
    getBalance(address: Address): Promise<any> {
        const url = this.url + UrlConsts.Url_get_account_balance + address.toBase58();
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get block info by block's height or hash.
     * @param value Block's height or hash
     */
    getBlockJson(value: number | string): Promise<any> {
        let url = '';
        if (typeof value === 'number') {
            url = this.url + UrlConsts.Url_get_block_by_height + value;
        } else if (typeof value === 'string') {
            url = this.url + UrlConsts.Url_get_block_by_hash + value;
        }

        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    /**
     * Get allowance by address
     * @param asset Asset type. Only ZPT or Gala.
     * @param from Address of allowance sender.
     * @param to Address of allowance receiver.
     */
    getAllowance(asset: string, from: Address, to: Address): Promise<any> {
        asset = asset.toLowerCase();
        if (asset !== 'zpt' && asset !== 'gala') {
            throw ERROR_CODE.INVALID_PARAMS;
        }
        const url = this.url + UrlConsts.Url_get_allowance +
            asset.toLowerCase() + '/' + from.toBase58() + '/' + to.toBase58();
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getUnboundGala(address: Address): Promise<any> {
        const url = this.url + UrlConsts.Url_get_unbound_gala + address.toBase58();
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getBlockTxsByHeight(height: number): Promise<any> {
        const url = this.url + UrlConsts.Url_get_block_txs_by_height + height;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getGasPrice(): Promise<any> {
        const url = this.url + UrlConsts.Url_get_gasprice ;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getMempoolTxCount(): Promise<any> {
        const url = this.url + UrlConsts.Url_get_mempool_txcount;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getMempoolTxState(hash: string): Promise<any> {
        const url = this.url + UrlConsts.Url_get_mempool_txstate + hash;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }

    getVersion(): Promise<any> {
        const url = this.url + UrlConsts.Url_get_version;
        return axios.get(url).then((res) => {
            return res.data;
        });
    }
}
