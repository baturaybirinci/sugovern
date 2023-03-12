import React from 'react';
import { useRef } from "react";

const SendVoterToken = ({onSendTokens}) => {
    const info = useRef({address: "", amount: 0});
    return (
    <>
        <span className="title text-black" id="inputGroup-sizing-default">Send Tokens to Address</span>
        <div className="form-group col-md-8">
            <label for="addressBox" className='text-black'>Address</label>
            <input type="text" onChange={(e) => {info.current = {...info.current, address: e.target.value}}} className="form-control" aria-label="Default" aria-describedby="inputGroup-sizing-default"/>
        </div>
        <br/><br/>
        <div className="form-group col-md-4">
            <label className='text-black'>Number of Tokens: </label>
            <input type="number" className="form-control" onChange={(e) => {info.current = {...info.current, amount: e.target.value}}}/>
        </div>
        <br/><br/><br/><br/>
        <div className='col-xl-4 col-lg-3 col-md-2 col-sm-1 col-xs-0'></div>
        <div className='col-xl-4 col-lg-6 col-md-8 col-sm-10 col-xs-12'>
            <button type="button" className='btn btn-primary rounded' onClick={() => {onSendTokens(info.current["address"], parseInt(info.current["amount"]))}}>Send Tokens</button>
        </div>
        <div className='col-xl-4 col-lg-3 col-md-2 col-sm-1 col-xs-0'></div>
    </>
  )
}

export default SendVoterToken