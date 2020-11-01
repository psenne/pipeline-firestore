import React, { useState, useEffect } from "react";
import NavBar from "../NavBar";
import PositionsToolbar from "./PositionsToolbar";
import PositionsTable from "./PositionsTable";
import { Loader, Dimmer } from "semantic-ui-react";
import { fbPositionsDB } from "../firebase.config";
import tmplPosition from "../constants/positionInfo";

async function getPositionInfo(fnState) {
    const data = await fbPositionsDB.orderBy("contract").get();
    const positions = data.docs.map(function (position) {
        var tmpitem = { key: position.id, info: { ...tmplPosition, ...position.data() } };
        return tmpitem;
    });
    fnState(positions);
}


export default function PositionsPage() {
    const [positions, updatePositions] = useState([]);
    const [searchTerm, setsearchTerm] = useState("");
    const [contractFilter, setContractFilter] = useState("");
    const [pageloading, setpageloading] = useState(false);
    const [contractsWithPositions, setcontractsWithPositions] = useState([]);

    useEffect(() => {
        getPositionInfo(updatePositions)
    }, []);
    
    useEffect(() => {
        setpageloading(!pageloading);        
    }, [positions])

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
