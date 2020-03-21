import React, { Component } from "react";
import { fbStatusesDB } from "../firebase.config";
import { Table, Label, Header } from "semantic-ui-react";
import { sentence } from "to-case";

export default class StatusTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            statuses: []
        };
    }

    componentDidMount() {
        fbStatusesDB.on("value", data => {
            let statuses = [];
            data.forEach(function(status) {
                statuses.push({ key: status.key, info: status.val() });
            });
            this.setState({
                statuses
            });
        });
    }

    componentWillUnmount() {
        fbStatusesDB.off("value");
    }

    render() {
        const { statuses } = this.state;
        return (
            <Table celled>
                <Table.Header fullWidth>
                    <Table.Row>
                        <Table.HeaderCell colSpan="4">
                            <Header>Statuses</Header>
                        </Table.HeaderCell>
                    </Table.Row>
                    <Table.Row>
                        <Table.HeaderCell>Color</Table.HeaderCell>
                        <Table.HeaderCell>Status name</Table.HeaderCell>
                        <Table.HeaderCell>Description</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {statuses.map(status => {
                        return (
                            <Table.Row key={status.key}>
                                <Table.Cell textAlign="center">
                                    <Label circular empty color={status.info.color} />
                                </Table.Cell>
                                <Table.Cell>{sentence(status.info.name)}</Table.Cell>
                                <Table.Cell>{status.info.description}</Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table>
        );
    }
}
