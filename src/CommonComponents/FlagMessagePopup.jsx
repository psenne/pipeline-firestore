import React, { Component } from "react";
import { Modal, Header, Icon, Button, Form } from "semantic-ui-react";
import { fbFlagNotes, fbCandidatesDB } from "../firebase.config";
import { tmplCandidate } from "../constants/candidateInfo";
import tmplFlagNote from "../constants/flagnote";

export default class FlagMessagePopup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            text: "",
            actioned_to: "",
            flaginfo: { ...tmplFlagNote },
            candidateinfo: { ...tmplCandidate },
            auditinfo: "",
            iseditingnote: false
        };
    }

    componentDidMount() {
        const { flagkey } = this.props;

        this.unsubCandidates = fbCandidatesDB.doc(flagkey).onSnapshot(doc => {
            this.setState({
                candidateinfo: { ...tmplCandidate, ...doc.data() } //replace template with firebase data
            });
        });

        fbFlagNotes.child(flagkey).on("value", data => {
            if (data.val()) {
                this.setState({
                    flaginfo: data.val(),
                    text: data.val().flag_note,
                    actioned_to: data.val().actioned_to
                });
            }
        });
    }

    componentWillUnmount() {
        fbFlagNotes.off("value");
        this.unsubCandidates();
    }

    updateText = ev => {
        this.setState({
            text: ev.currentTarget.value,
            iseditingnote: true
        });
    };

    updateAction = ev => {
        this.setState({
            actioned_to: ev.currentTarget.value,
            iseditingnote: true
        });
    };

    addFlagMessage(ev, flag_note, currentuser) {
        ev.stopPropagation();
        const { candidateinfo, actioned_to } = this.state;
        const { flagkey } = this.props;
        const flag_history = candidateinfo.isFlagged
            ? [
                  {
                      actioned_to: candidateinfo.actioned_to,
                      flag_note: candidateinfo.flag_note,
                      flagged_by: candidateinfo.flagged_by,
                      flagged_on: candidateinfo.flagged_on
                  },
                  ...candidateinfo.flag_history
              ]
            : candidateinfo.flag_history; //only add new historical flag if candidate is currently flagged, otherwise it adds a blank flag
        const candidate_name = candidateinfo.firstname + " " + candidateinfo.lastname;
        const now = new Date();
        let flag = {};
        let candidateflag = {};

        if (flag_note) {
            flag = {
                candidate_name,
                actioned_to,
                flag_note,
                flagged_by: currentuser.displayName,
                flagged_on: now.toJSON()
            };
            candidateflag = {
                isFlagged: true,
                actioned_to,
                flagged_by: currentuser.displayName,
                flag_note,
                flagged_on: now.toJSON(),
                flag_history
            };


            fbFlagNotes.child(flagkey).update(flag);
            fbCandidatesDB.doc(flagkey).update(candidateflag);
        } else {
            candidateflag = {
                isFlagged: false,
                flagged_by: "",
                flag_note: "",
                flagged_on: "",
                actioned_to: "",
                flag_history
            };

            fbFlagNotes.child(flagkey).remove();
            fbCandidatesDB.doc(flagkey).update(candidateflag);
        }
        this.props.handleClose();
    }

    AddNote = ev => {
        const { text } = this.state;
        const { currentuser } = this.props;
        this.addFlagMessage(ev, text, currentuser);
        this.setState({ text: "", iseditingnote: false });
    };

    RemoveNote = ev => {
        const { currentuser } = this.props;
        this.addFlagMessage(ev, "", currentuser);
        this.setState({ text: "", iseditingnote: false });
    };

    render() {
        const { text, actioned_to, candidateinfo, iseditingnote } = this.state;
        let button;
        if (candidateinfo.isFlagged) {
            if (iseditingnote) {
                button = (
                    <Button color="green" onClick={this.AddNote}>
                        <Icon name="edit" /> Edit Note
                    </Button>
                );
            } else {
                button = (
                    <Button color="red" onClick={this.RemoveNote}>
                        <Icon name="delete" /> Remove Note
                    </Button>
                );
            }
        } else {
            button = (
                <Button color="green" onClick={this.AddNote}>
                    <Icon name="checkmark" /> Add Note
                </Button>
            );
        }

        return (
            <Modal closeIcon dimmer="blurring" trigger={this.props.children} open={this.props.open} onClick={ev => ev.stopPropagation()} onClose={this.props.handleClose} size="small">
                <Header icon="flag" color="red" content={`Add follow up note for ${candidateinfo.firstname} ${candidateinfo.lastname}.`} />
                <Modal.Content>
                    <Form>
                        <Form.Input type="text" label="Action for:" fluid value={actioned_to} onChange={this.updateAction} />
                        <Form.TextArea label="Note:" value={text} onChange={this.updateText} />
                    </Form>
                </Modal.Content>
                <Modal.Actions>{button}</Modal.Actions>
            </Modal>
        );
    }
}
