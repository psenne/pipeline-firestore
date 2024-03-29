import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import history from "../modules/history";
import firebase, { fbPositionsDB, fbStorage } from "../firebase.config";
import tmplPosition from "../constants/positionInfo";
import Files from "../CommonComponents/Files";
import ContractDropdown from "../CommonComponents/ContractDropdown";
import UserContext from "../contexts/UserContext";
import { Form, Container, Segment, Button, Header, Message } from "semantic-ui-react";

export default function EditPositionForm() {
    const { id } = useParams();
    const key = id;
    const currentuser = useContext(UserContext);
    const [position, setposition] = useState({ ...tmplPosition });
    const [filecounter, setfilecounter] = useState(0);
    const [formError, setformError] = useState(false);

    useEffect(() => {
        const unsubPosition = fbPositionsDB.doc(key).onSnapshot(pos => {
            if (pos.exists) {
                setposition({ ...tmplPosition, ...pos.data() });
            } else {
                unsubPosition();
                history.push("/positions/add");
            }
        });
        return () => {
            unsubPosition();
        };
    }, [key]);

    const HandleTextInput = ev => {
        const name = ev.target.name;
        const value = ev.target.value;
        updatePositionInfo(name, value);
    };

    const HandleContractInput = value => {
        updatePositionInfo("contract", value);
    };

    const HandleFileUpload = ev => {
        const files = ev.target.files;
        [...files].forEach(file => {
            fbStorage
                .child(key + "/" + file.name)
                .put(file, { contentType: file.type })
                .then(snapshot => {
                    setfilecounter(filecounter + 1);
                });
        });
    };

    const updatePositionInfo = (name, value) => {
        const tmpPosition = Object.assign({}, position);
        tmpPosition[name] = value;
        setposition(tmpPosition);
    };

    const UpdatePosition = () => {
        if (position.title && position.contract) {
            position["modified_by"] = currentuser.displayName;
            position["modified_on"] = firebase.firestore.FieldValue.serverTimestamp();

            fbPositionsDB
                .doc(key)
                .update(position)
                .then(() => {
                    history.push("/positions");
                });
        } else {
            setformError(true);
        }
    };

    const DeletePosition = () => {
        if (window.confirm(`Are you sure you want to delete ${position.title} on ${position.contract}?`)) {
            fbPositionsDB
                .doc(key)
                .delete()
                .then(() => {
                    fbStorage
                        .child(key)
                        .listAll()
                        .then(folderref => {
                            folderref.items.forEach(item => {
                                item.delete();
                            });
                        });
                })
                .then(() => {
                    history.push("/positions/");
                });
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
                                <Form.Input name="title" type="text" label="Title" onChange={HandleTextInput} value={position.title} />
                                <Form.Input name="level" type="text" label="Level" onChange={HandleTextInput} value={position.level} />
                                <Form.Input name="location" type="text" label="Location" onChange={HandleTextInput} value={position.location} />
                            </Form.Group>
                            <Form.TextArea name="skill_summary" label="Skill Summary" onChange={HandleTextInput} value={position.skill_summary} />
                            <Form.TextArea name="description" label="Description" onChange={HandleTextInput} value={position.description} />
                            <Header>Documents</Header>
                            <Segment>
                                <Form.Group inline>
                                    <label>Add document:</label>
                                    <Form.Input name="doc_filename" type="file" multiple onChange={HandleFileUpload} />
                                </Form.Group>
                                <Files deletable id={id} filecounter={filecounter} />
                            </Segment>
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
                            <Button type="submit" icon="save" positive content="Update" onClick={UpdatePosition} />
                            <Button type="submit" icon="trash" negative content="Delete" onClick={DeletePosition} />
                            <Button type="submit" icon="cancel" content="Cancel" onClick={() => history.goBack()} />
                        </Segment>
                    </Form>
                </Segment>
            </Container>
        </>
    );
}
