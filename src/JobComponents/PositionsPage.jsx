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
        const getPositions = fbPositionsDB.orderByChild("contract").on("value", data => {
            let tmpitems = [];
            data.forEach(function(position) {
                tmpitems.push({ key: position.key, info: Object.assign({}, tmplPosition, position.val()) });
            });
            setcontractsWithPositions([...new Set(tmpitems.map(item => item.info.contract))]); //send to contract dropdown to show only those contracts that have positions listed.
            updatePositions(tmpitems);
            setpageloading(false);
        });
        return () => fbPositionsDB.off("value", getPositions);
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
