import React from "react";
import { Segment, Header, Tab } from "semantic-ui-react";
import Files from "../CommonComponents/Files";
import Markdown from "markdown-to-jsx";
import { format } from "date-fns";
import classnames from "classnames";

function Employee({ employee }) {
    const salary = employee.salary ? atob(employee.salary) : "";
    const hire_info = employee.hired_on ? "Hired on " + format(employee.hired_on.toDate(), "M/d/yyyy") : "Hire date not set.";
    const referedby = employee.found_by ? `Referred by ${employee.found_by}` : "";

    const panes = [
        {
            menuItem: { key: "notes", icon: "sticky note outline", content: "Notes" },
            render: () => (
                <Tab.Pane>
                    <Markdown>{employee.notes}</Markdown>
                </Tab.Pane>
            )
        },
        {
            menuItem: { key: "resume", icon: "file text", content: "Resume Text" },
            render: () => (
                <Tab.Pane>
                    <Markdown>{employee.resume_text}</Markdown>
                </Tab.Pane>
            )
        }
    ];

    return (
        <Segment attached padded>
            <Segment vertical padded>
                <Header size="huge">
                    {employee.firstname} {employee.lastname}
                    <h5>{[employee.emailaddress, employee.telephone].filter(Boolean).join(" / ")}</h5>
                    <Header.Subheader>
                        {employee.level} {employee.title}
                    </Header.Subheader>
                </Header>
            </Segment>
            <Segment vertical padded>
                <div>Current contract: {employee.current_contract}</div>
                <div>Salary: {salary}</div>
                <div>{hire_info}</div>
                <div>{referedby}</div>
            </Segment>

            <Segment vertical padded>
                <Tab panes={panes} />
            </Segment>
            {employee.filenames.length > 0 && (
                <Segment vertical padded className="minitoolbar-inline">
                    <h3>Documents</h3>
                    <Files employeeID={employee.id} filenames={employee.filenames} />
                </Segment>
            )}
        </Segment>
    );
}

export default Employee;
