import React, { useState, useEffect, useContext } from "react";
import CandidateSearchContext from "../contexts/CandidateSearchContext";
import { fbCandidatesDB } from "../firebase.config";
import { tmplCandidate } from "../constants/candidateInfo";
import { Container, Button } from "semantic-ui-react";
import LoadingCandidatesTable from "./LoadingCandidatesTable";
import NavBar from "../NavBar";
import CandidateToolbar from "./CandidateToolbar";
import CandidatesTable from "./CandidatesTable";

function CandidatesPage(props) {
    const { archived } = useContext(CandidateSearchContext);
    const candidatesPerPage = 2;
    const GetInitialPage = () => {
        return fbCandidatesDB.orderBy("modified_date", "desc").where("archived", "==", archived).limit(candidatesPerPage).get();
    };
    const [candidatesList, setcandidatesList] = useState([]);
    const [pageloading, setpageloading] = useState(false);
    const [snapshot, saveSnapshot] = useState([]);
    const [query, setQuery] = useState(GetInitialPage);

    const GetPrevPage = firstDocument => {
        if (firstDocument) return fbCandidatesDB.orderBy("modified_date", "desc").where("archived", "==", archived).endBefore(firstDocument).limit(candidatesPerPage).get();
    };

    const GetNextPage = lastDocument => {
        if (lastDocument) return fbCandidatesDB.orderBy("modified_date", "desc").where("archived", "==", archived).startAfter(lastDocument).limit(candidatesPerPage).get();
    };

    const ProcessDocs = snapshot => {
        let tmpitems = [];
        saveSnapshot(snapshot);

        snapshot.forEach(function (candidate) {
            tmpitems.push({ key: candidate.id, info: Object.assign({}, tmplCandidate, candidate.data()) });
        });
        setcandidatesList(tmpitems);
    };

    useEffect(() => {
        if (query) {
            setpageloading(true);
            query.then(
                snapshot => {
                    if (snapshot.docs.length > 0) {
                        ProcessDocs(snapshot);
                    }
                    setpageloading(false);
                },
                error => {
                    setcandidatesList([]);
                    setpageloading(false);
                    console.error(error);
                }
            );
        }
    }, [archived, query]);

    return (
        <>
            <NavBar active="candidates" />
            <CandidateToolbar candidates={candidatesList} />
            <Container fluid className="hovered">
                <div className="candidate-table-row">
                    {pageloading && <LoadingCandidatesTable numrows={candidatesPerPage} />}
                    {!pageloading && (
                        <>
                            <CandidatesTable list={candidatesList} />
                            <div className="pages">
                                <Button
                                    onClick={ev => {
                                        const firstdoc = snapshot.docs[0];
                                        setQuery(GetPrevPage(firstdoc));
                                    }}>
                                    &lt; Previous
                                </Button>
                                <Button
                                    disabled={snapshot?.docs?.length < candidatesPerPage}
                                    onClick={ev => {
                                        const lastdoc = snapshot.docs[snapshot.docs.length - 1];
                                        setQuery(GetNextPage(lastdoc));
                                    }}>
                                    Next &gt;
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Container>
        </>
    );
}

export default CandidatesPage;
