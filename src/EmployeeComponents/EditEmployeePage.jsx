import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import history from "../modules/history";
import firebase, { fbEmployeesDB, fbStorage, fbFlagNotes } from "../firebase.config";
import UserContext from "../contexts/UserContext";
import ContractDropdown from "../CommonComponents/ContractDropdown";
import Files from "../CommonComponents/Files";
import tmplEmployee from "../constants/employee";
import { Form, Container, Segment, Button, Header, Tab, Checkbox } from "semantic-ui-react";
import SemanticDatepicker from "react-semantic-ui-datepickers";
import { subYears } from "date-fns";
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css";

export default function EditEmployeePage() {
    const { id } = useParams();
    const currentuser = useContext(UserContext);
    const [employee, setEmployee] = useState(tmplEmployee);
    const [files, setFiles] = useState([]);
    const [error, seterror] = useState(false);

    useEffect(() => {
        const unsub = fbEmployeesDB.doc(id).onSnapshot(doc => {
            if (doc.exists) {
                setEmployee({ ...doc.data() });
            } else {
                unsub();
                history.push("/employees/add");
            }
        });
        return () => {
            unsub();
        };
    }, [id]);

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
        const files = ev.target.files;
        setFiles(files);

        let filenames = [...employee.filenames];
        for (var i = 0; i < files.length; i++) {
            filenames.push(files[i].name);
        }
        setEmployee({ ...employee, ...{ filenames } });
    };

    const DeleteFile = (ev, filename) => {
        ev.stopPropagation();
        ev.preventDefault();
        const filenames = employee.filenames;
        const newFilenames = filenames.filter(f => f !== filename);

        if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
            fbStorage
                .child(id + "/" + filename)
                .delete()
                .then(() => {
                    fbEmployeesDB.doc(id).update({ filenames: newFilenames });
                })
                .catch(err => console.error("File, line 25", err));
        }
    };

    const UpdateRecord = () => {
        if (employee.firstname.length === 0 || employee.lastname.length === 0) {
            seterror(true);
        } else {
            seterror(false);
            employee["modified_by"] = currentuser.displayName;
            employee["modified_date"] = firebase.firestore.FieldValue.serverTimestamp();
            fbEmployeesDB
                .doc(id)
                .update(employee)
                .then(() => {
                    const uploadedFiles = [];
                    for (var i = 0; i < files.length; i++) {
                        let file = files[i];
                        const fileRef = fbStorage.child(id + "/" + file.name);
                        uploadedFiles.push(fileRef.put(file, { contentType: file.type })); //add file upload promise to array, so that we can use promise.all() for one returned promise
                    }

                    Promise.all(uploadedFiles)
                        .then(() => {
                            history.push("/employees/"); //wait until all files have been uploaded, then go to profile page.
                        })
                        .catch(error => console.log(error));
                });
        }
    };

    const DeleteRecord = () => {
        const confirmationMsg = "Are you sure you want to delete " + employee.firstname + " " + employee.lastname + "?";
        const deleteConfirmed = window.confirm(confirmationMsg);

        if (deleteConfirmed) {
            fbEmployeesDB
                .doc(id)
                .delete()
                .then(() => {
                    fbStorage
                        .child(id)
                        .listAll()
                        .then(res => {
                            res.items.forEach(itemRef => {
                                itemRef.delete();
                            });
                        })
                        .catch(error => {
                            console.error("Error deleting files:", error);
                        });
                })
                .then(() => {
                    fbFlagNotes.child(id).remove();
                })
                .then(() => history.push("/employees/"))
                .catch(function (error) {
                    console.error("Error deleting employee:", error);
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
                                    value={employee.birthday?.toDate() || ""}
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
                                    value={employee.hired_on?.toDate() || ""}
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
                        <Form.Field>
                            <Tab panes={panes} />
                        </Form.Field>
                        <Form.Field>
                            <Checkbox
                                slider
                                label="At risk"
                                checked={employee.at_risk}
                                onChange={(ev, { checked }) => {
                                    setEmployee({ ...employee, ...{ at_risk: checked } });
                                }}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label>Add document:</label>
                            <Form.Input name="doc_filename" type="file" multiple onChange={HandleFileUpload} />
                        </Form.Field>
                        <Files deletable id={id} filenames={employee.filenames} onDelete={DeleteFile} />
                    </Segment>
                    <Button type="submit" icon="save" positive content="Update" onClick={UpdateRecord} />
                    <Button type="submit" icon="trash" negative content="Delete" onClick={DeleteRecord} />
                    <Button type="submit" icon="cancel" content="Cancel" onClick={() => history.goBack()} />
                </Form>
            </Segment>
        </Container>
    );
}
