import React from 'react'
import styled from "styled-components"
import { useState, useEffect } from 'react'
import Spinner from '../src/components/Spinner'

const TextBoxProposal = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    font-size: 1.5em;
`;

const TextBoxDescription = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    font-size: 1.0em;
`;

const VoteOnProposals = ({onGetAllProposals, onVoteOnNormalProposals, onVoteOnWeightedProposals, _voterBalance}) => {

    const [all_props, setall_props]=useState([])
    const [loaded, setLoaded]=useState(false)
    const [amountOfVoterTokens, setamountOfVoterTokens] = useState(0)
    const [currAmountOfVotes, setcurrAmountOfVotes] = useState([])
    const [weights, setWeights] = useState([])

    useEffect(() => {
        const get_all_proposals = async () => {
            try {
                const proposals = await onGetAllProposals();
                const voterTokenBalance = _voterBalance;
                setamountOfVoterTokens(voterTokenBalance);
                setall_props(proposals);
                setcurrAmountOfVotes(setcurrVotesArrayInitialize(proposals));
                setWeights(setcurrWeightsInitialize(proposals, voterTokenBalance));
                setLoaded(true);
            } catch (err) {
                console.error(err.message);
            }
        }
        get_all_proposals();
    }, []);

    const setcurrVotesArrayInitialize = (x) => {
        let selectionInitializer = []
        for(var i = 0; i < x.length; i++){
            selectionInitializer.push([])
            for(var j = 0; j < x[i][i][1].length; j++){
                selectionInitializer[i].push(0)
            }
        }
        return selectionInitializer
    }

    const setcurrWeightsInitialize = (props, tokenamount) => {
        let weightsInitializer = []
        for(var i = 0; i < props.length; i++){
            weightsInitializer.push(tokenamount)
        }
        console.log(weightsInitializer)
        return weightsInitializer
    }

    const getTotalCount = (slctArray) => {
        let count = 0
        for(var i = 0; i < slctArray.length; i++){
            count += slctArray[i]
        }
        return count
    }

    return (
    <>
        {
            !loaded ?
            <Spinner></Spinner>
            :
            all_props.length===0 ?
            <div className='container'>
                <div className='row mt-5'>
                    <div className='text-center'>
                        <label className='text-black'>There is no proposal</label>
                    </div>
                </div>
            </div>
            :
            [0,1,2].map((i) => (
            <div key={i} className='col-xl-4 col-lg-6 col-md-6 col-sm-12 col-xs-12 text-black'>
                {
                    all_props.map((element, index) => (
                        index % 3 === i ?            
                            <div key={index} className='card bg-white border border-black text-black p-5 my-2'>
                                <TextBoxProposal>{element[index][0]}</TextBoxProposal><br/>
                                <TextBoxDescription>{element[index][6]}</TextBoxDescription><br/>
                                <label className='h6' style={{fontStyle:"italic"}}>Voting Power: {element[index][3]}</label><br/>
                                {
                                    element[index][1].map((item,indx2) => (
                                        <div key={indx2} className='row'> 
                                            <div className='col-4 col-sm-3'>
                                                <label htmlFor="html">{item}</label>
                                            </div>   
                                            <div className='col-8 col-sm-9'>
                                                <div className="input-group mb-3">
                                                    <div className="input-group-append">
                                                        <button type="button" className='btn btn-danger rounded-0' disabled={element[index][5] === true || currAmountOfVotes[index][indx2] === 0} onClick={() => {let selCopy = [...currAmountOfVotes]; selCopy[index][indx2] = selCopy[index][indx2] - 1; setcurrAmountOfVotes(selCopy)}}>-</button>
                                                    </div>
                                                    <input type="number" disabled={element[index][5] === true} className='text-center' style={{width:"50px", color:"white", backgroundColor:"black"}} id="html" name="fav_language" value={currAmountOfVotes[index][indx2]}/>
                                                    <div className="input-group-append">
                                                        <button type="button" className='btn btn-primary rounded-0' disabled={element[index][5] === true || getTotalCount(currAmountOfVotes[index]) == element[index][3]} onClick={() => {let selCopy = [...currAmountOfVotes]; selCopy[index][indx2] = selCopy[index][indx2] + 1; setcurrAmountOfVotes(selCopy)}}>+</button><br/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))    
                                }
                                <br/>
                                {      
                                element[index][4] === "weighted" ?           
                                <div  className='row'> 
                                    <div className='col-4 col-sm-3'>
                                        <label htmlFor="html">weight</label>
                                    </div>   
                                    <div className='col-8 col-sm-9'>
                                        <div className="input-group mb-3">
                                            <div className="input-group-append">
                                                <button type="button" className='btn btn-danger rounded-0' disabled={element[index][5] === true || weights[index] === 0} onClick={() => {let selCopy = [...weights]; selCopy[index] = selCopy[index] - 1; setWeights(selCopy)}}>-</button>
                                            </div>
                                            <input type="number" disabled={element[index][5] === true} className='text-center' style={{width:"50px", color:"white", backgroundColor:"black"}} id="html" name="fav_language" value={weights[index]}/>
                                            <div className="input-group-append">
                                                <button type="button" className='btn btn-primary rounded-0' disabled={element[index][5] === true || weights[index] === amountOfVoterTokens} onClick={() => {let selCopy = [...weights]; selCopy[index] = selCopy[index] + 1; setWeights(selCopy)}}>+</button><br/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                :
                                <></>
                                }
                                <br/>
                                <TextBoxDescription>{element[index][4].charAt(0).toUpperCase() + element[index][4].slice(1) + " proposal"}</TextBoxDescription>
                                <br/>
                                {
                                    element[index][5] === true ?
                                        <label className='h6'>You have already voted on this proposal</label>
                                    :
                                        <label className='h6'>Total Votes: {getTotalCount(currAmountOfVotes[index])}</label>
                                }
                                <br/>
                                <button disabled={element[index][5]} type="button" className='btn btn-primary btn-block' 
                                onClick={ () => { element[index][4] === "normal" ?
                                onVoteOnNormalProposals(index.toString(),element[index][1],currAmountOfVotes[index])
                                :
                                onVoteOnWeightedProposals(index.toString(),element[index][1],currAmountOfVotes[index],weights[index])
                                }}
                                > Vote </button>
                                <br/>
                            </div>
                        :
                        <></>
                    ))
                }
            </div>
        ))}
    </>
  )
}

export default VoteOnProposals