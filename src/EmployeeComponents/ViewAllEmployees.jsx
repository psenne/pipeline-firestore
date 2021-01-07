import React, { useState, useEffect } from "react";
import NavBar from "../NavBar";
import tmplEmployee from "../constants/employee";
import { fbEmployeesDB } from "../firebase.config";
import EmployeesTable from "./EmployeesTable";
import EmployeeToolbar from "./EmployeeToolbar";
import { Dimmer, Loader } from "semantic-ui-react";

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
        <>
            {pageloading && (
                <Dimmer active={pageloading}>
                    <Loader></Loader>
                </Dimmer>
            )}
            {!pageloading && (
                <div className="view-panel">
                    <EmployeeToolbar />
                    <EmployeesTable employees={employees} />
                </div>
            )}
        </>
    );
}
