import React, { useState, useContext } from "react";
import firebase, { fbStorage, fbEmployeesDB } from "../firebase.config";
import history from "../modules/history";
import UserContext from "../contexts/UserContext";
import ContractDropdown from "../CommonComponents/ContractDropdown";
import { Form, Container, Segment, Button, Message, Header, Menu, Icon, Checkbox, Tab } from "semantic-ui-react";
import tmplEmployee from "../constants/employee";
import SemanticDatepicker from "react-semantic-ui-datepickers";
import { subYears } from "date-fns";
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css";

export default function AddEmployeePage() {
    const [employee, setEmployee] = useState(tmplEmployee);
    const [files, setFiles] = useState([]);
    const [error, seterror] = useState(false);
    const currentuser = useContext(UserContext);

    const HandleInput = ev => {
        const name = ev.target.name;
        const value = ev.target.value;
        var field = {};
        field[name] = value;
        setEmployee({ ...employee, ...field });
    };

    const HandleContractInput = selected_contract => {
        setEmployee({ ...employee, ...{ current_contract: selected_contract } });
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
        if (employee.firstname.length === 0 && employee.lastname.length === 0) {
            seterror(true);
        } else {
            seterror(false);
            employee["created_by"] = currentuser.displayName;
            employee["created_date"] = firebase.firestore.FieldValue.serverTimestamp();

            fbEmployeesDB.add(employee).then(employee => {
                const key = employee.id;
                const uploadedFiles = [];

                for (var i = 0; i < files.length; i++) {
                    let file = files[i];
                    const fileRef = fbStorage.child(key + "/" + file.name);
                    uploadedFiles.push(fileRef.put(file, { contentType: file.type })); //add file upload promise to array, so that we can use promise.all() for one returned promise
                }
                Promise.all(uploadedFiles).then(() => {
                    history.push("/employees/" + key); //wait until all files have been uploaded, then go to profile page.
                });
            });
        }
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
                    <Form.TextArea name="resume_text" label="Resume" onChange={HandleInput} value={employee.resume_text} />
                </Tab.Pane>
            )
        }
    ];

    return (
        <Container>
            <Segment>
                <Form error={error}>
                    <Header>Personal Information</Header>
                    <Segment>
                        <Form.Group widths="equal">
                            <Form.Field>
                                <Form.Input name="firstname" type="text" required label="First name:" placeholder="First name" onChange={HandleInput} value={employee.firstname} />
                            </Form.Field>
                            <Form.Field>
                                <Form.Input name="lastname" type="text" required label="Last name:" placeholder="Last name" onChange={HandleInput} value={employee.lastname} />
                            </Form.Field>
                        </Form.Group>
                        <Form.Group widths="equal">
                            <Form.Input name="emailaddress" type="email" label="Email Address:" icon="mail" iconPosition="left" placeholder="Email Address" onChange={HandleInput} value={employee.emailaddress} />
                            <Form.Input name="telephone" type="tel" label="Phone Number:" icon="phone" iconPosition="left" placeholder="XXX-XXX-XXXX" onChange={HandleInput} value={employee.telephone} />
                            <Form.Field>
                                <label>Birthday</label>
                                <SemanticDatepicker
                                    name="birthday"
                                    datePickerOnly
                                    showToday={false}
                                    date={subYears(new Date(), 30)}
                                    icon="birthday cake"
                                    onChange={(ev, selected_date) => {
                                        const date = selected_date.value;
                                        const newdate = date ? firebase.firestore.Timestamp.fromDate(date) : null;
                                        setEmployee({ ...employee, ...{ birthday: newdate } });
                                    }}
                                />
                            </Form.Field>
                        </Form.Group>
                    </Segment>

                    <Header>Hiring Information</Header>
                    <Segment>
                        <Form.Group widths="equal">
                            <Form.Field>
                                <Form.Input type="text" name="level" label="Level:" onChange={HandleInput} value={employee.level} />
                            </Form.Field>
                            <Form.Field>
                                <Form.Input type="text" name="title" label="Title:" onChange={HandleInput} value={employee.title} />
                            </Form.Field>
                            <Form.Field>
                                <label>Contract:</label>
                                <ContractDropdown selection clearable value={employee.current_contract} onChange={HandleContractInput} />
                            </Form.Field>
                        </Form.Group>
                        <Form.Group widths="equal">
                            <Form.Field>
                                <Form.Input
                                    name="salary"
                                    type="text"
                                    label="Salary:"
                                    icon="dollar"
                                    iconPosition="left"
                                    value={atob(employee.salary)}
                                    onChange={ev => {
                                        const value = ev.target.value;
                                        setEmployee({ ...employee, salary: btoa(value) });
                                    }}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Form.Input name="found_by" type="text" label="Referred by:" onChange={HandleInput} value={employee.found_by} />
                            </Form.Field>
                            <Form.Field>
                                <label>Date of hire:</label>
                                <SemanticDatepicker
                                    name="hired_on"
                                    datePickerOnly
                                    maxDate={new Date()}
                                    showToday={false}
                                    onChange={(ev, selected_date) => {
                                        const date = selected_date.value;
                                        const newdate = date ? firebase.firestore.Timestamp.fromDate(date) : null;
                                        setEmployee({ ...employee, ...{ hired_on: newdate } });
                                    }}
                                />
                            </Form.Field>
                        </Form.Group>
                    </Segment>
                    <Header>Notes</Header>
                    <Segment>
                        <Tab panes={panes} />
                        <Form.Field>
                            <label>Add document:</label>
                            <Form.Input name="doc_filename" type="file" multiple onChange={HandleFileUpload} />
                        </Form.Field>
                    </Segment>
                    <Button type="submit" icon="save" positive content="Add" onClick={ValidateAndSubmit} />
                </Form>
            </Segment>
        </Container>
    );
}
