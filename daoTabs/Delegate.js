import React from "react";
import { useState, useRef } from "react";

const Delegate = ({
  onDelegateAllYK,
  onDelegateAllTokensFromAddressYK,
  onDelegateSomeTokensFromAddressYK,
  onDelegateAllVoter,
  onDelegateAllTokensFromAddressVoter,
  onDelegateSomeTokensFromAddressVoter,
}) => {
  const [delegateAllYK, setDelegateAllYK] = useState(false);
  const [delegateAllFromAddressYK, setDelegateAllFromAddressYK] =
    useState(false);
  const [delegateAllVoter, setDelegateAllVoter] = useState(false);
  const [delegateAllFromAddressVoter, setDelegateAllFromAddressVoter] =
    useState(false);
  const info = useRef({
    addressYK: "",
    addressVoter: "",
    amountVoter: 0,
    amountYK: 0,
  });
  return (
    <div className="text-black">
      <span className="title text-black" id="inputGroup-sizing-default">
        Delegate YK Tokens
      </span>
      <br />
      <br />
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          id="flexSwitchCheckDefault"
          onClick={() => {
            setDelegateAllYK(!delegateAllYK);
          }}
        />
        <label className="form-check-label" for="flexSwitchCheckDefault">
          Delegate From All Possible Addresses
        </label>
      </div>
      {!delegateAllYK && (
        <>
          <div className="mb-3">
            <label for="exampleInputEmail1" className="form-label">
              Wallet address
            </label>
            <input
              disabled={delegateAllYK}
              onChange={(e) => {
                info.current = { ...info.current, addressYK: e.target.value };
              }}
              type="email"
              className="form-control"
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
            />
            <div id="emailHelp" className="form-text text-black">
              Delegate YK Tokens From This Address
            </div>
          </div>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="flexSwitchCheckDefaultAmount"
              onClick={() => {
                setDelegateAllFromAddressYK(!delegateAllFromAddressYK);
              }}
            />
            <label className="form-check-label" for="flexSwitchCheckDefaultAmount">
              Delegate All of the Tokens
            </label>
          </div>
          {!delegateAllFromAddressYK && (
            <div className="mb-3">
              <label for="exampleInputEmail17" className="form-label">
                Number of Tokens to Delegate
              </label>
              <input
                disabled={delegateAllFromAddressYK}
                onChange={(e) => {
                  info.current = { ...info.current, amountYK: e.target.value };
                }}
                type="number"
                className="form-control"
                id="exampleInputEmail17"
                aria-describedby="emailHelp"
              />
              <div id="emailHelp12" className="form-text text-black">
                Delegate This Number of Tokens From This Address
              </div>
            </div>
          )}
        </>
      )}
      <br />
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {console.log()
          delegateAllYK
            ? onDelegateAllYK()
            : delegateAllFromAddressYK
            ? onDelegateAllTokensFromAddressYK(info.current.addressYK)
            : onDelegateSomeTokensFromAddressYK(
                info.current.addressYK,
                info.current.amountYK
              );
        }}
      >
        Delegate YK Tokens
      </button>
      <br />
      <br />
      <br />
      
      <span className="title text-black" id="inputGroup-sizing-default">
        Delegate Voter Tokens
      </span>
      <br />
      <br />
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          id="flexSwitchCheckDefault22"
          onClick={() => {
            setDelegateAllVoter(!delegateAllVoter);
          }}
        />
        <label className="form-check-label" for="flexSwitchCheckDefault22">
          Delegate From All Possible Addresses
        </label>
      </div>
      {!delegateAllVoter && (
        <>
          <div className="mb-3">
            <label for="exampleInputEmail1asad" className="form-label">
              Wallet address
            </label>
            <input
              disabled={delegateAllVoter}
              onChange={(e) => {
                info.current = { ...info.current, addressVoter: e.target.value};
              }}
              type="email"
              className="form-control"
              id="exampleInputEmail1asad"
              aria-describedby="emailHelp"
            />
            <div id="emailHelp" className="form-text text-black">
              Delegate Voter Tokens From This Address
            </div>
          </div>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="flexSwitchCheckDefaultAmount2asaa"
              onClick={() => {
                setDelegateAllFromAddressVoter(!delegateAllFromAddressVoter);
              }}
            />
            <label className="form-check-label" for="flexSwitchCheckDefaultAmount2">
              Delegate All of the Tokens
            </label>
          </div>
          {!delegateAllFromAddressVoter && (
            <div className="mb-3">
              <label for="exampleInputEmail2xc" className="form-label">
                Number of Tokens to Delegate
              </label>
              <input
                disabled={delegateAllFromAddressVoter}
                onChange={(e) => { info.current = { ...info.current, amountVoter: e.target.value}; }}
                type="email"
                className="form-control"
                id="exampleInputEmail2xc"
                aria-describedby="emailHelp"
              />
              <div id="emailHelp" className="form-text text-black">
                Delegate This Number of Tokens From This Address
              </div>
            </div>
          )}
        </>
      )}

      <br />
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {console.log(info.current.addressVoter); console.log(info.current.amountVoter);
          delegateAllVoter
            ? onDelegateAllVoter()
            : delegateAllFromAddressVoter
            ? onDelegateAllTokensFromAddressVoter(info.current.addressVoter)
            : onDelegateSomeTokensFromAddressVoter(
                info.current.addressVoter,
                info.current.amountVoter
              );
        }}
      >
        Delegate Voter Tokens
      </button>
      <br />
      <br />
    </div>
  );
};

export default Delegate;
