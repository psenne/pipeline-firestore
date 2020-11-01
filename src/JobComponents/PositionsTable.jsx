import React, { useContext } from "react";
import PositionContext from "../contexts/PositionContext";
import PositionSummary from "./PositionSummary";
import { Container } from "semantic-ui-react";

//uses search field value to filter array of candidates for table population
function isSearched(s) {
    return function(item) {
        const searchTerm = s;
        let wasFound = true;

        s.split(" ").forEach(searchTerm => {
            let termFound = false;
            if (item.info.location.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.description.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.skill_summary.toLowerCase().includes(searchTerm.toLowerCase()) || item.info.level.toLowerCase().includes(searchTerm.toLowerCase())) {
                termFound = true;
            }
            wasFound = wasFound && termFound;
        });

        return !searchTerm || wasFound;
    };
}

// filters candidates by status
function isFiltered(searchTerm) {
    return function(position) {
        return !searchTerm || position.info.contract === searchTerm;
    };
}

export default function PositionsTable({ positions }) {
    const { selectedcontract, searchterm } = useContext(PositionContext);

    return (
        <Container fluid className="hovered">
            {positions && positions
                .filter(isFiltered(selectedcontract))
                .filter(isSearched(searchterm))
                .map(position => <PositionSummary key={position.key} position={position} />)}
        </Container>
    );
}
