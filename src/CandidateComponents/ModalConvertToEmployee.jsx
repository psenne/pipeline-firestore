import React, { useState } from "react";
import firebase from "../firebase.config";
import { Modal, Button, Form } from "semantic-ui-react";
import SemanticDatepicker from "react-semantic-ui-datepickers";
import ContractDropdown from "../CommonComponents/ContractDropdown";
import { subYears } from "date-fns";
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css";

function ModalConvertToEmployee({ setOpen, isOpen, CompleteConversion, candidate, children }) {
    const [birthday, setBirthday] = useState(null);
    const [hired_on, sethired_on] = useState(null);
    const [salary, setsalary] = useState(candidate.salary);
    const [title, setTitle] = useState(candidate.skill);
    const [level, setLevel] = useState(candidate.level);
    const [notes, setnotes] = useState(candidate.notes);
    const [current_contract, setcurrent_contract] = useState("");

    const candidatename = `${candidate.firstname} ${candidate.lastname}`;

    return (
        <Modal open={isOpen} trigger={children}>
            <Modal.Header>Converting {candidatename} to employee...</Modal.Header>
            <Modal.Content>
                <Modal.Description>
                    <Form>
                        <Form.Group widths="equal">
                            <Form.Field>
                                <label>Date of hire</label>
                                <SemanticDatepicker
                                    name="hired_on"
                                    datePickerOnly
                                    maxDate={new Date()}
                                    showToday={false}
                                    onChange={(ev, selected_date) => {
                                        const date = selected_date.value;
                                        const newdate = date ? firebase.firestore.Timestamp.fromDate(date) : null;
                                        sethired_on(newdate);
                                    }}
                                />
                            </Form.Field>
                            <Form.Field>
                                <label>Birthday</label>
                                <SemanticDatepicker
                                    name="hired_on"
                                    datePickerOnly
                                    showToday={false}
                                    date={subYears(new Date(), 30)}
                                    icon="birthday cake"
                                    onChange={(ev, selected_date) => {
                                        const date = selected_date.value;
                                        const newdate = date ? firebase.firestore.Timestamp.fromDate(date) : null;
                                        setBirthday(newdate);
                                    }}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Form.Input fluid name="salary" type="text" icon="dollar" iconPosition="left" label="Salary" onChange={ev => setsalary(btoa(ev.target.value))} value={atob(salary)} />
                            </Form.Field>
                        </Form.Group>
                        <Form.Group widths="equal">
                            <Form.Field>
                                <Form.Input fluid name="level" type="text" label="Level" onChange={ev => setLevel(ev.target.value)} value={level} />
                            </Form.Field>
                            <Form.Field>
                                <Form.Input fluid name="title" type="text" label="Title" onChange={ev => setTitle(ev.target.value)} value={title} />
                            </Form.Field>
                            <Form.Field>
                                <label>Contract</label>
                                <ContractDropdown selection clearable value={current_contract} onChange={value => setcurrent_contract(value)} />
                            </Form.Field>
                        </Form.Group>
                        <Form.Field>
                            <Form.TextArea name="notes" label="Update notes" onChange={ev => setnotes(ev.target.value)} value={notes} />
                        </Form.Field>
                    </Form>
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button content="Confirm" labelPosition="right" icon="checkmark" onClick={() => CompleteConversion({ hired_on, birthday, salary, notes, title, level, current_contract })} positive />
                <Button color="grey" onClick={() => setOpen(false)}>
                    Cancel
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default ModalConvertToEmployee;
