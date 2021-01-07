import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Placeholder, Menu, Icon, Container } from "semantic-ui-react";
import { fbEmployeesDB } from "../firebase.config";
import tmplEmployee from "../constants/employee";
import history from "../modules/history";
import Employee from "./Employee";

export default function EmployeeProfilePage({ match }) {
    const [employee, setEmployee] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const unsubscribe = fbEmployeesDB.doc(id).onSnapshot(doc => {
            if (doc.exists) {
                setEmployee({ ...tmplEmployee, ...doc.data(), id });
            } else {
                history.push("/employees/");
            }
        });
        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div className="view-panel">
            {!employee && <Placeholder></Placeholder>}
            {employee && (
                <Container>
                    <Menu fluid attached="top" size="huge" borderless className="no-print">
                        <Menu.Item as={Link} to={`/employees`}>
                            <Icon name="arrow left" />
                        </Menu.Item>
                        <Menu.Menu position="right">
                            <Menu.Item as={Link} to={`/employees/${employee.id}/edit`}>
                                <Icon name="edit" />
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                    <Employee employee={employee} />
                </Container>
            )}
        </div>
    );
}
