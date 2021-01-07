import React from "react";
import { Placeholder, Table, Icon } from "semantic-ui-react";

export default function LoadingEmployeesTable() {
    return (
        <Table columns={6} selectable striped>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Employee</Table.HeaderCell>
                    <Table.HeaderCell>Skill</Table.HeaderCell>
                    <Table.HeaderCell>Contract</Table.HeaderCell>
                    <Table.HeaderCell>Telephone Number</Table.HeaderCell>
                    <Table.HeaderCell>E-mail address</Table.HeaderCell>
                    <Table.HeaderCell width={1}></Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                <Table.Row>
                    <Table.Cell>
                        <Placeholder content={<Placeholder.Line />} />
                    </Table.Cell>
                    <Table.Cell>
                        <Placeholder content={<Placeholder.Line />} />
                    </Table.Cell>
                    <Table.Cell>
                        <Placeholder content={<Placeholder.Line />} />
                    </Table.Cell>
                    <Table.Cell>
                        <Placeholder content={<Placeholder.Line />} />
                    </Table.Cell>
                    <Table.Cell>
                        <Placeholder content={<Placeholder.Line />} />
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                        <Icon name="edit" className="action" />
                    </Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell>
                        <Placeholder content={<Placeholder.Line />} />
                    </Table.Cell>
                    <Table.Cell>
                        <Placeholder content={<Placeholder.Line />} />
                    </Table.Cell>
                    <Table.Cell>
                        <Placeholder content={<Placeholder.Line />} />
                    </Table.Cell>
                    <Table.Cell>
                        <Placeholder content={<Placeholder.Line />} />
                    </Table.Cell>
                    <Table.Cell>
                        <Placeholder content={<Placeholder.Line />} />
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                        <Icon name="edit" className="action" />
                    </Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell>
                        <Placeholder content={<Placeholder.Line />} />
                    </Table.Cell>
                    <Table.Cell>
                        <Placeholder content={<Placeholder.Line />} />
                    </Table.Cell>
                    <Table.Cell>
                        <Placeholder content={<Placeholder.Line />} />
                    </Table.Cell>
                    <Table.Cell>
                        <Placeholder content={<Placeholder.Line />} />
                    </Table.Cell>
                    <Table.Cell>
                        <Placeholder content={<Placeholder.Line />} />
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                        <Icon name="edit" className="action" />
                    </Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>
    );
}
