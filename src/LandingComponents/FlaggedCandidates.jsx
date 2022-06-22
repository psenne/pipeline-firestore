import React, { Component } from "react";
import { fbFlagNotes } from "../firebase.config";
import Flag from "../LandingComponents/Flag";
import { Card } from "semantic-ui-react";

export default class FlaggedCandidates extends Component {
    constructor(props) {
        super(props);

        this.state = {
            flags: []
        };
    }

    componentDidMount() {
        fbFlagNotes.orderByChild("flagged_on").on("value", data => {
            let tmpitems = [];
            data.forEach(function (flag) {
                tmpitems.push({ key: flag.key, info: flag.val() });
            });
            this.setState({
                flags: tmpitems
            });
        });
    }

    componentWillUnmount() {
        fbFlagNotes.off("value");
    }

    render() {
        const { flags } = this.state;
        return (
            <>
                {flags.length > 0 && (
                    <Card.Group>
                        {flags.reverse().map(flag => (
                            <Flag key={flag.key} flag={flag} />
                        ))}
                    </Card.Group>
                )}
            </>
        );
    }
}
