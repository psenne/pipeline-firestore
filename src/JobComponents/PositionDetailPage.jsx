import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fbPositionsDB } from "../firebase.config";
import tmplPosition from "../constants/positionInfo";
import history from "../modules/history";
import { format } from "date-fns";
import { Header, Segment, Container, Menu, Icon } from "semantic-ui-react";
import Markdown from "markdown-to-jsx";
import Files from "../CommonComponents/Files";

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
        const unsub = fbPositionsDB
            .doc(key)
            .collection("submitted_candidates")
            .onSnapshot(docs => {
                var tmpitems = [];
                docs.forEach(candidate => {
                    tmpitems.push({ key: candidate.id, info: candidate.data() });
                });
                setsubmissions(tmpitems);
            });

        return () => unsub();
    }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

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

        return (
            <Container>
                <Menu attached="top" size="huge" borderless className="no-print">
                    <Menu.Item
                        onClick={() => {
                            history.goBack();
                        }}>
                        <Icon name="arrow left" />
                    </Menu.Item>
                    <Menu.Menu position="right">
                        <Menu.Item as={Link} to={`/positions/${key}/edit`} icon="edit" className="minitoolbar-edit"></Menu.Item>
                    </Menu.Menu>
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
                        <h3>Documents</h3>
                        <Files id={id} />
                    </Segment>

                    {submissions.length > 0 && (
                        <Segment vertical>
                            <Header size="small">
                                <Header.Content>Candidates submitted:</Header.Content>
                                <Header.Subheader>
                                    {submissions.map(candidate => {
                                        return (
                                            <div>
                                                <Link key={candidate.key} to={`/candidates/${candidate.key}`}>
                                                    {candidate.info.candidate_name}
                                                </Link>
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
