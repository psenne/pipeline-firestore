import React, { Component } from "react";
import { fbContractsDB } from "../firebase.config";
import ManagerDropdown from "../CommonComponents/ManagerDropdown";
import { Table, Header, Icon, Input, Message } from "semantic-ui-react";
import { sentence } from "to-case";

export default class ContractsEditsTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            contracts: [],
            editable: false,
            newcontract: {
                number: "",
                name: "",
                pm: "",
                pop: ""
            },
            newcontractkey: -1,
            formState: null,
            errormsg: null
        };

        this.updateNewContract = this.updateNewContract.bind(this);
        this.HandleTextInput = this.HandleTextInput.bind(this);
        this.HandleManagerSelection = this.HandleManagerSelection.bind(this);
        this.Add = this.Add.bind(this);
        this.Edit = this.Edit.bind(this);
        this.Update = this.Update.bind(this);
        this.Delete = this.Delete.bind(this);
        this.ResetForm = this.ResetForm.bind(this);
    }
    updateNewContract(name, value) {
        this.setState({
            errormsg: null
        });

        this.setState(prevState => {
            let newcontract = prevState.newcontract; //get candidate info
            newcontract[name] = value; //update with onChange info
            return { newcontract };
        });
    }

    HandleTextInput(ev) {
        const name = ev.target.name;
        const value = ev.target.value;

        this.updateNewContract(name, value);
    }

    HandleManagerSelection(name, value) {
        this.updateNewContract(name, value);
    }

    Add() {
        this.setState({
            newcontract: {
                number: "",
                name: "",
                pm: "",
                pop: ""
            },
            newcontractkey: -1,
            formState: "adding"
        });
    }

    Edit(contract) {
        this.setState({
            formState: "editing",
            newcontract: Object.assign({}, contract.info),
            newcontractkey: contract.key
        });
    }

    Update() {
        const { newcontractkey, newcontract } = this.state;
        this.setState({
            errormsg: null
        });
        if (newcontract.name && newcontract.number && newcontract.pm && newcontract.pop) {
            if (newcontractkey !== -1) {
                fbContractsDB.child(newcontractkey).update(newcontract).then(this.ResetForm);
            } else {
                fbContractsDB.push(newcontract).then(this.ResetForm);
            }
        } else {
            this.setState({
                errormsg: "All fields are mandatory."
            });
        }
    }

    Delete(key, name) {
        if (window.confirm(`Delete ${name}?`)) {
            fbContractsDB.child(key).remove();
        }
    }

    ResetForm() {
        this.setState({
            newcontract: {
                number: "",
                name: "",
                pm: "",
                pop: ""
            },
            newcontractkey: -1,
            formState: null
        });
    }

    componentDidMount() {
        fbContractsDB.on("value", data => {
            let contracts = [];
            data.forEach(function (contract) {
                contracts.push({ key: contract.key, info: contract.val() });
            });
            this.setState({
                contracts
            });
        });
    }

    componentWillUnmount() {
        fbContractsDB.off("value");
    }

    render() {
        const { contracts, newcontract, formState, errormsg } = this.state;
        return (
            <Table celled>
                <Table.Header fullWidth>
                    <Table.Row>
                        <Table.HeaderCell colSpan="5">
                            <Header>Contracts</Header>
                        </Table.HeaderCell>
                    </Table.Row>
                    <Table.Row>
                        <Table.HeaderCell>Contract number</Table.HeaderCell>
                        <Table.HeaderCell>Contract name</Table.HeaderCell>
                        <Table.HeaderCell>Period of performance</Table.HeaderCell>
                        <Table.HeaderCell>Project manager</Table.HeaderCell>
                        <Table.HeaderCell>
                            <Icon name="circle add" color="green" size="large" title="Add new contract" link onClick={this.Add} />
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {contracts.map(contract => {
                        return (
                            <Table.Row key={contract.key}>
                                <Table.Cell>{contract.info.number}</Table.Cell>
                                <Table.Cell>{sentence(contract.info.name)}</Table.Cell>
                                <Table.Cell>{contract.info.pop}</Table.Cell>
                                <Table.Cell>{contract.info.pm}</Table.Cell>
                                <Table.Cell>
                                    <Icon name="edit" link onClick={() => this.Edit(contract)} /> <Icon name="delete" color="red" link onClick={() => this.Delete(contract.key, contract.info.name)} />
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
                {formState && (
                    <Table.Footer fullWidth>
                        <Table.Row>
                            <Table.Cell>
                                <Input name="number" required value={newcontract.number} placeholder="Contract number" onChange={this.HandleTextInput} />
                            </Table.Cell>
                            <Table.Cell>
                                <Input name="name" value={newcontract.name} placeholder="Contract name" onChange={this.HandleTextInput} />
                            </Table.Cell>
                            <Table.Cell>
                                <Input name="pop" value={newcontract.pop} placeholder="Period of performance" onChange={this.HandleTextInput} />
                            </Table.Cell>
                            <Table.Cell>
                                <ManagerDropdown name="pm" multiple={false} value={newcontract.pm} placeholder="Project manager" onChange={this.HandleManagerSelection} />
                            </Table.Cell>
                            <Table.Cell>
                                <Icon link name="save" color="green" title="Save entry" onClick={this.Update} /> <Icon link name="ban" title="Cancel update" onClick={this.ResetForm} />
                            </Table.Cell>
                        </Table.Row>

                        <Table.Row hidden={!errormsg}>
                            <Table.HeaderCell colSpan="5">
                                <Message negative>{errormsg}</Message>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                )}
            </Table>
        );
    }
}
