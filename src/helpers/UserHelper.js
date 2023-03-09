import Web3 from "web3";
// import {
//   NFT_JSON,
//   DEX_JSON,
//   TOKEN_JSON,
//   TOKEN_URI_ABI,
//   NAME_ABI,
//   SYMBOL_ABI,
//   API_PATH,
//   DEX_ADDRESS,
//   OWNER_OF_ABI,
//   SELL_NFT_ABI,
//   BUY_NFT_ABI,
// } from "../constants";


async function WalletConnect() {
    let ret;
    if (window.ethereum) {
      await window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          ret = accounts[0];
        });
    }
    return ret;
  }



export { WalletConnect}
