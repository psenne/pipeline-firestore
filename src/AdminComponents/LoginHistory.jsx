import React, { Component } from "react";
import { fbLoginsDB } from "../firebase.config";
import { format, parseISO } from "date-fns";
import { Container, Table, Header, Icon} from "semantic-ui-react";

class LoginHistory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            logins: []
        };
    }

    componentDidMount() {
        fbLoginsDB.orderByChild("eventtime").limitToLast(1000).on("value", data => {
            let tmp = [];
            data.forEach(event => {
                tmp.push({ key: event.key, eventinfo: event.val() });
            });
            this.setState({ logins: tmp.reverse() });
        });
    }
    render() {
        const { logins } = this.state;
        return (
            <Container>
                <Header size="huge" inverted color="teal" attached="top">
                    <Icon name="log out" /> Login history
                </Header>
                <Table attached="bottom">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>Email Address</Table.HeaderCell>
                            <Table.HeaderCell>Login Event</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {logins.map(login => {
                            const loginevent = login.eventinfo;
                            return (
                                <Table.Row key={login.key}>
                                    <Table.Cell>{loginevent.user}</Table.Cell>
                                    <Table.Cell>{loginevent.emailaddress}</Table.Cell>
                                    <Table.Cell>{format(parseISO(loginevent.eventtime), "MMM d, yyyy h:mm aaaa")}</Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table>
            </Container>
        );
    }
}

export default LoginHistory;
