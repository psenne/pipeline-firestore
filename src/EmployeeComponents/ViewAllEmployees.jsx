import React, { useState, useEffect } from "react";
import tmplEmployee from "../constants/employee";
import { fbEmployeesDB } from "../firebase.config";
import EmployeesTable from "./EmployeesTable";
import EmployeeToolbar from "./EmployeeToolbar";
import LoadingEmployeesTable from "./LoadingEmployeesTable";

export default function ViewAllEmployees() {
    const [employees, setemployees] = useState([]);
    const [pageloading, setpageloading] = useState(false);

    useEffect(() => {
        var unsub = fbEmployeesDB.orderBy("lastname").onSnapshot(data => {
            var tmp = [];
            data.forEach(doc => {
                tmp.push({ ...tmplEmployee, ...doc.data(), id: doc.id });
            });
            setemployees(tmp);
        });

        return () => unsub();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setpageloading(!pageloading);
    }, [employees]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="view-panel">
            <EmployeeToolbar />
            {pageloading && <LoadingEmployeesTable />}
            {!pageloading && <EmployeesTable employees={employees} />}
        </div>
    );
}
