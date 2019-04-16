import axios from 'axios';
import { TEST_ZEEPIN_URL } from "../../common/consts";

export default class RpcClient {
    url: string;

    constructor(url ?: string) {
        this.url = url || TEST_ZEEPIN_URL.RPC_URL;
    }

    makeRequest(method: string, ...params: any[]) {
        const request = {
            jsonrpc: '2.0',
            method,
            params,
            id: 1
        };
        return request;
    }

    getSmartCodeEvent(value: string | number): Promise<any> {
        const req = this.makeRequest('getsmartcodeevent', value);

        return axios.post(this.url, req).then((res) => {
            return res.data;
        });
    }
}
