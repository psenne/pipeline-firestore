import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fbEmployeesDB } from "../firebase.config";
import { Container, List, ListDescription } from "semantic-ui-react";
import ComponentPlaceholder from "./ComponentPlaceholder";
import { format } from "date-fns";
import tmplEmployee from "../constants/employee";

const AtRiskEmployees = () => {
    const [employees, setemployees] = useState([]);
    const [pageloading, setpageloading] = useState(false);

    useEffect(() => {
        var unsub = fbEmployeesDB
            .where("at_risk", "==", true)
            .orderBy("lastname")
            .onSnapshot(data => {
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
        <Container>
            <h3>At-Risk Employees</h3>
            {pageloading ? (
                <ComponentPlaceholder lines="6" />
            ) : (
                <List selection verticalAlign="middle" divided relaxed>
                    {employees.map(employee => {
                        const hired_on = employee.hired_on ? "Hire date: " + format(employee.hired_on.toDate(), "MMM d, yyyy") : "";
                        const contract = employee.current_contract ? `Contract: ${employee.current_contract}` : "";

                        return (
                            <List.Item key={employee.id}>
                                <List.Content>
                                    <List.Header>
                                        <Link to={`/employees/${employee.id}`}>
                                            {employee.firstname} {employee.lastname}
                                        </Link>
                                    </List.Header>
                                    <List.Description>{hired_on}</List.Description>
                                    <List.Description>{contract}</List.Description>
                                </List.Content>
                            </List.Item>
                        );
                    })}
                </List>
            )}
        </Container>
    );
};

export default AtRiskEmployees;
