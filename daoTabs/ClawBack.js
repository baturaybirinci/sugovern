import React from "react";
import { useState, useRef } from "react";

const ClawBack = ({
  onClawBackYKFromAll,
  onClawBackYKFromSingleAddress,
  onClawBackVoterFromAll,
  onClawBackVoterFromSingleAddress,
}) => {
  const [clawBackAllYK, setClawBackAllYK] = useState(false);
  const [clawBackAllVoter, setClawBackAllVoter] = useState(false);
  const info = useRef({ addressYK: "", addressVoter: "" });
  return (
    <div className="text-black">
      <span className="title text-black" id="inputGroup-sizing-default">
        Clawback YK Tokens
      </span>
      <br /><br />
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          id="flexSwitchCheckDefault"
          onClick={() => {
            setClawBackAllYK(!clawBackAllYK);
          }}
        />
        <label className="form-check-label" for="flexSwitchCheckDefault">
          ClawBack From All Possible Addresses
        </label>
      </div>
      {!clawBackAllYK && (
        <div className="mb-3">
          <label for="exampleInputEmail1" className="form-label">
            Wallet address
          </label>
          <input
            disabled={clawBackAllYK}
            onChange={(e) => {
              info.current = { ...info.current, addressYK: e.target.value };
            }}
            type="email"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
          />
          <div id="emailHelp" className="form-text text-black">
            ClawBack YK Tokens From This Address
          </div>
        </div>
      )}
      <br/>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          clawBackAllYK
            ? onClawBackYKFromAll()
            : onClawBackYKFromSingleAddress(info.current.addressYK);
        }}
      >
        ClawBack YK Tokens
      </button>
      <br />
      <br />
      <br />

      <span className="title text-black" id="inputGroup-sizing-default">
        Clawback Voter Tokens
      </span>
      <br /><br />
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          id="flexSwitchCheckDefault2"
          onClick={() => {
            setClawBackAllVoter(!clawBackAllVoter);
          }}
        />
        <label className="form-check-label" for="flexSwitchCheckDefault2">
          ClawBack From All Possible Addresses
        </label>
      </div>
      {!clawBackAllVoter && (
        <div className="mb-3">
          <label for="exampleInputEmail1" className="form-label">
            Wallet address
          </label>
          <input
            disabled={clawBackAllVoter}
            onChange={(e) => {
              info.current = { ...info.current, addressVoter: e.target.value };
            }}
            type="email"
            className="form-control"
            id="exampleInputEmail2"
            aria-describedby="emailHelp"
          />
          <div id="emailHelp" className="form-text text-black">
            ClawBack Voter Tokens From This Address
          </div>
        </div>
      )}
      <br/>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          clawBackAllVoter
            ? onClawBackVoterFromAll()
            : onClawBackVoterFromSingleAddress(info.current.addressVoter);
        }}
      >
        ClawBack Voter Tokens
      </button>
      <br />
      <br />
      <br />
    </div>
  );
};

export default ClawBack;
