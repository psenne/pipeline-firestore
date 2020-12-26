import React, { useState, useEffect, useContext } from "react";
import { format } from "date-fns";
import history from "../modules/history";
import { Link } from "react-router-dom";
import firebase, { fbPositionsDB, fbCandidatesDB } from "../firebase.config";
import tmplPosition from "../constants/positionInfo";
import NavBar from "../NavBar";
import ContractDropdown from "../CandidateComponents/ContractDropdown";
import CandidateDropdown from "../CandidateComponents/CandidateDropdown";
import UserContext from "../contexts/UserContext";
import { Form, Container, Segment, Button, Header, Message, Icon } from "semantic-ui-react";

export default function EditPositionForm({ match }) {
    const key = match.params.id;
    const currentuser = useContext(UserContext);
    const [position, setposition] = useState(Object.assign({}, tmplPosition));
    const [addedCandidates, setaddedCandidates] = useState([]); //candidates that are added when using this form
    const [removedCandidates, setremovedCandidates] = useState([]); //candidates that are removed when using this form
    const [formError, setformError] = useState(false);

    useEffect(() => {
        const key = match.params.id;
        const unsubPosition = fbPositionsDB.doc(key).onSnapshot(pos => {
            if (pos.exists) {
                setposition({...pos.data()})
            } 
            else {
                unsubPosition();
                history.push("/positions/add");
            }
        });
        return () => {
            unsubPosition(); 
        };
    }, [match.params.id]);

    useEffect(() => {
        const key = match.params.id;
        const unsubSubmitted = fbPositionsDB.doc(key).collection('submitted_candidates')
            .orderBy("candidate_name")
            .onSnapshot(candidates => {
                let tmpitems = [];
                candidates.forEach(function(candidate) {
                    tmpitems.push({ key: candidate.id, info:{ ...candidate.data()} });
                });
                setaddedCandidates([...tmpitems]);
            });
        return () => {
            unsubSubmitted();
        };
    }, [match.params.id]);

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

    const AddCandidateToPosition = candidate => {
        const submission_date = firebase.firestore.Timestamp.fromDate(new Date());
        const candidate_name = candidate.info.firstname + " " + candidate.info.lastname;
        const tmpCandidate = { key: candidate.key, info: { submission_date, candidate_name } };
        setaddedCandidates([{ ...tmpCandidate }, ...addedCandidates]);
    };

    const RemoveCandidateFromPosition = ckey => {
        const selectedCandidate = addedCandidates.filter(candidate => candidate.key === ckey); //get removed candidate info for prompt and fbCandidate update
        const remainingCandidates = addedCandidates.filter(candidate => candidate.key !== ckey); //remove the candidate from submission list
        if (window.confirm(`Are you sure you want to unsubmit ${selectedCandidate[0].info.candidate_name}?`)) {
            setaddedCandidates([...remainingCandidates]);
            setremovedCandidates([...selectedCandidate, ...removedCandidates]); //add candidate to to-be-removed list
        }
    };

    const UpdatePosition = () => {
        if (position.title && position.contract) {
            position["modified_by"] = currentuser.displayName;
            position["modified_on"] = firebase.firestore.FieldValue.serverTimestamp();

            fbPositionsDB.doc(key).update(position).then(() => {
                var batch = firebase.firestore().batch();
                
                addedCandidates.forEach(submission => {
                    const ckey = submission.key; //candidate key
                    const candidateRef = fbCandidatesDB.doc(ckey).collection("submitted_positions").doc(key);
                    const positionRef = fbPositionsDB.doc(key).collection("submitted_candidates").doc(ckey)
                    const updatedSubmissionInfo = {
                        submission_date: submission.info.submission_date,
                        candidate_id: ckey,
                        candidate_name: submission.info.candidate_name,
                        position_id: position.position_id,
                        position_title: position.title,
                        position_contract: position.contract
                    };
                    batch.set(candidateRef, updatedSubmissionInfo);
                    batch.set(positionRef, updatedSubmissionInfo);
                });

                removedCandidates.forEach(submission => {
                    const ckey = submission.key; //candidate key
                    const candidateRef = fbCandidatesDB.doc(ckey).collection("submitted_positions").doc(key);
                    const positionRef = fbPositionsDB.doc(key).collection("submitted_candidates").doc(ckey);

                    batch.delete(candidateRef);
                    batch.delete(positionRef);
                });

                batch.commit().then(() => {
                    history.push("/positions/");
                })
                .catch(err => console.log(err));
            });
        } 
        else {
            setformError(true);
        }
    };

    const DeletePosition = () => {
        if (window.confirm(`Are you sure you want to delete ${position.title} on ${position.contract}?`)) {
            fbPositionsDB.doc(key).delete().then(()=>{
                // var finishedDeletion = []
                // addedCandidates.forEach(submission => {
                //     finishedDeletion.push(fbPositionsDB.doc(`${key}/submitted_candidates/${submission.key}`).delete())
                // });
                // Promise.all(finishedDeletion).then(()=>{
                //     history.push("/positions/");
                // })
                history.push("/positions/");
            })
        }
    };

    return (
        <>
            <NavBar active="positions" />
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
                            <Form.Group unstackable widths={2}>
                                <Form.Input name="skill_summary" type="text" label="Skill Summary" onChange={HandleTextInput} value={position.skill_summary} />
                            </Form.Group>
                            <Form.TextArea name="description" label="Description" onChange={HandleTextInput} value={position.description} />
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
                            <Header>Candidate submission</Header>
                            {addedCandidates.map(candidate => {
                                return (
                                    <p key={candidate.key}>
                                        <Link to={`/candidates/${candidate.key}`}>
                                            {candidate.info.candidate_name} - submitted on {format(candidate.info.submission_date.toDate(), "MMMM d, yyyy")}
                                        </Link>
                                        <Icon name="close" color="red" link onClick={() => RemoveCandidateFromPosition(candidate.key)} />
                                    </p>
                                );
                            })}

                            <CandidateDropdown selection filters={[{ archived: ["current"] }, { status: ["active", "processing"] }]} removecandidates={addedCandidates} onChange={AddCandidateToPosition} />
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
