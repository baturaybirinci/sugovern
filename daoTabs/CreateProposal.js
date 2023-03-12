import React from 'react'
import { useState, useRef } from 'react'

const CreateProposal = ({onCreateProposal}) => {
    const [inputList, setInputList] = useState([]);
    const [type, setType] = useState(0);
    const proposal = useRef({text: "", desc: "", options: [], voting_power: 0});
  return (
    <>
    <div className='col-2'></div>
    <div className='col-8 border border-dark text-black p-5'>
        <h2 className='title text-black'><u>CREATE NEW PROPOSAL</u></h2>
        <form>
            <label>Proposal Title: </label>
            <br/>
            <textarea onChange={(e) => {{proposal.current = {...proposal.current, text: e.target.value}}}} style={{width:"80%", padding:"5px"}}/>
            <br/><br/>
            <label>Proposal Description: </label>
            <br/>
            <textarea onChange={(e) => {{proposal.current = {...proposal.current, desc: e.target.value}}}} style={{width:"80%", padding:"5px"}}/>
            <br/><br/>
            <button type="button" className='btn btn-secondary rounded-0' onClick={() => {let optionValues = proposal.current.options; optionValues.push(""); proposal.current = {...proposal.current, options: optionValues}; setInputList(inputList.concat(<div key={inputList.length}><br/><label>Option {inputList.length + 1}: </label><input required onChange={(e) => {let optionValues = proposal.current.options; optionValues[inputList.length] = e.target.value; proposal.current = {...proposal.current, options: optionValues}}} /></div>))}}>Add New Option</button>
            {inputList}
            <br/>
            {
                inputList.length === 0 ?
                <></>
                :
                <button type="button" className='btn btn-danger rounded-0' onClick={() => {let optionValues = proposal.current.options; optionValues.pop(); proposal.current.current = {...proposal.current, options: optionValues}; var slicedList = inputList.slice(0, inputList.length-1); setInputList(slicedList)}}>Remove Last Option</button>
            }
            <br/><br/>
            <label>Voting Power: </label>
            <input type="number" onChange={(e) => {proposal.current = {...proposal.current, voting_power: e.target.value}}}/>
            <br/><br/>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="flexSwitchCheckType"
                onClick={() => {
                  setType(type === 0 ? 1 : 0);
                }}
              />
              <label className="form-check-label" for="flexSwitchCheckType">
                {
                  type === 0 ?
                  "Proposal Type: Normal"
                  :
                  "Proposal Type: Weighted"
                }
              </label>
            </div>
            <br/>
            <br/>
            <button type="button" className='btn btn-primary rounded-0' onClick={() => {onCreateProposal(proposal.current.text, proposal.current.desc, proposal.current.options, proposal.current.voting_power, type);}}>Create This Proposal</button>
        </form>
    </div>
    </>
  )
}

export default CreateProposal