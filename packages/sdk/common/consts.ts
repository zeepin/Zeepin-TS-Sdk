export const ADDR_VERSION = '50';

export const DEFAULT_ALGORITHM = {
    algorithm: 'ECDSA',
    parameters: {
        curve: 'P-256'
    }
};

export const DEFAULT_SCRYPT = {
    cost: 1024,
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
    ZPT: 'zpt',
    GALA: 'gala'
};

export const defaultPayer = 'ZTMpJFXdmgosonQn5KVy3fi8YmBkztAs4Q';
export const defaultPrivateKey = 'c2fbcb381e1eb50209334306e37ab9c4853eb789a847092bb0879d0d69cfc344';

export const NATIVE_INVOKE_NAME = 'ZeepinChain.Native.Invoke';

export const ZPT_CONTRACT = '0000000000000000000000000000000000000001';
export const GALA_CONTRACT = '0000000000000000000000000000000000000002';

export const TX_MAX_SIG_SIZE = 16;

// contracts addresses under test net
export const CONTRACTS_TEST = [
    {
        name: 'zusd',
        contractAddr: 'c110eea4f6ca75ca9275b064b9c3b446087c6d43'
    },
    {
        name: 'glore',
        contractAddr: '0f27a43a74c963e07c0b633aff49ebb269e6d727'
    },
    {
        name: 'beryl',
        contractAddr: '120e3eb603d68cfca406b7d51362586e38c9f4f4'
    },
    {
        name: 'sapphire',
        contractAddr: 'bbc4773cf57b94c466d82781359b7d55000b3e9d'
    },
    {
        name: 'gold',
        contractAddr: 'e5c0c001a4a76dfa1ceae2ded6fd634c3a2ff572'
    },
    {
        name: 'amber',
        contractAddr: '66660350c444626e85021c9a12e8291409d6a021'
    },
    {
        name: 'jasper',
        contractAddr: '5a5b236556d6afc003e364f3aaa4c0f624955179'
    },
    {
        name: 'charoite',
        contractAddr: 'fe1522fcf65b91dfdce8b9f62a54c8bde94aa959'
    }
];

// contracts addresses under main net
export const CONTRACTS_MAIN = [
    {
        name: 'zusd',
        contractAddr: 'c1d9f156c4f32f79e6864270a77688880447b179'
    },
    {
        name: 'glore',
        contractAddr: '2fc27e33f043a3cc71746ce598abb6ca4b87c713'
    },
    {
        name: 'beryl',
        contractAddr: '0cad69475cad88fd928e1d00feadfd330149bb4f'
    },
    {
        name: 'sapphire',
        contractAddr: 'd7b3693c21b1e3dec389075b0a8ba80344c1906f'
    },
    {
        name: 'gold',
        contractAddr: '45b5856bd286a83682c60b5cbad55e7895771212'
    },
    {
        name: 'amber',
        contractAddr: '226d6170e6ed4b22ddc8b091bf6b4cc7bed96aff'
    },
    {
        name: 'jasper',
        contractAddr: 'c5985df728d4a85166243cdd44d8e522f78eb00c'
    },
    {
        name: 'charoite',
        contractAddr: 'cb29ef66434439dc55ccf01e2ce52aec3628def9'
    }
];
