import React, { useState, useEffect } from "react";
import { fbPositionsDB } from "../firebase.config";
import { Link } from "react-router-dom";
import { Segment, Header, Label, Icon } from "semantic-ui-react";
import classnames from "classnames";
import { format } from "date-fns";
import Markdown from "markdown-to-jsx";


function PositionSummary({ position }) {
    const [submissions, setsubmissions] = useState([]);
    const key  = position.key;
    
    useEffect(() => {
        async function GetSubmissions() {
            const candidates = await fbPositionsDB.doc(key).collection("submitted_candidates").get();
            const subs = candidates.docs.map(candidate => {
                return { key: candidate.id, info: candidate.data() };
            });
            setsubmissions(subs);
        }

        GetSubmissions()
    }, [key]);

    const position_id = position.info.position_id ? `(${position.info.position_id})` : "";
    const contract = position.info.contract ? `${position.info.contract} - ` : "";
    const level = position.info.level ? position.info.level : "";
    const dash = position.info.level && position.info.skill_summary ? "-" : "";
    const location = position.info.location ? `Location: ${position.info.location}` : "";
    const created = position.info.added_on ? (
        <Header color="grey" size="tiny" textAlign="center" attached="bottom">
            <Icon name="wait" />
            Created on {format(position.info.added_on.toDate(), "MMM d, yyyy")}
        </Header>
    ) : (
        ""
    );

    return (
        <div key={position.key} className={classnames({ "candidate-submitted": submissions.length > 0 }, "candidate-table-row")}>
            <Segment attached>
                <Link to={`/positions/${position.key}`}>
                    <Header>
                        <Header.Content>
                            {contract} {position.info.title} {position_id}
                        </Header.Content>
                        <Header.Subheader>
                            <div>
                                {level} {dash} {position.info.skill_summary}
                            </div>
                            <div>{location}</div>
                        </Header.Subheader>
                    </Header>
                    <div>
                        <Markdown>{position.info.description}</Markdown>
                    </div>
                </Link>
                {submissions.length > 0 && (
                    <Header size="small">
                        Candidates submitted:
                        {submissions.map(candidate => {
                            return (
                                <Link key={candidate.key} to={`/candidates/${candidate.key}`}>
                                    <Label color="blue" key={candidate.key} content={candidate.info.candidate_name} icon="user secret" />
                                </Link>
                            );
                        })}
                    </Header>
                )}
            </Segment>
            {created}
        </div>
    );
}

export default PositionSummary;
