import React, { useEffect } from "react";
import { useState } from "react";
import Spinner from "../src/components/Spinner";



const ViewSubDAOs = ({
  onGetSubDAOs,
  onGetParentDAO,
  onGetDAODescription,
  onGetDAOName,
  onGetDAOImage
}) => {
  const [subDAOs, setSubDAOs] = useState([]);
  const [parentDAO, setParentDAO] = useState("");
  const [loadedParent, setLoadedParent] = useState(false);
  const [loadedSubs, setLoadedSubs] = useState(false);

  useEffect(() => {
    const fetchSubDAOs = async () => {
      var subDAOAddresses = await onGetSubDAOs();
      if (subDAOAddresses.length === 0) {
        setLoadedSubs(true);
      } else {
        let daos = [];
        for(var i = 0; i < subDAOAddresses.length; i++){
          let daoInfo = {
            address: subDAOAddresses[i],
            name: await onGetDAOName(subDAOAddresses[i]),
            description: await onGetDAODescription(subDAOAddresses[i]),
            image: await onGetDAOImage(subDAOAddresses[i]),
          }
          daos.push(daoInfo);
        }
        setSubDAOs(daos);
        setLoadedSubs(true);
      }
    };
    const fetchParentDAO = async () => {
      var parentDAOAddress = await onGetParentDAO();
      if (parentDAOAddress === "0x0000000000000000000000000000000000000000") {
        setParentDAO({
          address: "0x0000000000000000000000000000000000000000",
          name: "    ",
          description: "    ",
        });
        setLoadedParent(true);
      } else {
        let daoInfo = {
          address: parentDAOAddress,
          name: await onGetDAOName(parentDAOAddress),
          description: await onGetDAODescription(parentDAOAddress),
          image: await onGetDAOImage(parentDAOAddress),
        };
        setParentDAO(daoInfo);
        setLoadedParent(true);
      }
    };
    fetchSubDAOs();
    fetchParentDAO();
  }, []);

  const loaded = () => {
    return loadedParent && loadedSubs;
  };

  return !loaded() ? (
    <Spinner></Spinner>
  ) : (
    <div className="container">
      <div className="row mx-2">
        <div className="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6 my-2">
          {parentDAO["address"] === "0x0000000000000000000000000000000000000000" ? 
          (
            <label className="text-dark my-2">There is no parent DAO</label>
          ) : 
          (
            <div className="col-xl-8 col-lg-8 col-md-10 col-sm-12 col-xs-12 my-2">
              <div className="mx-2">
                <label className="text-dark">PARENT DAO</label>
                <a
                  href={`/dao?address=${parentDAO["address"]}`}
                  className="container"
                >
                  <div className="card text-black bg-light my-2">
                    <div className="card-header">
                      <div className="container p-3">
                        <img
                          className="card-img-top "
                          src={parentDAO["image"]}
                          alt="Card image cap"
                        />
                      </div>
                    </div>
                    <div className="card-body">
                      <h5 className="card-title text-black">{parentDAO["name"]}</h5>
                      <p className="card-text">{parentDAO["description"]}</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>
        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-6 my-2">
          {subDAOs.length === 0 ? (
            <label className="text-dark">There is no sub DAO</label>
          ) : (
            <div className="row mx-2">
              <label className="text-dark">SUB DAOs</label>
              {subDAOs.map((dao, index) => (
                <div
                  key={index}
                  className={
                    subDAOs.length === 1 || subDAOs.length === 2
                      ? "col-xl-6 col-lg-8 col-md-8 col-sm-12 col-xs-12"
                      : "col-xl-4 col-lg-6 col-md-6 col-sm-12 col-xs-12"
                  }
                >
                  {console.log(dao["address"])}
                  <a
                    href={`/dao?address=${dao["address"]}`}
                    className="container"
                  >
                    <div className="card text-black bg-light">
                      <div className="card-header">
                        <div className="container p-3">
                          <img
                            className="card-img-top"
                            src={dao["image"]}
                            alt="Card image cap"
                          />
                        </div>
                      </div>
                      <div className="card-body">
                        <h5 className="card-title text-black">{dao["name"]}</h5>
                        <p className="card-text">{dao["description"]}</p>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewSubDAOs;
