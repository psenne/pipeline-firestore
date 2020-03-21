import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import history from "../modules/history";
import { Container, Menu, Icon } from "semantic-ui-react";
import UserContext from "../contexts/UserContext";
import FlagMessagePopup from "./FlagMessagePopup";
import CandidateProfile from "./CandidateProfile";
import NavBar from "../NavBar";

import "./candidatestyle.css";

export default function CandidateDetail({ location, match }) {
    const [flagOpen, setFlagOpen] = useState(false);
    const currentuser = useContext(UserContext);
    const candidateID = match.params.id;

    const openFlagMessage = () => {
        setFlagOpen(true);
    };

    const closeFlagMessage = () => {
        setFlagOpen(false);
    };

    const GoBack = () => {
        const filter = location.state ? location.state.filter : "current";
        const filterBySearch = location.state ? location.state.filterBySearch : "";
        const filterByStatus = location.state ? location.state.filterByStatus : "";

        history.push({ pathname: `/candidates`, state: { filter, filterBySearch, filterByStatus } });
    };

    return (
        <div>
            <NavBar active="candidates" />
            <Container>
                <Menu fluid attached="top" size="huge" borderless className="no-print">
                    <Menu.Item onClick={GoBack}>
                        <Icon name="arrow left" />
                    </Menu.Item>
                    <Menu.Menu position="right">
                        <FlagMessagePopup open={flagOpen} flagkey={candidateID} currentuser={currentuser} handleClose={closeFlagMessage}>
                            <Menu.Item as="a" onClick={openFlagMessage} title="Set follow up flag">
                                <Icon name="flag" color="red" />
                            </Menu.Item>
                        </FlagMessagePopup>
                        <Menu.Item as={Link} to={`/candidates/${candidateID}/edit`}>
                            <Icon name="edit" />
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                <CandidateProfile currentuser={currentuser} candidateID={candidateID} />
            </Container>
        </div>
    );
}
