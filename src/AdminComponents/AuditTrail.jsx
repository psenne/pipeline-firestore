import React, { useState, useEffect } from "react";
import { fbAuditTrailDB } from "../firebase.config";
import { format } from "date-fns";
import { Table, Container, Menu, Icon, Input, Header } from "semantic-ui-react";

function AuditTrail({ setloading }) {
    const [events, setevents] = useState([]);
    const [query, setquery] = useState("");

    useEffect(() => {
        setloading(true);
        fbAuditTrailDB.limitToLast(1000).on("value", data => {
            let tmp = [];
            data.forEach(event => {
                tmp.push({ key: event.key, ...event.val() });
            });
            setevents(tmp.reverse());
            setloading(false);
        });
        return () => {
            fbAuditTrailDB.off("value");
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Container>
            <Menu borderless stackable attached className="no-print">
                <Menu.Item>
                    <Header size="small">
                        <Icon name="history" /> History
                    </Header>
                </Menu.Item>
                <Menu.Menu position="right">
                    <Menu.Item>
                        <Input placeholder="Search history" value={query} onChange={ev => setquery(ev.target.value)} />
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
            <Table celled attached>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Event date</Table.HeaderCell>
                        <Table.HeaderCell>Candidate / Position</Table.HeaderCell>
                        <Table.HeaderCell>Event Information</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {events
                        .filter(event => event.eventinfo.toLowerCase().includes(query.toLowerCase()))
                        .map(event => {
                            const eventdate = event.eventdate ? format(new Date(event.eventdate), "MMM d, yyyy h:mm aaaa") : "";
                            return (
                                <Table.Row key={event.key}>
                                    <Table.Cell width={3}>{eventdate}</Table.Cell>
                                    <Table.Cell width={3}>{event.candidatename}</Table.Cell>
                                    <Table.Cell>{event.eventinfo}</Table.Cell>
                                </Table.Row>
                            );
                        })}
                </Table.Body>
            </Table>
        </Container>
    );
}

export default AuditTrail;
