import React, { useState, useEffect } from "react";
import { fbPositionsDB } from "../firebase.config";
import { Link } from "react-router-dom";
import { Segment, Header, Label, Icon, Menu, Accordion, Transition } from "semantic-ui-react";
import classnames from "classnames";
import { format } from "date-fns";
import Markdown from "markdown-to-jsx";
import Files from "../CommonComponents/Files";

function PositionSummary({ position }) {
    const [submissions, setsubmissions] = useState([]);
    const [showdescription, setshowdescription] = useState(false);
    const key = position.key;

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
    }, [key]);

    const position_id = position.info.position_id ? `(${position.info.position_id})` : "";
    const setArchiveStatusText = position.info.archived === "archived" ? "Unarchive" : "Archive";

    const contract = position.info.contract ? `${position.info.contract}: ` : "";
    const level = position.info.level ? position.info.level : "";
    const location = position.info.location ? `Location: ${position.info.location}` : "";
    const created = position.info.added_on ? (
        <Header color="grey" size="tiny" textAlign="center" attached="bottom">
            <Icon name="wait" />
            Created on {format(position.info.added_on.toDate(), "MMM d, yyyy")}
        </Header>
    ) : (
        ""
    );
    const more_info = position.info.description ? (
        <Accordion>
            <Accordion.Title
                onClick={ev => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    setshowdescription(!showdescription);
                }}>
                <Icon name="expand arrows alternate"></Icon>more info
            </Accordion.Title>
            <Transition visible={showdescription} animation="slide down" duration={250}>
                <Accordion.Content active={showdescription}>
                    <Markdown>{position.info.description}</Markdown>
                </Accordion.Content>
            </Transition>
        </Accordion>
    ) : (
        ""
    );

    function ToggleArchived() {
        const archived = !position.info.archived;
        fbPositionsDB.doc(key).update({ archived });
    }

    return (
        <div key={position.key} className={classnames({ archived: position.info.archived }, "candidate-table-row")}>
            <Menu attached icon className="minitoolbar-inline">
                <Menu.Item as={Link} title="Edit position" className="minitoolbar-edit" to={`/positions/${key}/edit`} icon="edit"></Menu.Item>
                <Menu.Item as="a" title={setArchiveStatusText} className="minitoolbar-edit" icon="archive" onClick={ToggleArchived}></Menu.Item>
            </Menu>
            <Segment attached>
                <Link to={`/positions/${position.key}`}>
                    <Header>
                        <Header.Content>
                            {contract} {level} {position.info.title} {position_id}
                        </Header.Content>
                        <Header.Subheader>
                            <div>{location}</div>
                        </Header.Subheader>
                    </Header>
                    <section>
                        <Markdown>{position.info.skill_summary}</Markdown>
                    </section>

                    <section>{more_info}</section>
                </Link>
                <Segment vertical padded className="minitoolbar-inline">
                    <Files id={key} />
                </Segment>
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
