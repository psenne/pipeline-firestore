import React, { Component } from "react";
import { Dropdown } from "semantic-ui-react";
import { fbStatusesDB } from "../firebase.config";
import { sentence } from "to-case";

export default class StatusDropdown extends Component {
    constructor(props) {
        super(props);

        this.state = { statuses: [] };
    }

    componentDidMount() {
        this.listener = fbStatusesDB.on("value", data => {
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
        fbStatusesDB.off("value", this.listener);
    }

    render() {
        const { text, onChange } = this.props;
        const { statuses } = this.state;
        return (
            <Dropdown text={text}>
                <Dropdown.Menu>
                    <Dropdown.Item icon="window close" value="" text="Clear" onClick={onChange} />
                    <Dropdown.Divider />
                    {statuses.map(status => {
                        const label = { color: status.info.color, empty: true, circular: true };
                        return <Dropdown.Item key={status.key} label={label} value={status.info.name} text={sentence(status.info.name)} onClick={onChange} />;
                    })}
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}
