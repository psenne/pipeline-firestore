import React, { useContext } from "react";
import { Link } from "react-router-dom";
import PositionContext from "../contexts/PositionContext";
import { Input, Icon, Menu, Container } from "semantic-ui-react";
import ContractDropdown from "../CommonComponents/ContractDropdown";
import ExportPositions from "../modules/ExportPositions";
import classnames from "classnames";

export default ({ positions, contracts }) => {
    const { selectedcontract, setselectedcontract, searchterm, setsearchterm } = useContext(PositionContext);

    const SetSelectedContract = value => {
        setselectedcontract(value);
    };

    const SetSearchTerm = value => {
        setsearchterm(value);
    };

    const ClearFilters = () => {
        setselectedcontract("");
        setsearchterm("");
    };

    return (
        <Container fluid>
            <Menu className="no-print" style={{ margin: "1rem" }}>
                <Menu.Item title="Add new position" link>
                    <Link to="/positions/add">
                        <Icon name="plus" />
                    </Link>
                </Menu.Item>
                <Menu.Item>
                    <ContractDropdown text="Filter by Contract" clearable value={selectedcontract} contractsoverride={contracts} onChange={SetSelectedContract} />
                </Menu.Item>
                <Menu.Item className={classnames({ "form-hidden": !selectedcontract })}>
                    <label>{`Filtering for ${selectedcontract}`}</label>
                </Menu.Item>
                <Menu.Menu position="right">
                    <Menu.Item>
                        <Input placeholder="Filter Positions" icon={searchterm ? <Icon name="dont" color="red" link onClick={ClearFilters} /> : <Icon name="filter" />} value={searchterm} onChange={(ev, data) => SetSearchTerm(data.value)} />
                    </Menu.Item>
                    <Menu.Item>
                        <Icon
                            name="external"
                            link
                            onClick={() => {
                                ExportPositions(positions);
                            }}
                            title="Export to Excel"
                            content="Export to Excel"
                        />
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
        </Container>
    );
};
