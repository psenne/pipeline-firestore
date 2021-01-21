import React, { Component } from "react";
import { format } from "date-fns";
import history from "../modules/history";
import { Link } from "react-router-dom";
import { Grid, Header, Segment, Tab } from "semantic-ui-react";
import Markdown from "markdown-to-jsx";
import classnames from "classnames";
import { fbFlagNotes, fbAuditTrailDB, fbCandidatesDB } from "../firebase.config";
import FlagMessage from "../CommonComponents/FlagMessage";
import { tmplCandidate } from "../constants/candidateInfo";
import Files from "../CommonComponents/Files";

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

        this.unsubSubmissions = fbCandidatesDB
            .doc(candidateID)
            .collection("submitted_positions")
            .onSnapshot(docs => {
                var tmpitems = [];
                docs.forEach(submission => {
                    tmpitems.push({ key: submission.id, info: submission.data() });
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
                            <Files candidateID={this.props.candidateID} filenames={candidate.filenames} />
                        </Segment>

                        {submissions.length > 0 && (
                            <Segment vertical padded>
                                <h3>Position submissions</h3>
                                {submissions.map(submission => {
                                    const pkey = submission.key;
                                    const position = submission.info;
                                    const pid = position.position_id ? `(${position.position_id})` : "";

                                    return (
                                        <div key={pkey}>
                                            <Link to={`/positions/${pkey}`}>
                                                {position.position_contract}, {position.position_title} {pid} - submitted on {format(position.submission_date.toDate(), "MMM d, yyyy")}
                                            </Link>
                                        </div>
                                    );
                                })}
                            </Segment>
                        )}
                    </Segment>
                )}
            </>
        );
    }
}

export default CandidateProfile;
