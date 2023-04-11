import Web3 from "web3";
import {DAO_ADDRESS, DAO_JSON, FACTORY_JSON} from "../../constant";


async function NetworkControl() {
    const chainId = 80001;
    if (window.ethereum.networkVersion !== chainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{chainId: '0x13881'}]
            });
        } catch (err) {
            // This error code indicates that the chain has not been added to MetaMask
            if (err.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainName: 'Mumbai Testnet',
                            chainId: '0x13881',
                            nativeCurrency: {name: 'MATIC', decimals: 18, symbol: 'MATIC'},
                            rpcUrls: ['https://polygon-mumbai.g.alchemy.com/v2/your-api-key'],
                            blockExplorerUrls: ['https://mumbai.polygonscan.com/']
                        }
                    ]
                });
            }
        }
    }
}

async function WalletConnect() {
    // await NetworkControl()
    let ret;
    if (window.ethereum) {
        await window.ethereum
            .request({method: "eth_requestAccounts"})
            .then((accounts) => {
                ret = accounts[0];
            });
    }

    return ret;

}

async function DaoIsExist(address) {
    const web3 = new Web3(window.ethereum)
    const factoryContract = new web3.eth.Contract(
        FACTORY_JSON["abi"],
        DAO_ADDRESS
    );
    let retVal = false;
    await factoryContract.methods
        .dao_exists(address)
        .call()
        .then((result) => {
            retVal = result
        }).catch((err) => alert(err))
    return retVal;
}

function BindContract(abi, address) {
    const web3 = new Web3(window.ethereum)
    return new web3.eth.Contract(
        abi,
        address
    )
}

async function fetchNextDaoId(contract) {
    let nextDaoId;
    if (contract) {
        await contract.methods
            .next_dao_id()
            .call()
            .then((result) => {
                nextDaoId = result;
            })
    }
    return nextDaoId;
}

async function fetchAllDaos(contract) {
    const web3 = new Web3(window.ethereum)
    const numOfDaos = await fetchNextDaoId(contract);
    //fetch the address of the top DAO
    let res;
    if (contract) {
        await contract.methods
            .top_dao()
            .call()
            .then((result) => {
                res = result;
            })
    }
    let allDaos = [];
    //fetch all the DAOs created by the DAOFactory contract
    //fetch if the dao is deleted or not, if it is deleted, then we will not show it in the UI
    //fetch the name and description of the DAOs
    //push the DAOs to allDaos array
    for (let i = 0; i < numOfDaos; i++) {
        let daoAddress, daoName, daoDescription,imageUrl;
        await contract.methods
            .all_daos(i)
            .call()
            .then((result) => {
                daoAddress = result;
            })
        //check if the DAO is deleted or not, if it is deleted, then we will not show it in the UI
        if (await DaoIsExist(daoAddress)) {
            let daoContract = new web3.eth.Contract(DAO_JSON['abi'], daoAddress);
            await daoContract.methods
                .dao_name()
                .call()
                .then((result) => {
                    daoName = result;
                })
            await daoContract.methods
                .dao_description()
                .call()
                .then((result) => {
                    daoDescription = result;
                })
            await daoContract.methods
            .imageUrl()
            .call()
            .then((result) => {
                imageUrl = result;
            })
            allDaos.push([daoAddress, daoName, daoDescription,imageUrl]);
        }
    }
    return allDaos;
}

async function DaoInfo(contract, address) {
    var retVal = [0, 0, 0, 0,0]; // Children Num, Name, Description, Proposal Names,img
    contract.methods.num_children(String(address)).call().then((result) => {
        retVal[0] = result
    })
    contract.methods.dao_name().call().then((result) => {
        retVal[1] = result
    })
    contract.methods.dao_description().call().then((result) => {
        retVal[2] = result
    })
    contract.methods.getProposalName().call().then((result) => {
        retVal[3] = result
    })
    contract.methods.imageUrl().call().then((result) => {
        retVal[4] = result
    })

    return retVal;
}

export {WalletConnect, DaoIsExist, BindContract, fetchNextDaoId, fetchAllDaos, DaoInfo, NetworkControl}
