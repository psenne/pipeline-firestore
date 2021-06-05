import React, { useState, useEffect } from "react";
import { Statistic } from "semantic-ui-react";
import { fbCandidatesDB } from "../firebase.config";
import PieChart from "./PieChart";

export default function StatsCandidates() {
    const [numCandidates, setNumCandidates] = useState(0);
    const [candidateStats, setcandidateStats] = useState({});

    useEffect(() => {
        const unsub = fbCandidatesDB.where("archived", "==", "current").onSnapshot(docs => {
            const tmp = {};
            docs.forEach(doc => {
                const candidate = doc.data();
                tmp[candidate.status] = tmp[candidate.status] ? tmp[candidate.status] + 1 : 1;
            });
            setNumCandidates(docs.size);
            setcandidateStats(tmp);
        });
        return () => {
            unsub();
        };
    }, []);

    const graphdata = Object.keys(candidateStats).map(status => {
        return {
            id: status,
            label: status,
            value: candidateStats[status]
        };
    });

    return (
        <>
            <Statistic label="Candidates" value={numCandidates} />
            <PieChart data={graphdata} />
        </>
    );
}
