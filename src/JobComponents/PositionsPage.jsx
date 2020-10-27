import React, { useState, useEffect } from "react";
import NavBar from "../NavBar";
import PositionsToolbar from "./PositionsToolbar";
import PositionsTable from "./PositionsTable";
import { Loader, Dimmer } from "semantic-ui-react";
import { fbPositionsDB } from "../firebase.config";
import tmplPosition from "../constants/positionInfo";

export default function PositionsPage() {
    const [positions, updatePositions] = useState([]);
    const [searchTerm, setsearchTerm] = useState("");
    const [contractFilter, setContractFilter] = useState("");
    const [pageloading, setpageloading] = useState(false);
    const [contractsWithPositions, setcontractsWithPositions] = useState([]);

    useEffect(() => {
        setpageloading(true);
        const getPositions = fbPositionsDB.orderBy("contract").onSnapshot(data => {
            let tmpitems = [];
            data.forEach(function(position) {
                var positionInfo = { "key": position.id, "submitted_candidates":[], "info": {...tmplPosition, ...position.data()} };
                tmpitems.push(positionInfo);

                //add subcollection for submitted candidates, then update the state
                position.ref.collection("submitted_candidates").get().then(candidates => {
                    candidates.forEach(candidate =>{
                        positionInfo["submitted_candidates"].push({"key":candidate.id, "info": candidate.data()})
                    });
                    updatePositions(tmpitems);
                });
            });
            setcontractsWithPositions([...new Set(tmpitems.map(item => item.info.contract))]); //send to contract dropdown to show only those contracts that have positions listed.
            setpageloading(false);
        });
        return () => getPositions();
    }, []);

    const searchPositions = ev => {
        setsearchTerm(ev.currentTarget.value);
    };

    const HandleContractChange = value => {
        setContractFilter(value);
    };

    return (
        <div>
            <Dimmer active={pageloading}>
                <Loader>Loading positions...</Loader>
            </Dimmer>
            <NavBar active="positions" />
            <PositionsToolbar positions={positions} searchPositions={searchPositions} selectedContract={contractFilter} contracts={contractsWithPositions} HandleContractChange={HandleContractChange} />
            <PositionsTable positions={positions} searchTerm={searchTerm} contractFilter={contractFilter} />
        </div>
    );
}
