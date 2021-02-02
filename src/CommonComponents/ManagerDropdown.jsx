import React, { Component } from "react";
import { Dropdown } from "semantic-ui-react";
import { fbUsersDB } from "../firebase.config";

export default class ManagerDropdown extends Component {
    constructor(props) {
        super(props);

        this.state = {
            managers: []
        };
    }

    componentDidMount() {
        this.listener = fbUsersDB.on("value", data => {
            let managers = [];
            data.forEach(function(manager) {
                const val = manager.val();
                if (val.role.indexOf("manager") > -1) {
                    managers.push({
                        key: manager.key,
                        text: val.name,
                        value: val.name
                    });
                }
            });

            this.setState({
                managers
            });
        });
    }

    componentWillUnmount() {
        fbUsersDB.off("value", this.listener);
    }

    render() {
        const { managers } = this.state;
        const { onChange, name, ...rest } = this.props;
        return <Dropdown {...rest} options={managers} selection closeOnChange onChange={(ev, selection) => onChange(name, selection.value)} />;
    }
}
