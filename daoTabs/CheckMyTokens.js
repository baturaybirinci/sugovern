import React from "react";
import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";

const CheckMyTokens = ({ onCheckYKBalance, onCheckVoterBalance }) => {
  const [voterBalance, setVoterBalance] = useState(-1);
  const [ykBalance, setYKBalance] = useState(-1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchBalances = async () => {
      setVoterBalance(await onCheckVoterBalance());
      setYKBalance(await onCheckYKBalance());
      setLoaded(true);
    };
    fetchBalances();
  }, []);

  return !loaded ? (
    <Spinner></Spinner>
  ) : (
    <div className="container m-3 text-center">
      <br/>
      <label className="text-black">
        Voter Balance: {voterBalance} Token
      </label>
      <br />
      <br />
      <label className="text-black">
        YK Balance: {ykBalance} Token
      </label>
    </div>
  );
};

export default CheckMyTokens;
