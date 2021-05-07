import React, { useState, useEffect, useContext } from "react";
// import { useLocation, useHistory } from "react-router-dom";
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
// function isFiltered(searchTerm) {
//     return function (item) {
//         return !searchTerm || item.info.status.toLowerCase() === searchTerm.toLowerCase();
//     };
// }

// function GetPageFromURL() {
//     return new URLSearchParams(useLocation().search);
// }

function CandidatesPage(props) {
    const { pagenum, setpagenum, searchterm, status, shown, setshown, candidatesFiltered, setcandidatesFiltered } = useContext(CandidateSearchContext);
    const [candidatesAll, setcandidatesAll] = useState([]);
    const [totalpages, settotalpages] = useState(1);
    const [pageloading, setpageloading] = useState(false);
    const candidatesPerPage = 5;
    //const pagenum = GetPageFromURL().get("page") || 1;
    // const history = useHistory();

    useEffect(() => {
        setpageloading(true);
        let query = fbCandidatesDB.orderBy("modified_date", "desc");
        query = status ? query.where("status", "==", status) : query;
        let unsub = query.onSnapshot(
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

        return () => unsub();
    }, [status]);

    useEffect(() => {
        setcandidatesFiltered(candidatesAll.filter(isSearched(searchterm)));
    }, [searchterm, candidatesAll, setcandidatesFiltered]);

    useEffect(() => {
        // console.log({ candidatesFiltered, candidatesAll, pagenum });
        const numFiltered = candidatesFiltered.length;
        const hasCandidates = numFiltered > 0;
        const outofbounds = pagenum > numFiltered / candidatesPerPage;
        if (hasCandidates && outofbounds) {
            //history.go("/candidates?page=1");
        }
        const startingAt = (pagenum - 1) * candidatesPerPage;
        const endingAt = startingAt + candidatesPerPage;
        settotalpages(Math.ceil(candidatesFiltered.length / candidatesPerPage));
        setshown(candidatesFiltered.slice(startingAt, endingAt));
        window.scroll({ top: 0, left: 0 });
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
                                        totalPages={totalpages}
                                        onPageChange={(ev, { activePage }) => {
                                            // history.push(`/candidates?page=${activePage}`);
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
