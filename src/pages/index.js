import Head from "next/head"
import Image from "next/image"
import styles from "@/styles/Home.module.css"
import {
  BindContract,
  WalletConnect,
  DaoIsExist,
  fetchNextDaoId,
  fetchAllDaos,
  NetworkControl,
} from "@/helpers/UserHelper"
import { useEffect, useState } from "react"
import Header from "@/components/Header"
import Card from "@/components/Card"
import { SimpleGrid, Spinner } from "@chakra-ui/react"
import Popup from "@/components/Popup"
import Web3 from "web3"
import {
  DAO_ADDRESS,
  DAO_JSON,
  FACTORY_JSON,
  CHAIN_ID,
  TOKEN_ADDRESS,
} from "../../constant"

export default function Home() {
  const [account, setAccount] = useState(null)
  const [alertMessage, setAlertMessage] = useState({ text: "", title: "" }) //this is used inside Popup component, to pass a message to the inside of the popup when an error occurs, or a transaction is successful, or in a case of warning
  const [popupTrigger, setPopupTrigger] = useState(false) //this is used inside Popup component, to trigger the popup to show up
  const [daoFactoryContract, setDaoFactoryContract] = useState(undefined) //to store the DAOFactory contract instance
  const [all_daos, setall_daos] = useState([]) //to store all the DAOs created by the DAOFactory contract
  const [topDAOAddress, setTopDAOAddress] = useState("") //to store the address of the top DAO
  const [isCorrect, setIsCorrect] = useState(false) //this is used to change between the tabs, we will set it when a user clicks on the buttons on the sidebar, in default it is set to 10, which is the view proposals tab
  const [inp, setInp] = useState(
    "https://avatars.githubusercontent.com/u/48164025?v=4"
  ) //this is used to change between the tabs, we will set it when a user clicks on the buttons on the sidebar, in default it is set to 10, which is the view proposals tab
  const [loaded, setLoaded] = useState(false) //to check if the page is loaded, i.e. all the DAOs are fetched from the blockchain

  useEffect(() => {
    if (!loaded) {
      WalletConnect().then((res) => {
        setAccount(res)
      })
      if (!daoFactoryContract) {
        setDaoFactoryContract(BindContract(FACTORY_JSON["abi"], DAO_ADDRESS))
      } else {
        let res
        if (all_daos.length === 0) {
          fetchAllDaos(daoFactoryContract).then((result) => setall_daos(result))
        } else {
          setLoaded(true)
        }
      }
    }
  }, [daoFactoryContract, all_daos, loaded])

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(e.target[0].value)
    setInp(e.target[0].value)
  }

  return (
    <div>
      <Head>
        <title>DAO APP</title>
        <meta name="description" content="A blockchain dao app" />
      </Head>
      <Header logged={account} />
      <div className="index-page">
        {!loaded ? (
          <Spinner></Spinner>
        ) : (
          <SimpleGrid columns={1} spacing="40px">
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
              )
            })}
          </SimpleGrid>
        )}
      </div>
      <Popup trigger={popupTrigger} setTrigger={setPopupTrigger}>
        <h2 className="h2 text-black">{alertMessage.title}</h2>
        <p>{alertMessage.text}</p>
      </Popup>
    </div>
  )
}
