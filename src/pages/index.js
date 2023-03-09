import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import {WalletConnect} from '@/helpers/UserHelper'
import {useEffect, useState} from 'react'
import Header from "@/components/Header";
import Card from "@/components/Card";
import {SimpleGrid, Spinner} from "@chakra-ui/react";
import Popup from "@/components/Popup";
import Web3 from "web3";
import {DAO_ADDRESS, DAO_JSON, FACTORY_JSON, TOKEN_ADDRESS} from "../../constant";

export default function Home() {
    const [account, setAccount] = useState(null);
    const [alertMessage, setAlertMessage] = useState({text: "", title: ""}); //this is used inside Popup component, to pass a message to the inside of the popup when an error occurs, or a transaction is successful, or in a case of warning
    const [popupTrigger, setPopupTrigger] = useState(false);  //this is used inside Popup component, to trigger the popup to show up
    const [daoFactoryContract, setDaoFactoryContract] = useState(undefined); //to store the DAOFactory contract instance
    const [all_daos, setall_daos] = useState([]); //to store all the DAOs created by the DAOFactory contract
    const [topDAOAddress, setTopDAOAddress] = useState(""); //to store the address of the top DAO

    //these are the data of the contracts, we will use them in init() function
    //we will take the abi of the contracts from these files, and we will take the address of the contracts from the URL

    const [loaded, setLoaded] = useState(false); //to check if the page is loaded, i.e. all the DAOs are fetched from the blockchain

    useEffect(() => {
        WalletConnect().then((res) => {
            setAccount(res);
        });

        const web3 = new Web3(window.ethereum);
        //create contract object using the abi and the address of the factory contract
        try {
            const factoryContract = new web3.eth.Contract(
                FACTORY_JSON["abi"],
                DAO_ADDRESS
            );
            setDaoFactoryContract(factoryContract);
        } catch (err) {
            setAlertMessage({
                text: "Invalid DAO factory address",
                title: "Error",
            });
            setPopupTrigger(true);
            return;
        }

        //set the contract object in the state
        const fetchNextDaoId = async () => {
            let nextDaoId;
            if (daoFactoryContract) {
                await daoFactoryContract.methods
                    .next_dao_id()
                    .call()
                    .then((result) => {
                        nextDaoId = result;
                    })
                    .catch((err) => {
                        setAlertMessage({text: err.message, title: "Error"});
                        setPopupTrigger(true);
                    });
            }
            return nextDaoId;
        };

        const fetchAllDaos = async () => {
            const numOfDaos = await fetchNextDaoId();
            //fetch the address of the top DAO
            if (daoFactoryContract) {
                await daoFactoryContract.methods
                    .top_dao()
                    .call()
                    .then((result) => {
                        setTopDAOAddress(result);
                    })
                    .catch((err) => {
                        setAlertMessage({text: err.message, title: "Error"});
                        setPopupTrigger(true);
                    });
            }

            let allDaos = [];
            //fetch all the DAOs created by the DAOFactory contract
            //fetch if the dao is deleted or not, if it is deleted, then we will not show it in the UI
            //fetch the name and description of the DAOs
            //push the DAOs to allDaos array
            for (let i = 0; i < numOfDaos; i++) {
                let daoAddress, daoName, daoDescription;
                await daoFactoryContract.methods
                    .all_daos(i)
                    .call()
                    .then((result) => {
                        daoAddress = result;
                    })
                    .catch((err) => {
                        setAlertMessage({text: err.message, title: "Error"});
                        setPopupTrigger(true);
                    });

                //check if the DAO is deleted or not, if it is deleted, then we will not show it in the UI
                //dao_exists() function is a function of DAOFactory contract, it checks if the DAO is deleted or not
                //dao_exists() gives out an error if the daoAddress was never used to create a DAO
                let daoExists = false;
                await daoFactoryContract.methods
                    .dao_exists(daoAddress)
                    .call()
                    .then((result) => {
                        daoExists = result;
                    })
                    .catch((err) => {
                        setAlertMessage({text: err.message, title: "Error"});
                        setPopupTrigger(true);
                    });

                if (daoExists) {
                    let daoContract = new web3.eth.Contract(DAO_JSON['abi'], daoAddress);

                    await daoContract.methods
                        .dao_name()
                        .call()
                        .then((result) => {
                            daoName = result;
                        })
                        .catch((err) => {
                            setAlertMessage({text: err.message, title: "Error"});
                            setPopupTrigger(true);
                        });

                    await daoContract.methods
                        .dao_description()
                        .call()
                        .then((result) => {
                            daoDescription = result;
                        })
                        .catch((err) => {
                            setAlertMessage({text: err.message, title: "Error"});
                            setPopupTrigger(true);
                        });
                    allDaos.push([daoAddress, daoName, daoDescription]);
                }
            }
            setall_daos(allDaos);
            setLoaded(true);  //all the DAOs are fetched from the blockchain, so we set loaded to true
            return 0;
        };

        fetchAllDaos();
    }, [daoFactoryContract])


    return (
        <div>
            <Head>
                <title>DAO APP</title>
                <meta name="description" content="A blockchain dao app"/>
            </Head>
            <Header logged={account}/>
            <div className="index-page">
                {!loaded ? (
                    <Spinner></Spinner>
                ) : (
                    <SimpleGrid columns={2} spacing="40px">
                        {all_daos.map((dao, index) => {
                            return (
                                <Card
                                    index={index}
                                    key={index}
                                    address={`/dao?address=${dao[0]}`}
                                    title={String(dao[1]).concat(
                                        topDAOAddress === dao[0] ? " (top dao)" : ""
                                    )}
                                    text={dao[2]}
                                />
                            );
                        })}
                    </SimpleGrid>
                )}
            </div>
            <Popup trigger={popupTrigger} setTrigger={setPopupTrigger}>
                <h2 className="h2 text-black">{alertMessage.title}</h2>
                <p>{alertMessage.text}</p>
            </Popup>
        </div>
    );
}
