import React, { Component } from "react";
import { Dropdown } from "semantic-ui-react";
import { fbStatusesDB } from "../firebase.config";
import { sentence } from "to-case";

export default class StatusDropdown extends Component {
    constructor(props) {
        super(props);

        this.state = { statuses: [], isLoading: false };
    }

    componentDidMount() {
        this.setState({ isLoading: true });
        this.listener = fbStatusesDB.on("value", data => {
            const statuses = [];

            data.forEach(function (status) {
                const info = status.val();
                const key = status.key;
                const label = { color: info.color, empty: true, circular: true };
                statuses.push({
                    key: key,
                    text: sentence(info.name),
                    value: info.name,
                    label
                });
            });
            this.setState({
                statuses,
                isLoading: false
            });
        });
    }

    componentWillUnmount() {
        fbStatusesDB.off("value", this.listener);
    }

    render() {
        const { text, onChange } = this.props;
        const { statuses, isLoading } = this.state;
        return <Dropdown placeholder={text} clearable options={statuses} loading={isLoading} onChange={onChange}></Dropdown>;
    }
}
