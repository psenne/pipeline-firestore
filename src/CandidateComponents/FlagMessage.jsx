import React, { useState, useContext } from "react";
import { Icon, Message, Accordion } from "semantic-ui-react";
import { format, parseISO } from "date-fns";
import FlagMessagePopup from "./FlagMessagePopup";
import UserContext from "../contexts/UserContext";

export default function FlagMessage({ onDismiss, candidate }) {
    const action = candidate.actioned_to ? <Message.Header>Actioned to: {candidate.actioned_to}</Message.Header> : "";
    const [flagOpen, setFlagOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const currentuser = useContext(UserContext);

    const openFlagMessage = () => {
        setFlagOpen(true);
    };

    const closeFlagMessage = () => {
        setFlagOpen(false);
    };

    const toggleHistory = ev => {
        ev.stopPropagation();
        setHistoryOpen(!historyOpen);
    };

    return (
        <div style={{ width: "100%", cursor: "pointer" }} title="Edit flag">
            <FlagMessagePopup open={flagOpen} flagkey={candidate.id} currentuser={currentuser} handleClose={closeFlagMessage}>
                <Message icon onClick={openFlagMessage} onDismiss={onDismiss}>
                    <Icon name="flag" color="red" />
                    <Message.Content>
                        {action}
                        <div>{candidate.flag_note}</div>
                        <div style={{ color: "#808080" }}>
                            Added by {candidate.flagged_by} on {format(parseISO(candidate.flagged_on), "MMM d, yyyy")}
                        </div>
                        {candidate.flag_history.length > 0 && (
                            <Accordion>
                                <Accordion.Title active={historyOpen} index={0} onClick={toggleHistory}>
                                    <Icon name="dropdown" />
                                    Flag history
                                </Accordion.Title>
                                <Accordion.Content active={historyOpen}>
                                    {candidate.flag_history.map(flag => {
                                        const action = flag.actioned_to ? <Message.Header>Actioned to: {flag.actioned_to}</Message.Header> : "";
                                        return (
                                            <Message key={flag.flagged_on}>
                                                <Message.Content>
                                                    {action}
                                                    <div>{flag.flag_note}</div>
                                                    <div style={{ color: "#808080" }}>
                                                        Added by {flag.flagged_by} on {format(parseISO(flag.flagged_on), "MMM d, yyyy")}
                                                    </div>
                                                </Message.Content>
                                            </Message>
                                        );
                                    })}
                                </Accordion.Content>
                            </Accordion>
                        )}{" "}
                    </Message.Content>
                </Message>
            </FlagMessagePopup>
        </div>
    );
}
