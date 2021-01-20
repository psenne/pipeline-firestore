import React, { useState } from "react";
import firebase, { fbStorage, fbEmployeesDB } from "../firebase.config";
import history from "../modules/history";
import classnames from "classnames";
import { sentence } from "to-case";
import ContractDropdown from "../CommonComponents/ContractDropdown";
import { Form, Container, Segment, Button, Message, Header, Menu, Icon, Checkbox, Tab } from "semantic-ui-react";
import tmplEmployee from "../constants/employee";

export default function AddEmployeePage() {
    const [employee, setEmployee] = useState(tmplEmployee);
    const [files, setFiles] = useState([]);

    const HandleInput = ev => {
        const name = ev.target.name;
        const value = ev.target.value;
        var field = {};
        field[name] = value;
        setEmployee({ ...employee, ...field });
    };

    const HandleContractInput = selected_contract => {
        setEmployee(...employee, ...{ current_contract: selected_contract });
    };

    const HandleFileUpload = ev => {
        setFiles(ev.target.files);

        let filenames = [];
        for (var i = 0; i < files.length; i++) {
            filenames.push(files[i].name);
        }
        setEmployee({ ...employee, ...{ filenames } });
    };

    const ValidateAndSubmit = () => {
        console.log(employee);
    };

    const panes = [
        {
            menuItem: { key: "notes", icon: "sticky note outline", content: "Notes" },
            render: () => (
                <Tab.Pane>
                    <Form.TextArea name="notes" label="Management Notes" onChange={HandleInput} value={employee.notes} />
                </Tab.Pane>
            )
        },
        {
            menuItem: { key: "resume", icon: "file text", content: "Resume Text" },
            render: () => (
                <Tab.Pane>
                    <Form.TextArea name="resume_text" label="Resume" style={{ minHeight: 235 }} onChange={this.HandleInput} value={employee.resume_text} />
                </Tab.Pane>
            )
        }
    ];

    return (
        <Container>
            <Segment>
                <Form>
                    <Header>Personal Information</Header>
                    <Segment>
                        <Form.Input name="firstname" type="text" required placeholder="First name" onChange={HandleInput} value={employee.firstname} />
                        <Form.Input name="lastname" type="text" required placeholder="Last name" onChange={HandleInput} value={employee.lastname} />
                        <Form.Input name="emailaddress" type="email" label="Email Address:" icon="mail" iconPosition="left" placeholder="Email Address" onChange={HandleInput} value={employee.emailaddress} />
                        <Form.Input name="telephone" type="tel" label="Phone Number:" icon="phone" iconPosition="left" placeholder="XXX-XXX-XXXX" onChange={HandleInput} value={employee.telephone} />
                    </Segment>

                    <Header>Hiring Information</Header>
                    <Segment>
                        <Form.Group inline>
                            <Form.Input inline type="text" name="level" label="Level:" onChange={HandleInput} value={employee.level} />
                            <Form.Input inline type="text" name="title" label="Title / Role:" onChange={HandleInput} value={employee.title} />
                        </Form.Group>
                        <Form.Field>
                            <label>Contract</label>
                            <ContractDropdown selection clearable value={employee.current_contract} onChange={HandleContractInput} />
                        </Form.Field>
                        <Form.Group inline>
                            <label>Add document:</label>
                            <Form.Input name="doc_filename" type="file" multiple onChange={HandleFileUpload} />
                        </Form.Group>
                    </Segment>
                    <Header>Notes</Header>
                    <Segment>
                        <Tab panes={panes} />
                        <Form.Input name="found_by" type="text" label="Referred By" onChange={HandleInput} value={employee.found_by} />
                    </Segment>
                    <Button type="submit" icon="save" positive content="Add" onClick={ValidateAndSubmit} />
                </Form>
            </Segment>
        </Container>
    );
}
