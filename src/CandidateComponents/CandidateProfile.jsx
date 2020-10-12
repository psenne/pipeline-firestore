import React, { Component } from "react";
import { format, parseISO } from "date-fns";
import history from "../modules/history";
import { Link } from "react-router-dom";
import { Grid, Header, Segment } from "semantic-ui-react";
import classnames from "classnames";
import { fbFlagNotes, fbAuditTrailDB, fbCandidatesDB } from "../firebase.config";
import FlagMessage from "../CandidateComponents/FlagMessage";
import { tmplCandidate } from "../constants/candidateInfo";
import Files from "../CandidateComponents/Files";

class CandidateProfile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            candidate: { ...tmplCandidate }
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
    }

    componentWillUnmount() {
        this.unsubCandidates();
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
        let candidate = this.state.candidate;
        const position_keys = Object.keys(candidate.submitted_positions);
        let interviewed = "Candidate has not been interviewed.";
        let loi_message = "LOI has not been sent.";
        let referedby = "";
        let company_info = "";

        let interview_date = candidate.interview_date ? format(candidate.interview_date.toDate(), "M/d/yyyy") : "";
        let loi_sent_date = candidate.loi_sent_date ? `LOI was sent on ${format(candidate.loi_sent_date.toDate(), "M/d/yyyy")}.` : "";
        let salary = candidate.salary !== "" ? atob(candidate.salary) : "";

        if (interview_date && candidate.interviewed_by.length > 0) {
            interviewed = `Interviewed on ${interview_date} by ${candidate.interviewed_by.join(", ")}.`;
        }
        else if (interview_date) {
            interviewed = `Interviewed on ${interview_date}.`;
        }
        else if (candidate.interviewed_by.length > 0) {
            interviewed = `Interviewed by ${candidate.interviewed_by.join(", ")}.`;
        }
        else{
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
        } 
        else if (candidate.loi_status === "sent") {
            loi_message = `${loi_sent_date}`;
        } 
        else {
            loi_message = "LOI has not been sent.";
        }
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
                                        </Header>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <span className={classnames("padded-span", `status-${candidate.status}`)}>{candidate.status.toUpperCase()}</span>
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row columns={1}>
                                    <Grid.Column>
                                        <Header.Subheader>
                                            {candidate.level} {candidate.skill} {company_info}
                                        </Header.Subheader>
                                        <Header.Subheader>{referedby}</Header.Subheader>
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
                                    </Grid.Column>
                                    <Grid.Column>
                                        <div>{interviewed}</div>
                                        <div>{loi_message}</div>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Segment>

                        <Segment vertical padded>
                            <Grid>
                                <Grid.Row>
                                    <Grid.Column>
                                        <h3>Management Notes:</h3>
                                        {candidate.notes}
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row>
                                    <Grid.Column>
                                        <h3>Next Steps:</h3>
                                        {candidate.next_steps}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Segment>
                        <Segment vertical padded className={classnames({ "form-hidden": candidate.filenames.length === 0 }, "minitoolbar-inline")}>
                            <h3>Documents</h3>
                            <Files candidateID={this.props.candidateID} filenames={candidate.filenames} />
                        </Segment>
                        <Segment vertical padded className={classnames({ "form-hidden": position_keys.length === 0 }, "minitoolbar-inline")}>
                            <h3>Position submissions</h3>
                            {position_keys.map(key => {
                                const position = candidate.submitted_positions[key];
                                const pid = position.position_id ? `(${position.position_id})` : "";
                                return (
                                    <div key={key}>
                                        <Link to={`/positions/${key}`}>
                                            {position.position_contract}, {position.position_name} {pid} - submitted on {format(parseISO(position.submission_date), "MMM d, yyyy")}
                                        </Link>
                                    </div>
                                );
                            })}
                        </Segment>
                    </Segment>
                )}
            </>
        );
    }
}

export default CandidateProfile;
