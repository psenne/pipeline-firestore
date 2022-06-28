import React, { Component } from "react";
import { Link } from "react-router-dom";

import { fbCandidatesDB } from "../firebase.config";
import { Container, List, Header, Icon } from "semantic-ui-react";
import { format } from "date-fns";

export default class LastCreated extends Component {
    constructor(props) {
        super(props);

        this.state = {
            candidates: []
        };
    }

    componentDidMount() {
        this.unsub = fbCandidatesDB
            .orderBy("created_date", "desc")
            .limit(10)
            .onSnapshot(doc => {
                let tmpitems = [];
                doc.forEach(function (candidate) {
                    tmpitems.push({ key: candidate.id, info: candidate.data() });
                });
                this.setState({
                    candidates: tmpitems
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
                <Header>
                    <Icon name="user circle" />
                    New candidates
                </Header>
                <List selection verticalAlign="middle" divided relaxed>
                    {candidates
                        .filter(candidate => {
                            return candidate.info.created_by;
                        })
                        .map(({ info, key }) => {
                            const created_date = info.created_date ? format(info.created_date.toDate(), "MMM d, yyyy") : "";
                            const skill = info.skill ? `(${info.skill})` : "";
                            const addedmsg = info.created_by ? `Added by ${info.created_by} on ${created_date}` : "";

                            return (
                                <List.Item key={key}>
                                    <List.Content>
                                        <List.Header>
                                            <Link to={`/candidates/${key}`}>
                                                {info.firstname} {info.lastname} {skill}
                                            </Link>
                                        </List.Header>
                                        <List.Description>{addedmsg}</List.Description>
                                    </List.Content>
                                </List.Item>
                            );
                        })}
                </List>
            </Container>
        );
    }
}
