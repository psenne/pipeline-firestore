import React, { useState, useEffect } from "react";
import NavBar from "../NavBar";
import PositionsToolbar from "./PositionsToolbar";
import PositionsTable from "./PositionsTable";
import { Loader, Dimmer } from "semantic-ui-react";
import { fbPositionsDB } from "../firebase.config";
import tmplPosition from "../constants/positionInfo";

async function getPositionIDs(fnState) {
    const data = await fbPositionsDB.orderBy("contract").get();
    const positions = data.docs.map(function (position) {
        var tmpitem = { key: position.id, submitted_candidates: [], info: { ...tmplPosition, ...position.data() } };
        // GetSubmissions(position.id, subs => {
        //     tmpitem["submitted_candidates"] = subs;
        // });
        return tmpitem;
    });
    fnState(positions);
    return data;
}

async function GetSubmissions(pid, callback) {
    const candidates = await fbPositionsDB.doc(pid).collection("submitted_candidates").get();
    const subs = candidates.docs.map(candidate => {
        return { key: candidate.id, info: candidate.data() };
    });
    callback(subs);
    return candidates;
}


export default function PositionsPage() {
    const [positions, updatePositions] = useState([]);
    const [searchTerm, setsearchTerm] = useState("");
    const [contractFilter, setContractFilter] = useState("");
    const [pageloading, setpageloading] = useState(false);
    const [contractsWithPositions, setcontractsWithPositions] = useState([]);

    useEffect(() => {
        getPositionIDs(updatePositions);
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
