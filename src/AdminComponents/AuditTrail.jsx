import React, { Component } from "react";
import { fbAuditTrailDB } from "../firebase.config";
import { format } from "date-fns";
import { Table } from "semantic-ui-react";

export default class AuditTrail extends Component {
    constructor(props) {
        super(props);

        this.state = {
            events: []
        };
    }

    componentDidMount() {
        this.props.setloading(true);
        fbAuditTrailDB
            .orderByChild("eventdate")
            .limitToLast(1000)
            .on("value", data => {
                let tmp = [];
                data.forEach(event => {
                    tmp.push({ key: event.key, eventinfo: event.val() });
                });
                this.setState({ events: tmp.reverse() }, () => this.props.setloading(false));
            });
    }

    componentWillUnmount() {
        fbAuditTrailDB.off("value");
    }

    render() {
        const { events } = this.state;
        return (
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Event date</Table.HeaderCell>
                        <Table.HeaderCell>Candidate / Position</Table.HeaderCell>
                        <Table.HeaderCell>Event Information</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {events.map(event => {
                        const eventdate = event.eventinfo.eventdate ? format(new Date(event.eventinfo.eventdate), "MMM d, yyyy h:mm aaaa") : "";
                        return (
                            <Table.Row key={event.key}>
                                <Table.Cell width={3}>{eventdate}</Table.Cell>
                                <Table.Cell width={3}>{event.eventinfo.candidatename}</Table.Cell>
                                <Table.Cell>{event.eventinfo.eventinfo}</Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table>
        );
    }
}
