import React from "react";
import { useState, useEffect } from "react";
import Spinner from "@/components/Spinner";
const CheckMyTokens = ({ _ykBalance, _voterBalance }) => {
    return    <div className="container m-3 text-center">
      <br/>
      <label className="text-black">
        Voter Balance: {_voterBalance} Token
      </label>
      <br />
      <br />
      <label className="text-black">
        YK Balance: {_ykBalance} Token
      </label>
    </div>

};

export default CheckMyTokens;
