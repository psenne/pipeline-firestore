import React, { useState, useEffect } from "react";
import { Statistic } from "semantic-ui-react";
import { fbSubmissionsDB } from "../firebase.config";
import PieChart from "./PieChart";

export default function StatsSubmissions() {
    const [numSubmissions, setnumSubmissions] = useState(0);
    const [submissionstats, setsubmissionstats] = useState({});

    useEffect(() => {
        const unsub = fbSubmissionsDB.onSnapshot(docs => {
            const tmp = {};
            docs.forEach(doc => {
                const submission = doc.data();
                tmp[submission.contract] = tmp[submission.contract] ? tmp[submission.contract] + 1 : 1;
            });
            setnumSubmissions(docs.size);
            setsubmissionstats(tmp);
        });
        return () => {
            unsub();
        };
    }, []);

    const graphdata = Object.keys(submissionstats).map(contract => {
        return {
            id: contract,
            label: contract,
            value: submissionstats[contract]
        };
    });

    return (
        <>
            <Statistic label="Submissions" value={numSubmissions} />
            <PieChart data={graphdata} />
        </>
    );
}
