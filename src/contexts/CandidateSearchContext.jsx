import React, { useState } from "react";

const CandidateSearchContext = React.createContext({});

const CandidateTableFilters = ({ children }) => {
    const [searchterm, setsearchterm] = useState("");
    const [status, setstatus] = useState("");
    const [archived, setarchived] = useState("current");
    // const [candidatesScrollPosition, setcandidatesScrollPosition] = useState(0);
    // const [pagenum, setpagenum] = useState(0);
    const [shown, setshown] = useState([]);
    const [candidatesFiltered, setcandidatesFiltered] = useState([]);

    const value = { candidatesFiltered, setcandidatesFiltered, searchterm, archived, status, setsearchterm, setarchived, setstatus, shown, setshown };

    return <CandidateSearchContext.Provider value={value}>{children}</CandidateSearchContext.Provider>;
};
export default CandidateSearchContext;
export { CandidateTableFilters };
