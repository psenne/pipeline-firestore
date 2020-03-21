import React, { Component } from "react";
import { Link } from "react-router-dom";

import { fbCandidatesDB } from "../firebase.config";
import { Container, List } from "semantic-ui-react";
import { format } from "date-fns";

export default class LastModified extends Component {
    constructor(props) {
        super(props);

        this.state = {
            candidates: []
        };
    }

    componentDidMount() {
        this.unsub = fbCandidatesDB
            .orderBy("modified_date", "desc")
            .limit(5)
            .onSnapshot(doc => {
                let tmpitems = [];
                doc.forEach(function(candidate) {
                    tmpitems.push({ key: candidate.id, info: candidate.data() });
                });
                this.setState({
                    candidates: tmpitems.filter(c => c.info.modified_date != null)
                });
            });
    }

    componentWillUnmount() {
        this.unsub();
    }

    render() {
        const { candidates } = this.state;

        return (
            <Container>
                <h3>Recently edited candidates</h3>
                <List selection verticalAlign="middle" divided relaxed>
                    {candidates
                        .filter(candidate => {
                            return candidate.info.modified_fields !== "";
                        })
                        .map(({ info, key }) => {
                            const modified_date = info.modified_date ? format(info.modified_date.toDate(), "MMM dd, yyyy") : "";
                            const skill = info.skill ? `(${info.skill})` : "";
                            const modified_fields = info.modified_fields
                                ? info.modified_fields.map(field => {
                                      return `${field.replace("_", " ")}`;
                                  })
                                : [];
                            const modifiedmsg = info.modified_by ? `${info.modified_by} edited ${modified_fields.join(", ")} on ${modified_date}` : "";

                            return (
                                <List.Item key={key}>
                                    <List.Content>
                                        <List.Header>
                                            <Link to={`/candidates/${key}`}>
                                                {info.firstname} {info.lastname} {skill}
                                            </Link>
                                        </List.Header>
                                        <List.Description>
                                            <div>{modifiedmsg}</div>
                                        </List.Description>
                                    </List.Content>
                                </List.Item>
                            );
                        })}
                </List>
            </Container>
        );
    }
}
