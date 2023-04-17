import React from 'react'
import { useRef } from "react";

const TransferTokens = ({onTransferVoterTokens, onTransferYKTokens}) => {
    const info = useRef({addressYK: "", amountYK: 0, addressVoter: "", amountVoter: 0});
    return (
    <div className="row my-2">
        <div className="row my-4">
            <span className="title text-black" id="inputGroup-sizing-default">Transfer YK Tokens to Address</span>
            <div className="form-group col-md-8">
                <label for="addressBox" className='text-black'>Address</label>
                <input type="text" id="addressBox" className="form-control" onChange={(e) => {info.current = {...info.current, addressYK: e.target.value}}} aria-label="Default" aria-describedby="inputGroup-sizing-default"/>
            </div>
            <br/><br/>
            <div className="form-group col-md-4">
                <label for="tokenBox" className='text-black'>Number of Tokens: </label>
                <input type="number" id="tokenBox" className="form-control" onChange={(e) => {info.current = {...info.current, amountYK: e.target.value}}}/>
            </div>
            <br/><br/><br/><br/>
            <div className='col-xl-4 col-lg-3 col-md-2 col-sm-1 col-xs-0'></div>
            <div className='col-xl-4 col-lg-6 col-md-8 col-sm-10 col-xs-12'>
                <button type="button" className='btn btn-primary rounded' onClick={() => {console.log(info.current["addressYK"]); console.log(info.current["amountYK"]); onTransferYKTokens(info.current["addressYK"], parseInt(info.current["amountYK"]))}}>Send Tokens</button>
            </div>
            <div className='col-xl-4 col-lg-3 col-md-2 col-sm-1 col-xs-0'></div>
        </div>
        <br/><br/><br/><br/>
        
        <div className="row my-4">
            <span className="title text-black" id="inputGroup-sizing-default">Transfer Voter Tokens to Address</span>
            <div className="form-group col-md-8">
                <label for="addressBox" className='text-black'>Address</label>
                <input type="text" id="addressBox" className="form-control" onChange={(e) => {info.current = {...info.current, addressVoter: e.target.value}}} aria-label="Default" aria-describedby="inputGroup-sizing-default"/>
            </div>
            <br/><br/>
            <div className="form-group col-md-4">
                <label for="tokenBox" className='text-black'>Number of Tokens: </label>
                <input type="number" id="tokenBox" className="form-control" onChange={(e) => {info.current = {...info.current, amountVoter: e.target.value}}}/>
            </div>
            <br/><br/><br/><br/>
            <div className='col-xl-4 col-lg-3 col-md-2 col-sm-1 col-xs-0'></div>
            <div className='col-xl-4 col-lg-6 col-md-8 col-sm-10 col-xs-12'>
                <button type="button" className='btn btn-primary rounded' onClick={() => {console.log(info.current["addressVoter"]); console.log(info.current["amountVoter"]);onTransferVoterTokens(info.current["addressVoter"], parseInt(info.current["amountVoter"]))}}>Send Tokens</button>
            </div>
            <div className='col-xl-4 col-lg-3 col-md-2 col-sm-1 col-xs-0'></div>
        </div>
    </div>
    )
}

export default TransferTokens