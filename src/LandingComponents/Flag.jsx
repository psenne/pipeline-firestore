import React, { Component } from "react";
import { Link } from "react-router-dom";
import FlagMessagePopup from "../CandidateComponents/FlagMessagePopup";
import UserContext from "../contexts/UserContext";
import { Card, Icon, Button } from "semantic-ui-react";
import { format, parseISO } from "date-fns";

export default class Flag extends Component {
    constructor(props) {
        super(props);

        this.state = {
            flags: [],
            flagOpen: false
        };
    }

    openFlagMessage = ev => {
        ev.stopPropagation();
        this.setState({
            flagOpen: true
        });
    };

    closeFlagMessage = () => {
        this.setState({
            flagOpen: false
        });
    };

    render() {
        const { flag } = this.props;
        const { flagOpen } = this.state;
        const flagdate = format(parseISO(flag.info.flagged_on), "MMM d, yyyy");
        const candidatelink = <Link to={`/candidates/${flag.key}`}>{flag.info.candidate_name}</Link>;
        const action = flag.info.actioned_to ? <h5>Actioned to: {flag.info.actioned_to}</h5> : "";
        return (
            <Card>
                <Card.Content>
                    <Card.Header>{candidatelink}</Card.Header>
                    <Card.Meta>
                        Added by {flag.info.flagged_by} on {flagdate}
                    </Card.Meta>
                    <Card.Description>
                        {action}
                        <div>{flag.info.flag_note}</div>
                    </Card.Description>
                </Card.Content>
                <Card.Content extra>
                    <UserContext.Consumer>
                        {currentuser => (
                            <FlagMessagePopup flagkey={flag.key} open={flagOpen} currentuser={currentuser} handleClose={this.closeFlagMessage}>
                                <Button onClick={this.openFlagMessage}>
                                    <Icon name="flag" color="red" />
                                    Edit note
                                </Button>
                            </FlagMessagePopup>
                        )}
                    </UserContext.Consumer>
                </Card.Content>
            </Card>
        );
    }
}
