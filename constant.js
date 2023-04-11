export const DAO_ADDRESS = '0x36B9a42338e5f05e9d4228573f1f62c42aF82507'
export const FACTORY_JSON = require("./blockchain1/build/contracts/DAOFactory.json");
export const DAO_JSON = require("./blockchain1/build/contracts/MyDAO.json");
export const TOKEN_JSON = require('./blockchain1/build/contracts/SUToken.json');

export const params = [{
    chainName: 'Mumbai Testnet',
    chainId: '0x13881',
    nativeCurrency: {name: 'MATIC', decimals: 18, symbol: 'MATIC'},
    rpcUrls: ['https://polygon-mumbai.g.alchemy.com/v2/your-api-key'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/']
}
]
export const CHAIN_ID = 8001