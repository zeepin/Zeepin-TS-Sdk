export const ADDR_VERSION = '50';

export const DEFAULT_ALGORITHM = {
    algorithm: 'ECDSA',
    parameters: {
        curve: 'P-256'
    }
};

export const DEFAULT_SCRYPT = {
    cost: 16384,
    blockSize: 8,
    parallel: 8,
    size: 64
};

export const TEST_NODE = '192.168.199.244'
/**
export const MAIN_NODE = '';
 */

export const HTTP_REST_PORT = '20334';
export const HTTP_RPC_PORT = '20336';
export const HTTP_WS_PORT = '20335';

export const TEST_ZEEPIN_URL = {
    REST_URL: `http://${TEST_NODE}:${HTTP_REST_PORT}`,
    RPC_URL: `http://${TEST_NODE}:${HTTP_RPC_PORT}`,
    SOCKET_URL: `ws://${TEST_NODE}:${HTTP_WS_PORT}`
};

/**
export const MAIN_ZEEPIN_URL = {
    REST_URL: `http://${MAIN_NODE}:${HTTP_REST_PORT}/`,
    RPC_URL: `http://${MAIN_NODE}:${HTTP_RPC_PORT}/`,
    SOCKET_URL: `ws://${MAIN_NODE}:${HTTP_WS_PORT}`
};
 */

export const TOKEN_TYPE = {
    ZPT: 'ZPT',
    GALA: 'Gala'
};

export const ZPT_CONTRACT = '0000000000000000000000000000000000000001';
export const GALA_CONTRACT = '0000000000000000000000000000000000000002';

export const ZUSD_TEST_CONTRACT = 'c110eea4f6ca75ca9275b064b9c3b446087c6d43';
// export const ZUSD_MAIN_CONTRACT = 'c1d9f156c4f32f79e6864270a77688880447b179';

export const defaultPayer = 'ZTMpJFXdmgosonQn5KVy3fi8YmBkztAs4Q';
export const defaultPrivateKey = 'c2fbcb381e1eb50209334306e37ab9c4853eb789a847092bb0879d0d69cfc344';

export const NATIVE_INVOKE_NAME = 'ZeepinChain.Native.Invoke';
