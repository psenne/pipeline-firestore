import React from "react";
import history from "../modules/history";
import firebase, { fbCandidatesDB, fbStorage } from "../firebase.config";
import { tmplCandidate } from "../constants/candidateInfo";
import NavBar from "../NavBar";
import ContractDropdown from "../CommonComponents/ContractDropdown";
import { Form, Container, Segment, Button, Message, Header, Tab } from "semantic-ui-react";

export default class AddCandidateForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            candidate: Object.assign({}, tmplCandidate),
            files: [],
            formError: false
        };

        this.HandleTextInput = this.HandleTextInput.bind(this);
        this.HandleTextInputUpper = this.HandleTextInputUpper.bind(this);
        this.HandlePContractInput = this.HandlePContractInput.bind(this);
        this.HandleFileUpload = this.HandleFileUpload.bind(this);
        this.ValidateAndSubmit = this.ValidateAndSubmit.bind(this);
        this.updateSelectedCandidate = this.updateSelectedCandidate.bind(this);
    }

    updateSelectedCandidate(name, value) {
        this.setState(prevState => {
            let candidateinfo = prevState.candidate; //get candidate info
            candidateinfo[name] = value; //update with onChange info

            return { candidate: candidateinfo };
        });
    }

    HandleTextInput(ev) {
        const name = ev.target.name;
        const value = ev.target.value;
        this.updateSelectedCandidate(name, value);
    }

    HandleTextInputUpper(ev) {
        const name = ev.target.name;
        const value = ev.target.value;

        this.updateSelectedCandidate(name, value.toUpperCase());
    }

    //generic callback for dropdowns
    HandlePContractInput(value) {
        this.updateSelectedCandidate("potential_contracts", value);
    }

    HandleFileUpload(ev) {
        //add files to state for later uploading
        const files = ev.target.files;
        this.setState({
            files
        });

        //add filenames to candidate info for later retrieving
        let filenames = [];
        for (var i = 0; i < files.length; i++) {
            filenames.push(files[i].name);
        }
        this.updateSelectedCandidate("filenames", filenames);
    }

    //callback function when form editing is done.
    updateDB() {
        const { candidate, files } = this.state;
        const { currentuser } = this.props;

        candidate["created_by"] = currentuser.displayName;
        candidate["created_date"] = firebase.firestore.FieldValue.serverTimestamp();
        candidate["modified_by"] = currentuser.displayName;
        candidate["modified_date"] = firebase.firestore.FieldValue.serverTimestamp();

        fbCandidatesDB.add(candidate).then(newcandidate => {
            const key = newcandidate.id;
            const uploadedFiles = [];

            for (var i = 0; i < files.length; i++) {
                let file = files[i];
                const fileRef = fbStorage.child(key + "/" + file.name);
                uploadedFiles.push(fileRef.put(file, { contentType: file.type })); //add file upload promise to array, so that we can use promise.all() for one returned promise
            }
            Promise.all(uploadedFiles).then(() => {
                history.push("/candidates/" + key); //wait until all files have been uploaded, then go to profile page.
            });
        });
    }

    // only required fields are first and last name of candidate. If those aren't set return false and show error message
    ValidateAndSubmit() {
        this.setState(
            {
                formError: false
            },
            () => {
                const candidate = this.state.candidate;

                if (candidate.firstname.length > 0 && candidate.lastname.length > 0) {
                    this.updateDB();
                } else {
                    this.setState({
                        formError: true
                    });
                }
            }
        );
    }

    render() {
        const { candidate } = this.state;

        const panes = [
            {
                menuItem: { key: "notes", icon: "sticky note outline", content: "Notes" },
                render: () => (
                    <Tab.Pane>
                        <Form.TextArea name="notes" onChange={this.HandleTextInput} value={candidate.notes} />
                        {/* <Form.TextArea name="next_steps" label="Next Steps" onChange={this.HandleTextInput} value={candidate.next_steps} /> */}
                    </Tab.Pane>
                )
            },
            {
                menuItem: { key: "resume", icon: "file text", content: "Resume Text" },
                render: () => (
                    <Tab.Pane>
                        <Form.TextArea name="resume_text" onChange={this.HandleTextInput} value={candidate.resume_text} />
                    </Tab.Pane>
                )
            }
        ];

        return (
            <>
                <NavBar active="candidates" />
                <Container>
                    <Segment>
                        <Form>
                            <Header>Personal Information</Header>
                            <Segment>
                                <Form.Input name="firstname" type="text" required placeholder="First name" onChange={this.HandleTextInput} value={candidate.firstname} />
                                <Form.Input name="lastname" type="text" required placeholder="Last name" onChange={this.HandleTextInput} value={candidate.lastname} />
                                <Form.Input name="emailaddress" type="email" label="Email Address:" icon="mail" iconPosition="left" placeholder="Email Address" onChange={this.HandleTextInput} value={candidate.emailaddress} />
                                <Form.Input name="telephone" type="tel" label="Phone Number:" icon="phone" iconPosition="left" placeholder="XXX-XXX-XXXX" onChange={this.HandleTextInput} value={candidate.telephone} />
                                <Form.Input name="prefered_location" type="text" label="Prefered work location:" icon="globe" iconPosition="left" placeholder="City / State" onChange={this.HandleTextInput} value={candidate.prefered_location} />
                            </Segment>

                            <Header>Hiring Information</Header>
                            <Segment>
                                <Form.Group inline>
                                    <Form.Input inline type="text" name="skill" label="Skill / Role:" onChange={this.HandleTextInput} value={candidate.skill} /> <Form.Input inline type="text" name="current_company" label="with current company" onChange={this.HandleTextInput} value={candidate.current_company} />
                                </Form.Group>
                                <Form.Input inline type="text" name="level" label="Level:" onChange={this.HandleTextInput} value={candidate.level} />
                                <Form.Input inline type="text" name="current_contract" label="Current contract:" onChange={this.HandleTextInput} value={candidate.current_contract} />
                                <Form.Group inline>
                                    <label>Potential contracts: </label>
                                    <ContractDropdown multiple selection onChange={this.HandlePContractInput} value={candidate.potential_contracts} />
                                </Form.Group>
                                <Form.Group inline>
                                    <label>Add document:</label>
                                    <Form.Input name="doc_filename" type="file" multiple onChange={this.HandleFileUpload} />
                                </Form.Group>
                            </Segment>
                            <Header>Notes</Header>
                            <Segment>
                                <Tab panes={panes} />
                                <Form.Input name="found_by" type="text" label="Referred By" onChange={this.HandleTextInput} value={candidate.found_by} />
                            </Segment>
                        </Form>
                    </Segment>
                    <Segment>
                        {this.state.formError && <Message error floating compact icon="warning" header="Required fields missing" content="First and last names are both required." />}
                        <Button type="submit" icon="save" positive content="Add" onClick={this.ValidateAndSubmit} />
                    </Segment>
                </Container>
            </>
        );
    }
}
