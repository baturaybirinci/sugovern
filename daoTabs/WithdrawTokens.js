import React, { useEffect } from "react"
import { useRef, useState } from "react"
import Spinner from "../src/components/Spinner"

const WithdrawTokens = ({
  onVoterSharesToBeGiven,
  onYKSharesToBeGiven,
  onWithdrawVoterTokens,
  onWithdrawYKTokens,
}) => {
  const info = useRef({ amount1: 0, amount2: 0 })
  const [voterShares, setVoterShares] = useState(-1)
  const [ykShares, setYKShares] = useState(-1)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const fetchVoterShares = async () => {
      setVoterShares(await onVoterSharesToBeGiven())
      setYKShares(await onYKSharesToBeGiven())
      setLoaded(true)
    }
    fetchVoterShares()
  }, [])

  return !loaded ? (
    <Spinner></Spinner>
  ) : (
    <div className="justify-content-center">
      <br />
      <br />
      <div className="row">
        <div className="col-6">
          <span className="title text-black" id="inputGroup-sizing-default">
            Withdraw YK Tokens
          </span>
          <br />
          <br />
          <label className="text-black">Withdrawable Amount: {ykShares}</label>
          <br />
          <br />
          <div className="input-group mb-3">
            <label className="text-black" style={{ marginRight: "5px" }}>
              Number of Tokens:{" "}
            </label>
            <input
              type="number"
              onChange={(e) => {
                info.current = { ...info.current, amount1: e.target.value }
              }}
            />
            <button
              disabled={ykShares === 0}
              type="button"
              className="btn btn-primary rounded-0"
              onClick={() => {
                onWithdrawYKTokens(parseInt(info.current["amount1"]))
              }}
            >
              Withdraw Tokens
            </button>
          </div>
        </div>
        <div className="col-6">
          <span
            className="title text-black mt-5"
            id="inputGroup-sizing-default"
          >
            Withdraw Voter Tokens
          </span>
          <br />
          <br />
          <label className="text-black">
            Withdrawable Amount: {voterShares}
          </label>
          <br />
          <br />
          <div className="input-group mb-3">
            <label className="text-black" style={{ marginRight: "5px" }}>
              Number of Tokens:{" "}
            </label>
            <input
              type="number"
              onChange={(e) => {
                info.current = { ...info.current, amount2: e.target.value }
              }}
            />
            <button
              disabled={voterShares === 0}
              type="button"
              className="btn btn-primary rounded-0"
              onClick={() => {
                onWithdrawVoterTokens(parseInt(info.current["amount2"]))
              }}
            >
              Withdraw Tokens
            </button>
          </div>
        </div>
      </div>
      <br />
      <br />
    </div>
  )
}

export default WithdrawTokens
