import React, { useState, useEffect } from "react";
import { Statistic } from "semantic-ui-react";
import { fbEmployeesDB } from "../firebase.config";
import PieChart from "./PieChart";

export default function StatsEmployees() {
    const [numEmployees, setnumEmployees] = useState(0);
    const [employeeStats, setemployeeStats] = useState({});

    useEffect(() => {
        const unsub = fbEmployeesDB.onSnapshot(docs => {
            const tmp = {};
            docs.forEach(doc => {
                const employee = doc.data();
                tmp[employee.current_contract] = tmp[employee.current_contract] ? tmp[employee.current_contract] + 1 : 1;
            });
            setnumEmployees(docs.size);
            setemployeeStats(tmp);
        });
        return () => {
            unsub();
        };
    }, []);

    const graphdata = Object.keys(employeeStats).map(contract => {
        return {
            id: contract,
            label: contract,
            value: employeeStats[contract]
        };
    });

    return (
        <>
            <Statistic label="Employees" value={numEmployees} />
            <PieChart data={graphdata} />
        </>
    );
}
