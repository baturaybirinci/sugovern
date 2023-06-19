import {DAO_JSON, RPC} from "../../constant";
import Web3 from "web3";
import { useEffect, useState } from "react"
function Card({ address,key }) {
  // dao?address=
  const [imageUrl, setImageUrl] = useState(null)
  const [title, setTitle] = useState(null)
  const [text, setText] = useState(null)
  const web3 = new Web3(RPC);
  const daoContract = new web3.eth.Contract(DAO_JSON['abi'], address);

  const getName = async () => {
    await daoContract.methods
      .dao_name()
      .call()
      .then((result) => setTitle(result))
  }
  const getDesctiprion = async () => {
    await daoContract.methods
      .dao_description()
      .call()
      .then((result) => setText(result))
  }
  const getImageUrl = async () => {
    await daoContract.methods
      .imageUrl()
      .call()
      .then((result) => setImageUrl(result))
  }
  useEffect(() => {
    getName()
    getDesctiprion()
    getImageUrl()
  },[])
  return (
    <a href={`dao?address=${address}`}>
      {/* className="item-card-link"  */}
      <div key={key} style={{ cursor: "pointer" }}>
        <div className="item-card">
          <div style={{margin:'auto',minHeight:'15vh',display:"flex"}}>
            <img
              src={imageUrl}
              alt=""
              style={{ width: "100%", height: "%100", objectFit: "fill", margin:'auto' }}
            />
          </div>
          <div className="card-text">
            <h3 className="card-title">{title}</h3>
            <p className="card-desc">{text}</p>
          </div>
        </div>
      </div>
    </a>
  )
}
export default Card
