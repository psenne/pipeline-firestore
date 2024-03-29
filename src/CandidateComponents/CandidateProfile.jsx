import React, { Component } from "react";
import { format } from "date-fns";
import history from "../modules/history";
import { Link } from "react-router-dom";
import { Grid, Header, Segment, Tab, Icon, Button } from "semantic-ui-react";
import Markdown from "markdown-to-jsx";
import classnames from "classnames";
import firebase, { fbFlagNotes, fbAuditTrailDB, fbCandidatesDB, fbSubmissionsDB } from "../firebase.config";
import FlagMessage from "../CommonComponents/FlagMessage";
import CommentSection from "../CommonComponents/CommentSection";
import { tmplCandidate, tmplSubmission } from "../constants";
import Files from "../CommonComponents/Files";
import SubmissionModal from "./SubmissionModal";

class CandidateProfile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            candidate: { ...tmplCandidate },
            submissions: [],
            showResume: false
        };
    }

    componentDidMount() {
        const { candidateID } = this.props;

        this.unsubCandidates = fbCandidatesDB.doc(candidateID).onSnapshot(doc => {
            if (doc.data()) {
                this.setState({
                    candidate: { ...tmplCandidate, ...doc.data() }
                });
            } else {
                history.push("/candidates/");
            }
        });

        this.unsubSubmissions = fbSubmissionsDB.where("candidate_key", "==", candidateID).onSnapshot(docs => {
            var tmpitems = [];
            docs.forEach(submission => {
                const info = { ...tmplSubmission, ...submission.data() };
                tmpitems.push({ id: submission.id, ...info });
            });

            this.setState({
                submissions: [...tmpitems]
            });
        });
    }

    componentWillUnmount() {
        this.unsubCandidates();
        this.unsubSubmissions();
    }

    SelectPosition = position => {
        const { candidate } = this.state;
        const { candidateID } = this.props;
        const candidate_name = candidate.firstname + " " + candidate.lastname;
        const updatedSubmissionInfo = {
            submission_date: firebase.firestore.FieldValue.serverTimestamp(),
            candidate_key: candidateID,
            candidate_name: candidate_name,
            position_id: position.position_id,
            position_key: position.key,
            position_title: position.title,
            position_level: position.level,
            contract: position.contract
        };

        //add the submission to the database
        fbSubmissionsDB.add(updatedSubmissionInfo).catch(error => {
            console.log(error);
        });
    };

    RemoveCandidateFromPosition = submissionid => {
        //remove the submission from the database
        fbSubmissionsDB
            .doc(submissionid)
            .delete()
            .catch(error => {
                console.log(error);
            });
    };

    removeFlag = ev => {
        ev.stopPropagation();
        const { candidate } = this.state;
        const { currentuser, candidateID } = this.props;
        const flag_history = candidate.isFlagged
            ? [
                  {
                      actioned_to: candidate.actioned_to,
                      flag_note: candidate.flag_note,
                      flagged_by: candidate.flagged_by,
                      flagged_on: candidate.flagged_on
                  },
                  ...candidate.flag_history
              ]
            : candidate.flag_history; //only add new historical flag if candidate is currently flagged, otherwise it adds a blank flag
        const candidate_name = candidate.firstname + " " + candidate.lastname;
        const now = new Date();
        let candidateflag = {};
        let newEvent = {};

        const removeflag = window.confirm(`Are you sure you want to remove the flag for ${candidate_name}?`);

        if (removeflag) {
            candidateflag = {
                isFlagged: false,
                flagged_by: "",
                flag_note: "",
                flagged_on: "",
                actioned_to: "",
                flag_history
            };
            newEvent = {
                eventdate: now.toJSON(),
                eventinfo: `${currentuser.displayName} removed flag from candidate.`,
                candidatename: candidate_name
            };

            fbFlagNotes.child(candidateID).remove();
            fbAuditTrailDB.push(newEvent);
            fbCandidatesDB.doc(candidateID).update(candidateflag);
        }
    };

    render() {
        const { candidateID } = this.props;
        const { candidate, submissions } = this.state;

        let interviewed = "Candidate has not been interviewed.";
        let loi_message = "LOI has not been sent.";
        let referedby = "";
        let company_info = "";

        let interview_date = candidate.interview_date ? format(candidate.interview_date.toDate(), "M/d/yyyy") : "";
        let loi_sent_date = candidate.loi_sent_date ? `LOI was sent on ${format(candidate.loi_sent_date.toDate(), "M/d/yyyy")}.` : "";
        let salary = candidate.salary !== "" ? atob(candidate.salary) : "";

        if (interview_date && candidate.interviewed_by.length > 0) {
            interviewed = `Interviewed on ${interview_date} by ${candidate.interviewed_by.join(", ")}.`;
        } else if (interview_date) {
            interviewed = `Interviewed on ${interview_date}.`;
        } else if (candidate.interviewed_by.length > 0) {
            interviewed = `Interviewed by ${candidate.interviewed_by.join(", ")}.`;
        } else {
            interviewed = "Candidate has not been interviewed.";
        }

        if (candidate.found_by) {
            referedby = `Referred by ${candidate.found_by}`;
        }

        if (candidate.current_company) {
            company_info = ` with ${candidate.current_company}`;
        }

        if (candidate.loi_status === "accepted") {
            loi_message = `${loi_sent_date} LOI was accepted.`;
        } else if (candidate.loi_status === "sent") {
            loi_message = `${loi_sent_date}`;
        } else {
            loi_message = "LOI has not been sent.";
        }

        const panes = [
            {
                menuItem: { key: "notes", icon: "sticky note outline", content: "Notes" },
                render: () => (
                    <Tab.Pane>
                        <Grid>
                            <Grid.Row>
                                <Grid.Column>
                                    <div className="markdown">
                                        <h3>Management Notes:</h3>
                                        <Markdown>{candidate.notes}</Markdown>
                                    </div>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column>
                                    <div className="markdown">
                                        <h3>Next Steps:</h3>
                                        <Markdown>{candidate.next_steps}</Markdown>
                                    </div>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Tab.Pane>
                )
            },
            {
                menuItem: { key: "resume", icon: "file text", content: "Resume Text" },
                render: () => (
                    <Tab.Pane>
                        <Grid>
                            <Grid.Row>
                                <Grid.Column>
                                    <Markdown>{candidate.resume_text}</Markdown>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Tab.Pane>
                )
            }
        ];

        return (
            <>
                {candidate && (
                    <Segment attached padded className={classnames(`status-${candidate.archived}`)}>
                        <Segment vertical padded>
                            <Grid>
                                {candidate.isFlagged && (
                                    <Grid.Row>
                                        <FlagMessage candidate={{ id: candidateID, flag_history: candidate.flag_history, flag_note: candidate.flag_note, flagged_by: candidate.flagged_by, flagged_on: candidate.flagged_on, actioned_to: candidate.actioned_to }} onDismiss={this.removeFlag} />
                                    </Grid.Row>
                                )}
                                <Grid.Row verticalAlign="middle" columns={2}>
                                    <Grid.Column>
                                        <Header size="huge">
                                            {candidate.firstname} {candidate.lastname}
                                            <h5>{[candidate.emailaddress, candidate.telephone].filter(Boolean).join(" / ")}</h5>
                                            <Header.Subheader>
                                                {candidate.level} {candidate.skill} {company_info}
                                            </Header.Subheader>
                                        </Header>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <span className={classnames("padded-span", `status-${candidate.status}`)}>{candidate.status.toUpperCase()}</span>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Segment>

                        <Segment vertical padded>
                            <Grid columns={2}>
                                <Grid.Row>
                                    <Grid.Column>
                                        <div>Current contract: {candidate.current_contract}</div>
                                        <div>Potential contracts: {candidate.potential_contracts.join(", ")}</div>
                                        <div>Prefered work location: {candidate.prefered_location}</div>
                                        <div>Salary: {salary}</div>
                                        <div>{referedby}</div>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <div>{interviewed}</div>
                                        <div>{loi_message}</div>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Segment>

                        <Segment vertical padded>
                            <Tab panes={panes} />
                        </Segment>
                        <Segment vertical padded className={classnames({ "form-hidden": candidate.filenames.length === 0 }, "minitoolbar-inline")}>
                            <h3>Documents</h3>
                            <Files id={candidateID} filenames={candidate.filenames} />
                        </Segment>

                        {(candidate.status === "processing" || candidate.status === "active") && (
                            <Segment vertical>
                                <h3>
                                    <Icon name="tasks" /> Position submissions
                                </h3>
                                {submissions.length === 0 && "This candidate has not been submitted to a position."}
                                {submissions.length > 0 && (
                                    <div>
                                        {submissions.map(submission => {
                                            const pid = submission.position_id ? `(${submission.position_id})` : "";
                                            const submission_date = submission.submission_date ? `- submitted on ${format(submission.submission_date.toDate(), "MMM d, yyyy")}` : "";
                                            return (
                                                <p key={submission.id}>
                                                    <Link to={`/positions/${submission.position_key}`}>
                                                        {submission.contract}, {submission.position_title} {pid} {submission_date}
                                                    </Link>
                                                    <Icon name="close" color="red" link onClick={() => this.RemoveCandidateFromPosition(submission.id)} />
                                                </p>
                                            );
                                        })}
                                    </div>
                                )}
                                <Segment basic>
                                    <SubmissionModal onSelect={this.SelectPosition}>
                                        {/* <Icon link name="plus" color="blue" title="Submit to a position" /> */}
                                        <Button basic icon labelPosition="left">
                                            <Icon name="add" color="blue" />
                                            Submit to position
                                        </Button>
                                    </SubmissionModal>
                                </Segment>
                            </Segment>
                        )}
                        <CommentSection refinfo={{ refid: candidateID, refpath: "candidates", refname: `${candidate.firstname} ${candidate.lastname}` }} />
                    </Segment>
                )}
            </>
        );
    }
}

export default CandidateProfile;
