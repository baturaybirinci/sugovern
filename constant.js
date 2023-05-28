export const DAO_ADDRESS = '0x36B9a42338e5f05e9d4228573f1f62c42aF82507'
export const FACTORY_JSON = require("./blockchain1/build/contracts/DAOFactory.json");
export const DAO_JSON = require("./blockchain1/build/contracts/MyDAO.json");
export const TOKEN_JSON = require('./blockchain1/build/contracts/SUToken.json');
export const LINE_COUNT = 4
export const RPC = 'https://rpc-mumbai.maticvigil.com'
export const TOP_DAO = '0x540a6ec5dd7D285267Fdbf7281a3D7Ce6d5E035D'
export const SUB_DAOS = ['0x65b071638f5e2ec76cC8C5e80f40e22aeB94ecb1','0xE269C268523b4Cd2ecB774a5890b7225ec6A5C80','0xae4462c1d06b93b4E88E404dfDb838fdC4528E5a','0x162505f183c5157b9DAccC2fc45052b15301c1f4']
export const params = [{
    chainName: 'Mumbai Testnet',
    chainId: '0x13881',
    nativeCurrency: {name: 'MATIC', decimals: 18, symbol: 'MATIC'},
    rpcUrls: ['https://polygon-mumbai.g.alchemy.com/v2/your-api-key'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/']
}
]
export const CHAIN_ID = 8001
export const CONSTANT_DICT = {
    'DAO_ADDRESS': DAO_ADDRESS,
    'FACTORY_JSON': FACTORY_JSON,
    'DAO_JSON': DAO_JSON,
    'TOKEN_JSON': TOKEN_JSON,
    'LINE_COUNT': LINE_COUNT,
    'RPC': RPC,
    'TOP_DAO': TOP_DAO,
    'SUB_DAOS': SUB_DAOS,
    'params': params,
    'CHAIN_ID': CHAIN_ID
};
