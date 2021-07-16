import React, { useState } from "react";
import { Modal, Header, Button, Icon } from "semantic-ui-react";
import PositionSelection from "../JobComponents/PositionSelection";

function SubmissionModal({ children, onSelect }) {
    const [open, setOpen] = useState(false);

    function SelectAndClose(position) {
        setOpen(false);
        onSelect(position);
    }

    return (
        <Modal closeIcon dimmer="blurring" trigger={children} open={open} onClose={() => setOpen(false)} onOpen={() => setOpen(true)} size="small">
            <Header color="blue">
                <Icon name="tasks" /> Submit candidate to position
            </Header>
            <Modal.Content scrolling>
                <PositionSelection onSelect={SelectAndClose} />
            </Modal.Content>
            <Modal.Actions>
                <Button primary onClick={() => setOpen(false)}>
                    Cancel
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default SubmissionModal;
