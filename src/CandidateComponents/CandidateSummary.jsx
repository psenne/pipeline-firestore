import React, { useState, useEffect } from "react";
import { fbCandidatesDB } from "../firebase.config";
import { Link } from "react-router-dom";
import { Icon, Header, Segment, Label } from "semantic-ui-react";
import { format } from "date-fns";
import Markdown from "markdown-to-jsx";
import MiniToolbar from "./MiniToolbar";
import classnames from "classnames";

function CandidateSummary({ candidate, statuses }) {
    const [submissions, setsubmissions] = useState([]);
    const key = candidate.key;

    useEffect(() => {
        const unsub = fbCandidatesDB
            .doc(key)
            .collection("submitted_positions")
            .onSnapshot(docs => {
                var tmpitems = [];
                docs.forEach(submission => {
                    tmpitems.push({ key: submission.id, info: submission.data() });
                });
                setsubmissions(tmpitems);
            });

        return () => unsub();
    }, [key]);

    const potential_contracts = candidate.info.potential_contracts ? candidate.info.potential_contracts.join(", ") : "";
    const company = candidate.info.company ? `with ${candidate.info.company}` : "";
    const current_contract = candidate.info.current_contract ? `on ${candidate.info.current_contract}` : "";
    const created = candidate.info.created_by ? `Created on ${format(candidate.info.created_date.toDate(), "MMM d, yyyy")} by ${candidate.info.created_by}` : "";
    const updated = candidate.info.modified_by ? `Updated on ${format(candidate.info.modified_date.toDate(), "MMM d, yyyy")} by ${candidate.info.modified_by}` : "";
    const status_color = statuses.filter(s => s.name === candidate.info.status)[0];

    return (
        <Segment.Group key={candidate.key} className={classnames({ archived: candidate.info.archived === "archived" })}>
            <MiniToolbar attached="top" ckey={candidate.key} candidate={candidate.info} />
            <Segment key={key} attached padded color={status_color && status_color.color}>
                <Link to={`/candidates/${key}`}>
                    <Header>
                        <Header.Content>
                            {candidate.info.firstname} {candidate.info.lastname}
                        </Header.Content>

                        <Header.Subheader>
                            {candidate.info.level} {candidate.info.skill} {company} {current_contract}
                        </Header.Subheader>
                    </Header>
                    <div className="candidate-table-row-info">
                        <div className="candidate-table-field">Potential contracts:</div> {potential_contracts}
                    </div>
                    <div className="candidate-table-row-info">
                        <div className="candidate-table-field">Notes:</div>
                        <Markdown>{candidate.info.notes}</Markdown>
                    </div>
                    <div className="candidate-table-row-info">
                        <div className="candidate-table-field">Next steps:</div>
                        <Markdown>{candidate.info.next_steps}</Markdown>
                    </div>
                </Link>
                {submissions.length > 0 && (
                    <Header size="small">
                        Submitted to:
                        {submissions.map(submission => {
                            return (
                                <Link key={submission.key} to={`/positions/${submission.info.position_key}`}>
                                    <Label color="blue" key={submission.key}>
                                        <Icon name="briefcase" /> {submission.info.position_contract} - {submission.info.position_title}
                                    </Label>
                                </Link>
                            );
                        })}
                    </Header>
                )}
            </Segment>
            <Header color="grey" size="tiny" textAlign="center" attached="bottom">
                <Icon name="wait" />
                {created} | {updated}
            </Header>
        </Segment.Group>
    );
}

export default CandidateSummary;
