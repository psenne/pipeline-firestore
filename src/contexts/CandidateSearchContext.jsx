import React, { useState } from "react";

const CandidateSearchContext = React.createContext({});

const CandidateTableFilters = ({ children }) => {
    const [searchterm, setsearchterm] = useState("");
    const [status, setstatus] = useState("");
    const [archived, setarchived] = useState("current");
    const value = { searchterm, archived, status, setsearchterm, setarchived, setstatus };

    return <CandidateSearchContext.Provider value={value}>{children}</CandidateSearchContext.Provider>;
};
export default CandidateSearchContext;
export { CandidateTableFilters };
