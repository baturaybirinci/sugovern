import React from 'react'
import { useRef } from "react";

const CreateChildDAO = ({onCreateChildDAO}) => {
    const daoInfo = useRef({name: "", desc: "", YKTokenName: "", YKTokenSymbol: "", voterTokenName: "", voterTokenSymbol: ""});
    return (
    <div className='container border border-black p-4'>
        <h3 className='h3 text-black text-center'>Create a SubDAO</h3>
        <br/><br/>
        <form>
            <div className="form-group">
                <label htmlFor="exampleInputDAOName" className='text-dark'>DAO Name</label>
                <input type="name" onChange={(e) => {{daoInfo.current = {...daoInfo.current, name: e.target.value}}}} className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter DAO Name"/>
            </div>  
            <br/>
            <div className="form-group">
                <label htmlFor="exampleInputDAODesc" className='text-dark'>DAO Description</label>
                <textarea type="name" onChange={(e) => {{daoInfo.current = {...daoInfo.current, desc: e.target.value}}}} className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter DAO Description"/>
            </div>  
            <br/>
            <div className="form-group">
                <label htmlFor="exampleInputYKName" className='text-dark'>YK Token Name</label>
                <input type="name" onChange={(e) => {{daoInfo.current = {...daoInfo.current, YKTokenName: e.target.value}}}} className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter YK Token Name"/>
            </div>  
            <br/>
            <div className="form-group">
                <label htmlFor="exampleInputYKSymbol" className='text-dark'>YK Token Symbol</label>
                <input type="name" onChange={(e) => {{daoInfo.current = {...daoInfo.current, YKTokenSymbol: e.target.value}}}} className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter YK Token Symbol"/>
            </div>  
            <br/>
            <div className="form-group">
                <label htmlFor="exampleInputVTName" className='text-dark'>Voter Token Name</label>
                <input type="name" onChange={(e) => {{daoInfo.current = {...daoInfo.current, voterTokenName: e.target.value}}}} className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter Voter Token Name"/>
            </div>  
            <br/>
            <div className="form-group">
                <label htmlFor="exampleInputVTSymbol" className='text-dark'>Voter Token Symbol</label>
                <input type="name" onChange={(e) => {{daoInfo.current = {...daoInfo.current, voterTokenSymbol: e.target.value}}}} className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter Voter Token Symbol"/>
            </div>  
            <br/><br/>
            <button type="button" onClick={() => { onCreateChildDAO(daoInfo.current["name"], daoInfo.current["desc"], daoInfo.current["YKTokenName"], daoInfo.current["YKTokenSymbol"], daoInfo.current["voterTokenName"], daoInfo.current["voterTokenSymbol"])}} className="btn btn-primary">Submit</button>
        </form>
    </div>
  )
}

export default CreateChildDAO