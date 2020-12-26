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
        var unsub = fbPositionsDB
            .orderBy("contract")
            .orderBy("position_id")
            .onSnapshot(data => {
                var tmppositions = [];
                data.forEach(pos => {
                    var p = pos.data();
                    tmppositions.push({ key: pos.id, info: { ...tmplPosition, ...p } });
                });
                setcontractsWithPositions([...new Set(tmppositions.map(item => item.info.contract))]);
                updatePositions(tmppositions);
            });

        return () => unsub();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setpageloading(!pageloading);
    }, [positions]); // eslint-disable-line react-hooks/exhaustive-deps

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
