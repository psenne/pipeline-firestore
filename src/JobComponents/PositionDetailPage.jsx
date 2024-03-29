import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fbPositionsDB, fbSubmissionsDB } from "../firebase.config";
import { tmplPosition, tmplSubmission } from "../constants";
import history from "../modules/history";
import { format } from "date-fns";
import { Header, Segment, Container, Menu, Icon } from "semantic-ui-react";
import Markdown from "markdown-to-jsx";
import Files from "../CommonComponents/Files";
import classnames from "classnames";

export default function PositionDetailPage({ match }) {
    const [position, setposition] = useState(null);
    const [pageloading, setpageloading] = useState(false);
    const [submissions, setsubmissions] = useState([]);
    const { id } = useParams();
    const key = id;

    useEffect(() => {
        var unsub = fbPositionsDB.doc(key).onSnapshot(doc => {
            if (doc.exists) {
                setposition({ ...tmplPosition, ...doc.data() });
            } else {
                history.push("/");
            }
        });

        return () => unsub();
    }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setpageloading(!pageloading);
    }, [position]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const unsub = fbSubmissionsDB.where("position_key", "==", key).onSnapshot(docs => {
            var tmpitems = [];
            docs.forEach(submission => {
                const info = { ...tmplSubmission, ...submission.data() };
                tmpitems.push({ id: submission.id, ...info });
            });
            setsubmissions(tmpitems);
        });

        return () => unsub();
    }, [key]);

    // useEffect(() => {
    //     const unsub = fbPositionsDB
    //         .doc(key)
    //         .collection("submitted_candidates")
    //         .onSnapshot(docs => {
    //             var tmpitems = [];
    //             docs.forEach(candidate => {
    //                 tmpitems.push({ key: candidate.id, info: candidate.data() });
    //             });
    //             setsubmissions(tmpitems);
    //         });

    //     return () => unsub();
    // }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

    if (position) {
        const position_id = position.position_id ? `Position #${position.position_id}` : "";
        const contract = position.contract ? `${position.contract} ` : "";
        const level = position.level ? `${position.level}` : "";
        const skill_summary = position.skill_summary ? (
            <Segment vertical>
                <Markdown>{position.skill_summary}</Markdown>
            </Segment>
        ) : (
            ""
        );
        const location = position.location ? `Location: ${position.location}` : "";
        const created = position.added_on ? (
            <Header color="grey" size="tiny" textAlign="center" attached="bottom">
                <Icon name="wait" />
                Created on {format(position.added_on.toDate(), "MMM d, yyyy")}
            </Header>
        ) : (
            ""
        );
        const description = position.description ? (
            <Segment vertical>
                <Markdown>{position.description}</Markdown>
            </Segment>
        ) : (
            ""
        );

        const setArchiveStatusText = position.archived === "archived" ? "Unarchive" : "Archive";

        function ToggleArchived() {
            const archived = !position.archived;
            fbPositionsDB.doc(key).update({ archived });
        }

        return (
            <Container className={classnames({ archived: position.archived })}>
                <Menu attached="top" size="huge" borderless className="no-print">
                    <Menu.Item as={Link} to={`/positions/${key}/edit`} icon="edit" className="minitoolbar-edit"></Menu.Item>
                    <Menu.Item as="a" title={setArchiveStatusText} className="minitoolbar-edit" icon="archive" onClick={ToggleArchived}></Menu.Item>
                </Menu>
                <Segment attached>
                    <Segment vertical>
                        <Header>
                            <Header.Content>
                                {level} {position.title}
                            </Header.Content>
                            <Header.Subheader>
                                <div>Contract: {contract} </div>
                                <div>{position_id}</div>
                                <div>{location}</div>
                            </Header.Subheader>
                        </Header>
                        {skill_summary}
                    </Segment>
                    {description}
                    <Segment vertical padded className="minitoolbar-inline">
                        <Files deletable id={id} />
                    </Segment>

                    {submissions.length > 0 && (
                        <Segment vertical>
                            <Header size="small">
                                <Header.Content>Candidates submitted:</Header.Content>
                                <Header.Subheader>
                                    {submissions.map(submission => {
                                        console.log(submission);
                                        return (
                                            <div key={submission.id}>
                                                <Link to={`/candidates/${submission.candidate_key}`}>{submission.candidate_name}</Link> on {format(submission.submission_date.toDate(), "MMM d, yyyy")}
                                            </div>
                                        );
                                    })}
                                </Header.Subheader>
                            </Header>
                        </Segment>
                    )}
                </Segment>
                {created}
            </Container>
        );
    } else {
        return null;
    }
}
