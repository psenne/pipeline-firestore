import React, { useState, useContext } from "react";
import history from "../modules/history";
import firebase, { fbPositionsDB, fbStorage } from "../firebase.config";
import tmplPosition from "../constants/positionInfo";
import ContractDropdown from "../CommonComponents/ContractDropdown";
import UserContext from "../contexts/UserContext";
import { Form, Container, Segment, Button, Header, Message } from "semantic-ui-react";

export default function AddPositionForm() {
    const [position, setposition] = useState(Object.assign({}, tmplPosition));
    const [formError, setformError] = useState(false);
    const [filestoupload, setfilestoupload] = useState([]);
    const currentuser = useContext(UserContext);

    const HandleTextInput = ev => {
        const name = ev.target.name;
        const value = ev.target.value;
        updatePositionInfo(name, value);
    };

    const HandleContractInput = value => {
        updatePositionInfo("contract", value);
    };

    const updatePositionInfo = (name, value) => {
        const tmpPosition = Object.assign({}, position);
        tmpPosition[name] = value;
        setposition(tmpPosition);
    };

    const HandleFileUpload = ev => {
        const files = ev.target.files;
        setfilestoupload([...files]);
    };

    const AddNewPosition = () => {
        if (position.title && position.contract) {
            const added_on = firebase.firestore.FieldValue.serverTimestamp();
            position.added_on = added_on;
            position.added_by = currentuser.displayName;

            fbPositionsDB
                .add(position)
                .then(newposition => {
                    const pkey = newposition.id;

                    filestoupload.forEach(file => {
                        fbStorage.child(pkey + "/" + file.name).put(file, { contentType: file.type });
                    });
                })
                .finally(() => {
                    history.push("/positions");
                });
        } else {
            setformError(true);
        }
    };

    return (
        <>
            <Container>
                <Segment>
                    <Form>
                        <Segment>
                            <Header>Position Information</Header>
                            <Form.Group unstackable widths={3}>
                                <Form.Input name="title" type="text" required label="Title" onChange={HandleTextInput} value={position.title} />
                                <Form.Input name="level" type="text" label="Level" onChange={HandleTextInput} value={position.level} />
                                <Form.Input name="location" type="text" label="Location" onChange={HandleTextInput} value={position.location} />
                            </Form.Group>
                            <Form.TextArea name="skill_summary" label="Skill Summary" onChange={HandleTextInput} value={position.skill_summary} />
                            <Form.TextArea name="description" label="Description" onChange={HandleTextInput} value={position.description} />
                            <Form.Group inline>
                                <label>Add document:</label>
                                <Form.Input name="doc_filename" type="file" multiple onChange={HandleFileUpload} />
                            </Form.Group>
                        </Segment>
                        <Segment>
                            <Header>Contract Information</Header>
                            <Form.Group unstackable widths={8}>
                                <Form.Input name="position_id" type="text" label="Position ID" placeholder="Position ID" onChange={HandleTextInput} value={position.position_id} />
                                <div className="field">
                                    <label>Contract</label>
                                    <ContractDropdown required selection onChange={HandleContractInput} value={position.contract} />
                                </div>
                            </Form.Group>
                        </Segment>
                        <Segment>
                            {formError && <Message error floating compact icon="warning" header="Required fields missing" content="Title and contract are both required." />}
                            <Button type="submit" icon="plus" positive content="Add" onClick={AddNewPosition} />
                            <Button icon="close" content="Cancel" onClick={() => history.push("/positions")} />
                        </Segment>
                    </Form>
                </Segment>
            </Container>
        </>
    );
}
