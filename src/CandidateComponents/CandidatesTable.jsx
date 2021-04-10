import React, { useState, useEffect } from "react";
import { fbStatusesDB } from "../firebase.config";
import CandidateSummary from "./CandidateSummary";

const CandidatesTable = ({ list }) => {
    const [statuses, setstatuses] = useState([]);

    useEffect(() => {
        const listener = fbStatusesDB.on("value", data => {
            let tmp = [];
            data.forEach(function (status) {
                tmp.push({ ...status.val() });
            });
            setstatuses(tmp);
        });
        return () => {
            fbStatusesDB.off("value", listener);
        };
    }, []);

    return (
        <>
            {list.map(candidate => (
                <CandidateSummary key={candidate.key} candidate={candidate} statuses={statuses} />
            ))}
        </>
    );
};

export default CandidatesTable;
