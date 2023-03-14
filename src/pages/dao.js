import {useState, useEffect} from 'react'
import React from "react"
import Web3 from 'web3'
import Head from 'next/head'
import styles from '../styles/d_try.module.css'
import {useRouter} from "next/dist/client/router"
import Proposals from '../../daoTabs/Proposals'
import CreateProposal from '../../daoTabs/CreateProposal'
import VoteOnProposals from '../../daoTabs/VoteOnProposals'
import WithdrawTokens from '../../daoTabs/WithdrawTokens'
import SendVoterToken from '../../daoTabs/SendVoterToken'
import SendYKToken from '../../daoTabs/SendYKToken'
import ViewSubDAOs from '../../daoTabs/ViewSubDAOs'
import CreateChildDAO from '../../daoTabs/CreateChildDAO'
import Popup from '../components/Popup'
import CheckMyTokens from '../../daoTabs/CheckMyTokens'
import Spinner from '../components/Spinner'
import ClawBack from '../../daoTabs/ClawBack'
import Delegate from '../../daoTabs/Delegate'
import DeleteDAO from '../../daoTabs/DeleteDAO'
import Header from '../components/Header'
import Sidebar from '../components/SideBar'
import LockScreen from '../components/LockScreen'
import TransferTokens from '../../daoTabs/TransferTokens'
import {DAO_JSON, TOKEN_JSON, FACTORY_JSON, DAO_ADDRESS} from "../../constant";
import {BindContract, DaoInfo, DaoIsExist, WalletConnect} from "@/helpers/UserHelper";

export default function Dao() {
    const router = useRouter(); //next js component to take information from url
    const address = router.query["address"]; //address of the DAO from the URL 
    const [initialized, setInitialized] = useState(false);  //to check if the page is initialized, i.e. init() function is ran successfully
    const [transactionInProgress, setTransactionInProgress] = useState(false);  //this is used inside LockScreen component, to show a component that covers the entire page and a spinner when a transaction is in progress
    const [contracts, setContracts] = useState({
        daoContract: undefined,
        voterTokenContract: undefined,
        ykTokenContract: undefined,
        daoFactoryContract: undefined
    }); //contracts that we need in our function calls, we will set them in init() function
    const [walletAddress, setWalletAddress] = useState(undefined) //address of the wallet that is connected to the page, we will try to set it in init() function
    const [alertMessage, setAlertMessage] = useState({text: "", title: ""})  //this is used inside Popup component, to pass a message to the inside of the popup when an error occurs, or a transaction is successful, or in a case of warning
    const [daoInfo, setDaoInfo] = useState({
        name: "",
        description: "",
        total_voter_tokens: 0,
        num_children: 0,
        total_yk_tokens: 0,
        total_proposals: 0,
        total_subdaos: 0
    }) //this is used to store the information about the DAO, we will set it in init() function, we will show it on the textbox under the DAO image
    const [popupTrigger, setPopupTrigger] = useState(false) //this is used inside Popup component, to trigger the popup when an error occurs, or a transaction is successful, or in a case of warning
    const [selectedNavItem, setSelectedNavItem] = useState(10); //this is used to change between the tabs, we will set it when a user clicks on the buttons on the sidebar, in default it is set to 10, which is the view proposals tab

    //these are the data of the contracts that, we will use them in init() function
    //we will take the abi of the contracts from these files, and we will take the address of the contracts from the URL
    const setAlert = (err) =>
    {
        setAlertMessage({text: err.message, title: "Error"});
        setPopupTrigger(true)
    }
    useEffect(() => {
        WalletConnect().then((res) => {
            setWalletAddress(res);
        });
        if (address) {
            if (!contracts['daoFactoryContract']) {
                setContracts(prevState => ({
                    ...prevState,
                    daoFactoryContract: BindContract(FACTORY_JSON["abi"], DAO_ADDRESS)
                }))
            } else {
                if (!contracts['daoContract']) {
                    DaoIsExist(address).then((res) => {
                        if (!res) {
                            setAlert(Error("DAO does not exist"))
                        } else {
                            setContracts(prevState => ({
                                ...prevState,
                                daoContract: BindContract(DAO_JSON["abi"], address)
                            }))
                        }
                        contracts['daoFactoryContract'].methods.num_children(String(address)).call().then((result) =>
                            setDaoInfo(prevState => ({
                                ...prevState,
                                num_children: result
                            }))).catch((err) => setAlert(err))
                    })
                } else {
                    contracts['daoContract'].methods.dao_name().call().then((result) => setDaoInfo(prevState => ({
                        ...prevState,
                        name: result
                    }))).catch((err) => setAlert(err));
                    contracts['daoContract'].methods.dao_description().call().then((result) => setDaoInfo(prevState => ({
                        ...prevState,
                        description: result
                    }))).catch((err) => setAlert(err));
                    contracts['daoContract'].methods.getProposalName().call().then((result) => setDaoInfo(prevState => ({
                        ...prevState,
                        total_proposals: result.length
                    }))).catch((err) => setAlert(err));
                    contracts['daoContract'].methods.voter_token().call().then((result) => setContracts(prevState => ({
                        ...prevState,
                        voterTokenContract: BindContract(DAO_JSON["abi"], result)
                    }))).catch((err) => setAlert(err));
                    contracts['daoContract'].methods.yk_token().call().then((result) => setContracts(prevState => ({
                        ...prevState,
                        ykTokenContract: BindContract(DAO_JSON["abi"], result)
                    }))).catch((err) => setAlert(err));
                    setInitialized(true)
                }
            }
        }

    }, [address, contracts])

    //address_given is the address of the DAO
    //this function is used to get the name of the DAO
    //before each dao function call, we need to make sure that this page is initialized since we would need to use walletAddress and contracts
    const getDaoName = async (address_given) => {
        if (!initialized) {
            await init();
        }
        let provider = window.ethereum;

        const web3 = new Web3(provider);
        let daoABI = dataDAO["abi"]
        let tempDaoContract

        try {
            tempDaoContract = new web3.eth.Contract(
                daoABI,
                address_given
            );
        } catch (err) {
            setAlertMessage({text: "Invalid DAO Address", title: "Error"});
            setPopupTrigger(true);
            return;
        }

        //get the name of the DAO, set the return value to daoName, give out a popup alert if there is an error, and return the value if there is no error
        let daoName;
        await tempDaoContract.methods.dao_name().call().then((result) => {
            daoName = result
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        });
        return daoName;
    }

    //address_given is the address of the DAO
    //this function is used to get the description of the DAO
    const getDaoDescription = async (address_given) => {
        if (!initialized) {
            await init();
        }
        let provider = window.ethereum;
        const web3 = new Web3(provider);
        let daoABI = dataDAO["abi"]

        let tempDaoContract = new web3.eth.Contract(
            daoABI,
            address_given
        );

        //get the description of the DAO, set the return value to daoDescription, give out a popup alert if there is an error, and return the value if there is no error
        let daoDescription;
        await tempDaoContract.methods.dao_description().call().then((result) => {
            daoDescription = result
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        });
        return daoDescription;
    }

    //create new proposal, passed into CreateProposal.js tab
    //name is the name of the proposal, description is the description of the proposal, vote is an array of strings (options), power is the voting power of the proposal, type is the type of the proposal (weighted or normal)
    //calling this function requires the user to be a YK, but we handle the error if the user is not a YK
    const createNewProposal = async (name, description, vote, power, type) => {

        if (!initialized) {
            await init();
        }

        //We can set initial votes even before the proposal is created, but to make it fair we set it to 0
        //But there is an implementation in the contract that allows us to set initial votes something other than 0
        var initial_votes = []
        for (var i = 0; i < vote.length; i++) {
            initial_votes.push(parseInt(0));
        }
        vote.forEach((element) => {
            element = String(element);
        });

        setTransactionInProgress(true); //set the transactionInProgress to true, activate the screenlock component, so that the user cannot send another transaction while the current transaction is in progress
        await contracts.daoContract.methods.createProposal(String(name), String(description), vote, initial_votes, parseInt(power), parseInt(type)).send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "Successfully created a proposal", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        });
        return 0;
    }

    //delete the DAO, passed into DeleteDAO.js tab
    //calling this function requires the user to be a YK, but we handle the error if the user is not a YK
    const deleteThisDAO = async () => {
        if (!initialized) {
            await init();
        }

        setTransactionInProgress(true); //set the transactionInProgress to true, activate the screenlock component, so that the user cannot send another transaction while the current transaction is in progress
        await contracts.daoContract.methods.delete_this_dao().send({from: walletAddress}).then(() => {
            setAlertMessage({text: "Successfully deleted the DAO", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        });
        return 0;
    }

    //vote on a normal proposal, passed into VoteOnProposals.js tab
    //votes are not multiplied by the amount of voter tokens that user has
    //id is the id of the proposal, vote is an array of strings (options), vote_power is an array of integers (voting power distribution)
    const voteOnNormalProposal = async (id, vote, vote_power) => {
        if (!initialized) {
            await init();
        }

        //to make sure the inputs are in the correct format
        vote.forEach(element => {
            element = String(element)
        });
        vote_power.forEach(element => {
            element = parseInt(element)
        });

        //get the gas limit for the transaction, and send the transaction
        setTransactionInProgress(true); //set transactionInProgress to true, activate the screenlock component, so that the user cannot do anything else while the transaction is in progress
        await contracts.daoContract.methods.vote_power(parseInt(id), vote, vote_power).send({
            from: walletAddress
        }).then(() => {
            setAlertMessage({text: "Successfully voted on a proposal", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })

        return 0;
    }

    //vote on a weighted proposal, passed into VoteOnProposals.js tab
    //votes are multiplied by the amount of voter tokens that user has
    //id is the id of the proposal, vote is an array of strings (options), vote_power is an array of integers (voting power distribution), weight is the amount of voter tokens that user wants to use (at max the amount of tokens that user has)
    const voteOnWeightedProposal = async (id, vote, vote_power, weight) => {
        if (!initialized) {
            await init();
        }
        parseInt(weight);


        vote.forEach(element => {
            element = String(element)
        });
        vote_power.forEach(element => {
            element = parseInt(element)
        });
        setTransactionInProgress(true);
        await contracts.daoContract.methods.vote_power_weighted(parseInt(id), vote, vote_power, weight).send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "Successfully voted on a proposal", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })

        return 0;
    }

    //get proposal information, passed into ViewProposals.js tab, and the VoteOnProposals.js tab
    //returns an array of objects, where each object is a proposal, and the object has the proposal id as the key, and the proposal name, vote names, vote numbers, and proposal power in an array as the value
    const getAllProposals = async () => {

        if (!initialized) {
            await init();
        }
        var proposalNames
        await contracts.daoContract.methods.getProposalName().call().then((result) => {
            proposalNames = result
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        });

        //put proposals in a mapping with the proposal id as the key, and the proposal name, vote names, vote numbers, and proposal power in an array as the value
        //mapping inside a mapping
        var proposals = []
        proposalNames.forEach((name, index) => {
            var proposal = {}
            proposal[index] = [name]
            proposals.push(proposal)
        })
        //get the vote names, vote numbers, and proposal power for each proposal
        for (var i = 0; i < proposalNames.length; i++) {
            i = parseInt(i)
            await contracts.daoContract.methods.getProposalVoteNames(i).call().then((result) => {
                proposals[i][i].push(result)
            }).catch((err) => {
                setAlertMessage({text: err.message, title: "Error"});
                setPopupTrigger(true)
            });
            await contracts.daoContract.methods.getProposalVoteNumbers(i).call().then((result) => {
                proposals[i][i].push(result)
            }).catch((err) => {
                setAlertMessage({text: err.message, title: "Error"});
                setPopupTrigger(true)
            });
            await contracts.daoContract.methods.getProposalPower(i).call().then((result) => {
                proposals[i][i].push(result)
            }).catch((err) => {
                setAlertMessage({text: err.message, title: "Error"});
                setPopupTrigger(true)
            });
            await contracts.daoContract.methods.getProposalType(i).call().then((result) => {
                proposals[i][i].push(result)
            }).catch((err) => {
                setAlertMessage({text: err.message, title: "Error"});
                setPopupTrigger(true)
            });
            await contracts.daoContract.methods.votes(String(walletAddress), i).call().then((result) => {
                proposals[i][i].push(result)
            }).catch((err) => {
                setAlertMessage({text: err.message, title: "Error"});
                setPopupTrigger(true)
            });
            await contracts.daoContract.methods.getProposalDescription().call().then((result) => {
                proposals[i][i].push(result[i])
            }).catch((err) => {
                setAlertMessage({text: err.message, title: "Error"});
                setPopupTrigger(true)
            });
        }

        return proposals;
    }

    //send voter tokens of given amount to another address, passed into SendVoterTokens.js tab
    //tokens are sent from the DAO contract to the given address, (dao to user transfer)
    //YK privilages are required to call send_voter_tokens_to_address_yk_directly() function, but the errors are handled if the user is not a YK
    const sendVoterTokens = async (address, amount) => {
        if (!initialized) {
            await init();
        }
        setTransactionInProgress(true);
        await contracts.daoContract.methods.send_voter_tokens_to_address_yk_directly(String(address), parseInt(amount)).send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "Successfully sent tokens", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
    }

    //send YK tokens of given amount to another address, passed into SendYKTokens.js tab
    //tokens are sent from the DAO contract to the given address, (dao to user transfer)
    //YK privilages are required to call send_yk_tokens_to_address_yk_directly() function, but the errors are handled if the user is not a YK
    const sendYKTokens = async (address, amount) => {
        if (!initialized) {
            await init();
        }
        setTransactionInProgress(true);
        await contracts.daoContract.methods.send_yk_tokens_to_address_yk_directly(String(address), parseInt(amount)).send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "Successfully sent tokens", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
    }

    //get voter balance from the voter token contract
    const getVoterBalance = async () => {
        if (!initialized) {
            await init();
        }
        let voterBalance
        await contracts.voterTokenContract.methods.balanceOf(String(walletAddress)).call().then((result) => {
            voterBalance = parseInt(parseInt(result) / Math.pow(10, 18))
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
        return voterBalance
    }

    //transfer voter tokens of given amount to another address, passed into TransferTokens.js tab
    //tokens are sent from the wallet address to the given address (peer to peer transfer)
    const transferVoterTokens = async (address, amount) => {
        if (!initialized) {
            await init();
        }
        //add 18 zeros to the end of the amount to convert it from wei
        let zero = "0";
        setTransactionInProgress(true);
        await contracts.voterTokenContract.methods.transfer(String(address), String(amount) + zero.repeat(18)).send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "Successfully transferred tokens", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
    }

    //transfer YK tokens of given amount to another address, passed into TransferTokens.js tab
    //tokens are sent from the wallet address to the given address (peer to peer transfer)
    const transferYKTokens = async (address, amount) => {
        if (!initialized) {
            await init();
        }
        //add 18 zeros to the end of the amount to convert it from wei
        let zero = "0";
        setTransactionInProgress(true);
        await contracts.ykTokenContract.methods.transfer(String(address), String(amount) + zero.repeat(18)).send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "Successfully transferred tokens", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
    }

    //get YK balance from the YK token contract
    const getYKBalance = async () => {
        if (!initialized) {
            await init();
        }
        let ykBalance
        await contracts.ykTokenContract.methods.balanceOf(String(walletAddress)).call().then((result) => {
            ykBalance = parseInt(parseInt(result) / Math.pow(10, 18))
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
        return ykBalance
    }

    //get child DAOs of the current DAO
    const getSubDAOs = async () => {
        if (!initialized) {
            await init();
        }
        //get number of child DAOs
        let numChildren
        await contracts.daoFactoryContract.methods.num_children(String(address)).call().then((result) => {
            numChildren = result
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })

        //iteratively get child DAO addresses
        let subDAOs = []
        for (var i = 0; i < numChildren; i++) {
            await contracts.daoFactoryContract.methods.parent_child_daos(String(address), parseInt(i)).call().then((result) => {
                subDAOs.push(result)
            }).catch((err) => {
                setAlertMessage({text: err.message, title: "Error"});
                setPopupTrigger(true)
            })
        }
        return subDAOs
    }

    //get parent DAO of the current DAO
    const getParentDAO = async () => {
        if (!initialized) {
            await init();
        }
        let parentDAOAddress
        await contracts.daoFactoryContract.methods.child_parent(String(address)).call().then((result) => {
            parentDAOAddress = result
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })

        return parentDAOAddress
    }

    //withdraw YK tokens from the DAO
    //Only used when the DAO mints the user YK tokens, but not directly sending them to the user
    //Example use case: when this user creates a child DAO, the parent DAO mints 1 child DAO YK token, and the user can withdraw it inside the child DAO
    const withdrawYKTokens = async (amount) => {
        if (!initialized) {
            await init();
        }
        setTransactionInProgress(true);
        await contracts.daoContract.methods.withdraw_yk_tokens(parseInt(amount)).send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "successfully withdrawn tokens", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
    }

    //withdraw voter tokens from the DAO
    //Only used when the DAO mints the user voter tokens, but not directly sending them to the user
    const withdrawVoterTokens = async (amount) => {
        if (!initialized) {
            await init();
        }
        setTransactionInProgress(true);
        await contracts.daoContract.methods.withdraw_voter_tokens(parseInt(amount)).send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "successfully withdrawn tokens", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
    }

    //get the number of YK tokens that the user can withdraw from the DAO
    const getYKSharesToBeGiven = async () => {
        if (!initialized) {
            await init();
        }
        let shares;
        await contracts.daoContract.methods.yk_shares_to_be_given(String(walletAddress)).call().then((result) => {
            shares = parseInt(parseInt(result) / Math.pow(10, 18))
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
        return shares
    }

    //get the number of voter tokens that the user can withdraw from the DAO
    const getVoterSharesToBeGiven = async () => {
        if (!initialized) {
            await init();
        }
        let shares
        await contracts.daoContract.methods.voter_shares_to_be_given(String(walletAddress)).call().then((result) => {
            shares = parseInt(parseInt(result) / Math.pow(10, 18))
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
        return shares
    }

    //create a child DAO, in our smart contract we need to create new voter and YK tokens for the child DAO
    //in order to deploy nw voter token and YK contracts we need to pass in the name and symbol of the tokens
    const createChildDAOFunc = async (name, description, ykTokenName, ykTokenSymbol, voterTokenName, voterTokenSymbol) => {
        if (!initialized) {
            await init();
        }
        setTransactionInProgress(true);
        await contracts.daoFactoryContract.methods.createChildDAO(address, String(name), String(description), String(ykTokenName), String(ykTokenSymbol), String(voterTokenName), String(voterTokenSymbol)).send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "successfully created child DAO", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
    }

    //delegate = transfer back, there is a misnamed function in the smart contract
    //transfer back YK tokens from all of your delegates to your wallet
    const delegateAllYK = async () => {
        if (!initialized) {
            await init();
        }
        setTransactionInProgress(true);
        await contracts.daoContract.methods.dao_delagation_multiple_getback_all_yk().send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "successfully delegated all YK tokens", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
    }

    //delegate = transfer back, there is a misnamed function in the smart contract
    //transfer back voter tokens from all of your delegates to your wallet
    const delegateAllVoter = async () => {
        if (!initialized) {
            await init();
        }
        setTransactionInProgress(true);
        await contracts.daoContract.methods.dao_delagation_multiple_getback_all_voter().send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "successfully delegated all voter tokens", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
    }
    //delegate = transfer back, there is a misnamed function in the smart contract
    //transfer back YK tokens from a specific delegate to your wallet
    const delegateAllFromAddressYK = async (address_wallet) => {
        if (!initialized) {
            await init();
        }
        setTransactionInProgress(true);
        await contracts.daoContract.methods.dao_delegation_single_getback_all_yk(String(address_wallet)).send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "successfully delegated all YK tokens from address", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
    }
    //delegate = transfer back, there is a misnamed function in the smart contract
    //transfer back voter tokens from a specific delegate to your wallet
    const delegateAllFromAddressVoter = async (address_wallet) => {
        if (!initialized) {
            await init();
        }
        setTransactionInProgress(true);
        await contracts.daoContract.methods.dao_delegation_single_getback_all_voter(String(address_wallet)).send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "successfully delegated all voter tokens from address", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
    }
    //delegate = transfer back, there is a misnamed function in the smart contract
    //transfer back a specific amount of YK tokens from a specific delegate to your wallet
    const delegateSomeFromAddressYK = async (address_wallet, amount_token) => {
        if (!initialized) {
            await init();
        }
        let zero = "0";
        setTransactionInProgress(true);
        await contracts.daoContract.methods.dao_delegation_single_getback_amount_yk(String(address_wallet), String(amount_token + zero.repeat(18))).send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "successfully delegated some YK tokens from address", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
    }
    //delegate = transfer back, there is a misnamed function in the smart contract
    //transfer back a specific amount of voter tokens from a specific delegate to your wallet
    const delegateSomeFromAddressVoter = async (address_wallet, amount_token) => {
        if (!initialized) {
            await init();
        }
        let zero = "0";
        setTransactionInProgress(true);
        await contracts.daoContract.methods.dao_delegation_single_getback_amount_voter(String(address_wallet), String(amount_token + zero.repeat(18))).send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "successfully delegated some voter tokens from address", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
    }

    //dao clawback, clawback YK tokens from all possible YK token holders
    const clawBackYKFromAll = async () => {
        if (!initialized) {
            await init();
        }
        console.log("clawback YK from all");
        setTransactionInProgress(true);
        await contracts.daoContract.methods.dao_clawback_all_yk().send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "successfully clawed back all YK tokens", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
    }

    //dao clawback, clawback voter tokens from all possible voter token holders
    const clawBackVoterFromAll = async () => {
        if (!initialized) {
            await init();
        }
        setTransactionInProgress(true);
        await contracts.daoContract.methods.dao_clawback_all_voter().send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "successfully clawed back all voter tokens", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
    }

    //dao clawback, clawback YK tokens from a specific YK token holder
    const clawBackYKFromSingleAddress = async (address_wallet) => {
        if (!initialized) {
            await init();
        }
        console.log(address_wallet)
        setTransactionInProgress(true);
        await contracts.daoContract.methods.dao_clawback_single_yk(String(address_wallet)).send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "successfully clawed back YK tokens from address", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
    }

    //dao clawback, clawback voter tokens from a specific voter token holder
    const clawBackVoterFromSingleAddress = async (address_wallet) => {
        if (!initialized) {
            await init();
        }
        console.log(address_wallet)
        setTransactionInProgress(true);
        await contracts.daoContract.methods.dao_clawback_single_voter(String(address_wallet)).send({
            from: walletAddress,
        }).then(() => {
            setAlertMessage({text: "successfully clawed back voter tokens from address", title: "Success"});
            setPopupTrigger(true)
        }).catch((err) => {
            setAlertMessage({text: err.message, title: "Error"});
            setPopupTrigger(true)
        })
    }

    //return dao page body with respect to the selected nav item state
    //we should add a state that when the dao does not exist, we should not return any of these tabs
    const getHTMLBody = () => {
        return selectedNavItem === 0 ?
            <CreateChildDAO onCreateChildDAO={createChildDAOFunc}></CreateChildDAO>
            :
            selectedNavItem === 1 ?
                <SendYKToken onSendTokens={sendYKTokens}></SendYKToken>
                :
                selectedNavItem === 2 ?
                    <ClawBack onClawBackYKFromAll={clawBackYKFromAll}
                              onClawBackYKFromSingleAddress={clawBackYKFromSingleAddress}
                              onClawBackVoterFromAll={clawBackVoterFromAll}
                              onClawBackVoterFromSingleAddress={clawBackVoterFromSingleAddress}></ClawBack>
                    :
                    selectedNavItem === 3 ?
                        <SendVoterToken onSendTokens={sendVoterTokens}></SendVoterToken>
                        :
                        selectedNavItem === 4 ?
                            <CreateProposal onCreateProposal={createNewProposal}></CreateProposal>
                            :
                            selectedNavItem === 5 ?
                                <DeleteDAO onDeleteDAO={deleteThisDAO}></DeleteDAO>
                                :
                                selectedNavItem === 6 ?
                                    <CheckMyTokens onCheckYKBalance={getYKBalance}
                                                   onCheckVoterBalance={getVoterBalance}></CheckMyTokens>
                                    :
                                    selectedNavItem === 7 ?
                                        <WithdrawTokens onWithdrawVoterTokens={withdrawVoterTokens}
                                                        onWithdrawYKTokens={withdrawYKTokens}
                                                        onVoterSharesToBeGiven={getVoterSharesToBeGiven}
                                                        onYKSharesToBeGiven={getYKSharesToBeGiven}></WithdrawTokens>
                                        :
                                        selectedNavItem === 8 ?
                                            <Delegate onDelegateAllYK={delegateAllYK}
                                                      onDelegateAllTokensFromAddressYK={delegateAllFromAddressYK}
                                                      onDelegateSomeTokensFromAddressYK={delegateSomeFromAddressYK}
                                                      onDelegateAllVoter={delegateAllVoter}
                                                      onDelegateAllTokensFromAddressVoter={delegateAllFromAddressVoter}
                                                      onDelegateSomeTokensFromAddressVoter={delegateSomeFromAddressVoter}></Delegate>
                                            :
                                            selectedNavItem === 9 ?
                                                <VoteOnProposals onGetVoterTokenBalance={getVoterBalance}
                                                                 onVoteOnNormalProposals={voteOnNormalProposal}
                                                                 onVoteOnWeightedProposals={voteOnWeightedProposal}
                                                                 onGetAllProposals={getAllProposals}></VoteOnProposals>
                                                :
                                                selectedNavItem === 10 ?
                                                    <Proposals onGetAllProposals={getAllProposals}></Proposals>
                                                    :
                                                    selectedNavItem === 11 ?
                                                        <ViewSubDAOs onGetDAODescription={getDaoDescription}
                                                                     onGetDAOName={getDaoName} onGetSubDAOs={getSubDAOs}
                                                                     onGetParentDAO={getParentDAO}></ViewSubDAOs>
                                                        :
                                                        selectedNavItem === 12 ?
                                                            <TransferTokens onTransferVoterTokens={transferVoterTokens}
                                                                            onTransferYKTokens={transferYKTokens}
                                                                            onGetVoterBalance={getVoterBalance}
                                                                            onGetYKBalance={getYKBalance}></TransferTokens>
                                                            :
                                                            <></>
    }

    return (
        <div className={styles.main}>
            <Head>
                <title>DAO APP</title>
                <meta name="description" content="A blockchain dao app"/>
            </Head>
            <div style={{minHeight: "100vh"}}>
                {
                    !initialized ?
                        <Spinner></Spinner>
                        :
                        <div className="row mx-0">

                            <Header WalletConnect={WalletConnect}
                                    logged={walletAddress !== undefined && walletAddress !== null}/>
                            <div className='page dao-page'>
                                <Sidebar setSelectedNavItem={setSelectedNavItem} selectedNavItem={selectedNavItem}/>
                                <div className="container" style={{padding: "30px"}}>
                                    <div className="row">
                                        <div className="col-xl-4 col-lg-3 col-md-2 col-sm-1 col-xs-1"></div>
                                        <div className="col-xl-4 col-lg-6 col-md-8 col-sm-10 col-xs-10">
                                            <div className="card mb-3">
                                                <img className="card-img-top rounded-0" alt='dao-image'
                                                     src="https://redenom.com/info/wp-content/uploads/2018/10/redenom_cover_fb_1200x630_dao_1-1.png"
                                                />
                                                <div className="card-body">
                                                    <h4 className="h4 card-title text-center text-black">{daoInfo.name}</h4>
                                                    <br/>
                                                    <p className="card-text"><small
                                                        className="text-dark">Welcome!</small></p>
                                                    <p className="card-text"><small
                                                        className="text-dark">{daoInfo.description}</small></p>
                                                    <p className="card-text"><small
                                                        className="text-muted">{daoInfo.num_children} subDAOs</small>
                                                    </p>
                                                    <p className="card-text"><small
                                                        className="text-muted">{daoInfo.total_proposals} proposals
                                                        created</small></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-xl-4 col-lg-3 col-md-2 col-sm-1 col-xs-1"></div>
                                    </div>
                                    <div className='row mt-5'>
                                        {
                                            transactionInProgress ?
                                                <LockScreen></LockScreen>
                                                :
                                                <></>
                                        }
                                        {getHTMLBody()}
                                    </div>
                                </div>
                            </div>
                        </div>
                }
            </div>
            <Popup trigger={popupTrigger} setTrigger={setPopupTrigger} setLockScreen={setTransactionInProgress}>
                <h2 className='h2 text-black'>{alertMessage.title}</h2>
                <p className='popup-message'>{alertMessage.text}</p>
            </Popup>
        </div>
    )
}