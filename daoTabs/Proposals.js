import React, {useEffect} from "react"
import PieChart from "../src/components/PieChart"
import BarChart from "../src/components/BarChart"
import {useState} from "react"
import Spinner from "../src/components/Spinner"
import styled from "styled-components"

const TextBoxProposal = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  font-size: 1em;
`

const Proposals = ({onGetAllProposals}) => {
    const [all_proposals, setall_proposals] = useState([])
    const [loaded, setLoaded] = useState(false)
    const [isCollapsed, setCollapsed] = useState([])
    useEffect(() => {
        const get_all_proposals = async () => {
            try {
                const all_props = await onGetAllProposals()
                setall_proposals(all_props)
                const collapseList = new Array(all_props.length).fill(true)
                setCollapsed(collapseList)
                setLoaded(true)
            } catch (err) {
                console.error(err.message)
            }
        }
        get_all_proposals()
    }, [])
    const changeCollapse = (index) => {
        const newArray = [...isCollapsed]; // Create a copy of the array
        newArray[index] = !newArray[index]; // Update the element at the desired index
        setCollapsed(newArray);
    }
    const proposalCard = (element, index) => {
        console.log(isCollapsed)
        return <>
            <div
                key={index}
                className="col-12 border border-black text-black p-5 mt-5"
            >
                <div className="row">
                    <div className="col-md">
                        <label className="h4">{element[index][0]}</label>
                        <br/>
                        <br/>
                    </div>
                    <div className="col-md float-md-right">
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => changeCollapse(index)}
                        >
                            Collapse
                        </button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <TextBoxProposal>{element[index][6]}</TextBoxProposal>
                        <br/>
                        <br/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-xs-12">
                        <label>
                            {element[index][4].charAt(0).toUpperCase() +
                                element[index][4].slice(1)}{" "}
                            proposal
                        </label>
                        <br/>
                        <br/>
                        <p>Voting Power: {element[index][3]}</p>
                        <br/>
                        <p>Options:</p>
                        <br/>
                        {element[index][1].map((item, keyIndex) => (
                            <div key={keyIndex}>
                                <label htmlFor="html">
                                    {keyIndex +
                                        1 +
                                        ")  " +
                                        item +
                                        "    (" +
                                        element[index][2][keyIndex] +
                                        " votes)"}
                                </label>
                                <br/>
                            </div>
                        ))}
                    </div>
                    <div className="col-xl-3 col-lg-3 col-md-5 col-sm-8 col-xs-8">
                        <PieChart
                            chartData={{
                                labels: element[index][1],
                                datasets: [
                                    {
                                        label: "Votes",
                                        data: element[index][2],
                                        backgroundColor: [
                                            "rgba(75,192,192,1)",
                                            "#ecf0f1",
                                            "#50AF95",
                                            "#f3ba2f",
                                            "#2a71d0",
                                        ],
                                        borderColor: "black",
                                        borderWidth: 1,
                                    },
                                ],
                            }}
                        ></PieChart>
                    </div>
                    <div className="col-xl-5 col-lg-3 col-md-6 col-sm-12 col-xs-12">
                        <BarChart
                            chartData={{
                                labels: element[index][1],
                                datasets: [
                                    {
                                        label: "Votes",
                                        data: element[index][2],
                                        backgroundColor: [
                                            "rgba(75,192,192,1)",
                                            "#ecf0f1",
                                            "#50AF95",
                                            "#f3ba2f",
                                            "#2a71d0",
                                        ],
                                        borderColor: "black",
                                        borderWidth: 1,
                                    },
                                ],
                            }}
                        ></BarChart>
                    </div>
                </div>
            </div>

        </>
    }

    const collapsedProposalCard = (element, index) => {
        return <>
            <div style={{display: 'flex'}}>
                <div>
                    <div>{element[index][0]}</div>
                    <div className="col-md float-md-right">
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => changeCollapse(index)}
                        >
                            Collapse
                        </button>
                    </div>

                </div>
                <div><PieChart
                    chartData={{
                        labels: element[index][1],
                        datasets: [
                            {
                                label: "Votes",
                                data: element[index][2],
                                backgroundColor: [
                                    "rgba(75,192,192,1)",
                                    "#ecf0f1",
                                    "#50AF95",
                                    "#f3ba2f",
                                    "#2a71d0",
                                ],
                                borderColor: "black",
                                borderWidth: 1,
                            },
                        ],
                    }}
                ></PieChart>
                </div>
            </div>

        </>
    }
    return !loaded ? (
        <Spinner></Spinner>
    ) : all_proposals.length === 0 ? (
        <div className="container">
            <div className="row mt-5">
                <div className="col-12 text-center">
                    <label className="text-dark">There is no proposal</label>
                </div>
            </div>
        </div>
    ) : (
        <div >
            {all_proposals.map((element, index) => (
                (isCollapsed[index] ? collapsedProposalCard(element, index) : proposalCard(element, index))
            ))}
        </div>
    )
}

export default Proposals
