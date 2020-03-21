import React, { useState } from "react";

const PositionContext = React.createContext({});

const PositionTableFilters = ({ children }) => {
    const [searchterm, setsearchterm] = useState("");
    const [selectedcontract, setselectedcontract] = useState("");
    const value = { searchterm, selectedcontract, setsearchterm, setselectedcontract };

    return <PositionContext.Provider value={value}>{children}</PositionContext.Provider>;
};
export default PositionContext;
export { PositionTableFilters };
