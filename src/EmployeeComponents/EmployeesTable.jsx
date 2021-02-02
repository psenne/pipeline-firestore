import React, { useContext } from "react";
import { Table, Icon } from "semantic-ui-react";
import { Link } from "react-router-dom";
import EmployeeContext from "../contexts/EmployeeContext";
import history from "../modules/history";

function isSearched(s) {
    return function (item) {
        const searchTerm = s;
        let wasFound = true;

        s.split(" ").forEach(searchTerm => {
            let termFound = false;
            if (item.firstname.toLowerCase().includes(searchTerm.toLowerCase()) || item.lastname.toLowerCase().includes(searchTerm.toLowerCase())) {
                termFound = true;
            }
            wasFound = wasFound && termFound;
        });

        return !searchTerm || wasFound;
    };
}

function isFiltered(searchTerm) {
    return function (item) {
        return !searchTerm || item.current_contract === searchTerm;
    };
}

export default function EmployeesTable({ employees }) {
    const { selectedcontract, searchterm } = useContext(EmployeeContext);

    return (
        <Table columns={6} selectable striped>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Employee</Table.HeaderCell>
                    <Table.HeaderCell>Title</Table.HeaderCell>
                    <Table.HeaderCell>Contract</Table.HeaderCell>
                    <Table.HeaderCell>Telephone Number</Table.HeaderCell>
                    <Table.HeaderCell>E-mail address</Table.HeaderCell>
                    <Table.HeaderCell width={1}></Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {employees
                    .filter(isFiltered(selectedcontract))
                    .filter(isSearched(searchterm))
                    .map(employee => {
                        const name = `${employee.firstname} ${employee.lastname}`;
                        const title = `${employee.level} ${employee.title}`;
                        const link = `/employees/${employee.id}`;
                        const editlink = `/employees/${employee.id}/edit`;

                        return (
                            <Table.Row
                                key={employee.id}
                                onClick={ev => {
                                    ev.stopPropagation();
                                    if (!ev.target.className.split(" ").includes("action")) {
                                        history.push(link);
                                    }
                                }}
                                style={{ cursor: "pointer" }}>
                                <Table.Cell>{name}</Table.Cell>
                                <Table.Cell>{title}</Table.Cell>
                                <Table.Cell>{employee.current_contract}</Table.Cell>
                                <Table.Cell>{employee.telephone}</Table.Cell>
                                <Table.Cell>{employee.emailaddress}</Table.Cell>
                                <Table.Cell textAlign="right">
                                    <Link to={editlink}>
                                        <Icon name="edit" className="action" />
                                    </Link>
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
            </Table.Body>
        </Table>
    );
}
