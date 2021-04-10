import React, { useState, useEffect, useContext } from "react";
import CandidateSearchContext from "../contexts/CandidateSearchContext";
import { fbCandidatesDB } from "../firebase.config";
import { tmplCandidate } from "../constants/candidateInfo";
import { Container, Pagination } from "semantic-ui-react";
import LoadingCandidatesTable from "./LoadingCandidatesTable";
import NavBar from "../NavBar";
import CandidateToolbar from "./CandidateToolbar";
import CandidatesTable from "./CandidatesTable";

//uses search field value to filter array of candidates for table population
function isSearched(s) {
    return function (item) {
        const contracts = item.info.potential_contracts ? item.info.potential_contracts.join(":").toLowerCase() : "";
        const searchTerm = s;
        let wasFound = true;

        s.split(" ").forEach(searchTerm => {
            let termFound = false;
            if (item.info.firstname.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.lastname.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.found_by.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.prefered_location.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.skill.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.current_company.toLowerCase().includes(searchTerm.toLowerCase()) || contracts.includes(searchTerm.toLowerCase()) || item.info.notes.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.next_steps.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.resume_text.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.level.toLowerCase().includes(searchTerm.toLowerCase())) {
                termFound = true;
            }
            wasFound = wasFound && termFound;
        });

        return !searchTerm || wasFound;
    };
}

// filters candidates by status
function isFiltered(searchTerm) {
    return function (item) {
        return !searchTerm || item.info.status.toLowerCase() === searchTerm.toLowerCase();
    };
}

function CandidatesPage(props) {
    const { archived, searchterm, status, pagenum, setpagenum, shown, setshown, candidatesFiltered, setcandidatesFiltered } = useContext(CandidateSearchContext);
    const [candidatesAll, setcandidatesAll] = useState([]);
    const [pageloading, setpageloading] = useState(false);
    const candidatesPerPage = 20;

    useEffect(() => {
        const unsub = fbCandidatesDB
            .orderBy("modified_date", "desc")
            // .where("archived", "==", archived)
            .onSnapshot(
                snapshot => {
                    let tmpitems = [];

                    snapshot.forEach(function (candidate) {
                        tmpitems.push({ key: candidate.id, info: Object.assign({}, tmplCandidate, candidate.data()) });
                    });
                    setcandidatesAll(tmpitems);
                    setpageloading(false);
                },
                error => {
                    setcandidatesAll([]);
                    setpageloading(false);
                    console.error(error);
                }
            );

        return () => {
            unsub();
        };
    }, []);

    // apply initialize filteredCandidates
    useEffect(() => {
        setcandidatesFiltered(candidatesAll.filter(isFiltered(status)).filter(isSearched(searchterm)));
    }, [candidatesAll, setcandidatesFiltered, status, searchterm]);

    // apply filters to list of candidates and reset back to first page
    useEffect(() => {
        setcandidatesFiltered(candidatesAll.filter(isFiltered(status)).filter(isSearched(searchterm)));
    }, [status, searchterm, candidatesAll, setcandidatesFiltered]);

    // update the candidates table when the page number or filters have been changed
    useEffect(() => {
        if (candidatesFiltered.length > 0) {
            setshown(candidatesFiltered.slice(0, candidatesPerPage));
        }
    }, [candidatesFiltered, setshown]);

    // update the candidates table when the page number or filters have been changed
    useEffect(() => {
        if (candidatesFiltered.length > 0) {
            const startingAt = (pagenum - 1) * candidatesPerPage;
            const endingAt = startingAt + candidatesPerPage;
            setshown(candidatesFiltered.slice(startingAt, endingAt));
        }
    }, [pagenum, candidatesFiltered, setshown]);

    return (
        <>
            <NavBar active="candidates" />
            <CandidateToolbar candidates={candidatesFiltered} />
            <Container fluid className="hovered">
                <div className="candidate-table-row">
                    {pageloading && <LoadingCandidatesTable numrows={candidatesPerPage} />}
                    {!pageloading && (
                        <>
                            <CandidatesTable list={shown} />
                            {candidatesFiltered.length > candidatesPerPage && (
                                <div className="pages">
                                    <Pagination
                                        activePage={pagenum}
                                        // ellipsisItem={false}
                                        totalPages={Math.ceil(candidatesFiltered.length / candidatesPerPage)}
                                        onPageChange={(ev, { activePage }) => {
                                            setpagenum(activePage);
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Container>
        </>
    );
}

export default CandidatesPage;
