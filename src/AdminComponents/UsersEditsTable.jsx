import React, { Component } from "react";
import { fbUsersDB } from "../firebase.config";
import { Table, Header, Icon, Input, Message } from "semantic-ui-react";

const newuser = {
    name: "",
    email: "",
    role: ""
};

export default class UsersEditsTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: [],
            editable: false,
            newuser: Object.assign({}, newuser),
            newuserkey: -1,
            formState: null,
            errormsg: null
        };

        this.updateNewUser = this.updateNewUser.bind(this);
        this.HandleTextInput = this.HandleTextInput.bind(this);
        this.Add = this.Add.bind(this);
        this.Edit = this.Edit.bind(this);
        this.Update = this.Update.bind(this);
        this.Delete = this.Delete.bind(this);
        this.ResetForm = this.ResetForm.bind(this);
    }
    updateNewUser(name, value) {
        this.setState({
            errormsg: null
        });

        this.setState(prevState => {
            let newuser = prevState.newuser; //get candidate info
            newuser[name] = value; //update with onChange info
            return { newuser };
        });
    }

    HandleTextInput(ev) {
        const name = ev.target.name;
        const value = ev.target.value;

        this.updateNewUser(name, value);
    }

    Add() {
        this.setState({
            newuser: Object.assign({}, newuser),
            newuserkey: -1,
            formState: "adding"
        });
    }

    Edit(user) {
        this.setState({
            formState: "editing",
            newuser: Object.assign({}, user.info),
            newuserkey: user.key
        });
    }

    Update() {
        const { newuserkey, newuser } = this.state;
        this.setState({
            errormsg: null
        });
        if (newuser.name && newuser.email && newuser.role) {
            if (newuserkey !== -1) {
                fbUsersDB
                    .child(newuserkey)
                    .update(newuser)
                    .then(this.ResetForm);
            } else {
                fbUsersDB.push(newuser).then(this.ResetForm);
            }
        } else {
            this.setState({
                errormsg: "All fields are mandatory."
            });
        }
    }

    Delete(key, name) {
        if (window.confirm(`Delete ${name}?`)) {
            fbUsersDB.child(key).remove();
        }
    }

    ResetForm() {
        this.setState({
            newuser: Object.assign({}, newuser),
            newuserkey: -1,
            formState: null
        });
    }

    componentDidMount() {
        fbUsersDB.on("value", data => {
            let users = [];
            data.forEach(function(user) {
                users.push({ key: user.key, info: user.val() });
            });
            this.setState({
                users
            });
        });
    }

    componentWillUnmount() {
        fbUsersDB.off("value");
    }

    render() {
        const { users, newuser, formState, errormsg } = this.state;
        return (
            <Table celled>
                <Table.Header fullWidth>
                    <Table.Row>
                        <Table.HeaderCell colSpan="4">
                            <Header>Users</Header>
                        </Table.HeaderCell>
                    </Table.Row>
                    <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Email Address</Table.HeaderCell>
                        <Table.HeaderCell>Role</Table.HeaderCell>
                        <Table.HeaderCell>
                            <Icon name="circle add" color="green" size="large" title="Add new user" link onClick={this.Add} />
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {users.map(user => {
                        return (
                            <Table.Row key={user.key}>
                                <Table.Cell>{user.info.name}</Table.Cell>
                                <Table.Cell>{user.info.email}</Table.Cell>
                                <Table.Cell>{user.info.role}</Table.Cell>
                                <Table.Cell>
                                    <Icon name="edit" link onClick={() => this.Edit(user)} /> <Icon name="delete" color="red" link onClick={() => this.Delete(user.key, user.info.name)} />
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
                {formState && (
                    <Table.Footer fullWidth>
                        <Table.Row>
                            <Table.Cell>
                                <Input name="name" value={newuser.name} placeholder="User name" onChange={this.HandleTextInput} />
                            </Table.Cell>
                            <Table.Cell>
                                <Input name="email" value={newuser.email} placeholder="Email address" onChange={this.HandleTextInput} />
                            </Table.Cell>
                            <Table.Cell>
                                <Input name="role" value={newuser.role} placeholder="Role: Admin, HR, Manager" onChange={this.HandleTextInput} />
                            </Table.Cell>
                            <Table.Cell>
                                <Icon link name="save" color="green" title="Save entry" onClick={this.Update} /> <Icon link name="ban" title="Cancel update" onClick={this.ResetForm} />
                            </Table.Cell>
                        </Table.Row>

                        <Table.Row hidden={!errormsg}>
                            <Table.HeaderCell colSpan="4">
                                <Message negative>{errormsg}</Message>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                )}
            </Table>
        );
    }
}
