import React, { useState, useEffect, useContext } from "react";
import CandidateSearchContext from "../contexts/CandidateSearchContext";
import { fbCandidatesDB } from "../firebase.config";
import { tmplCandidate } from "../constants/candidateInfo";
import LoadingCandidatesTable from "./LoadingCandidatesTable";
import NavBar from "../NavBar";
import CandidateToolbar from "./CandidateToolbar";
import CandidatesTable from "./CandidatesTable";

function CandidatesPage(props) {
    const { archived } = useContext(CandidateSearchContext);
    const [candidatesList, setcandidatesList] = useState([]);
    const [pageloading, setpageloading] = useState(false);

    useEffect(() => {
        setpageloading(true);
        const unsubscribe = fbCandidatesDB
            .orderBy("modified_date", "desc")
            .orderBy("created_date", "desc")
            .where("archived", "==", archived)
            .onSnapshot(
                doc => {
                    let tmpitems = [];
                    doc.forEach(function (candidate) {
                        tmpitems.push({ key: candidate.id, info: Object.assign({}, tmplCandidate, candidate.data()) });
                    });
                    setcandidatesList(tmpitems);
                    setpageloading(false);
                },
                error => {
                    setcandidatesList([]);
                    setpageloading(false);
                    console.error(error);
                }
            );
        return () => {
            unsubscribe();
        };
    }, [archived]);

    const flaggedCandidates = candidatesList.filter(candidate => {
        return candidate.info.isFlagged;
    });

    const unflaggedCandidates = candidatesList.filter(candidate => {
        return !candidate.info.isFlagged;
    });

    return (
        <>
            <NavBar active="candidates" />
            <CandidateToolbar candidates={candidatesList} />
            {pageloading && <LoadingCandidatesTable />}
            {!pageloading && (
                <>
                    <CandidatesTable list={flaggedCandidates} />
                    <CandidatesTable list={unflaggedCandidates} />
                </>
            )}
        </>
    );
}

export default CandidatesPage;
