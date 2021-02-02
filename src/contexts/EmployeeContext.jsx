import React, { useState } from "react";

const EmployeeContext = React.createContext({});

const EmployeeTableFilters = ({ children }) => {
    const [searchterm, setsearchterm] = useState("");
    const [selectedcontract, setselectedcontract] = useState("");
    const value = { searchterm, selectedcontract, setsearchterm, setselectedcontract };

    return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
};
export default EmployeeContext;
export { EmployeeTableFilters };
