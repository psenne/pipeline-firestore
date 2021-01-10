import React, { useContext } from "react";
import { Link } from "react-router-dom";
import EmployeeContext from "../contexts/EmployeeContext";
import { Input, Icon, Menu } from "semantic-ui-react";
import ContractDropdown from "../CandidateComponents/ContractDropdown";

export default function EmployeeToolbar(props) {
    const { selectedcontract, setselectedcontract, searchterm, setsearchterm } = useContext(EmployeeContext);

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
        <Menu className="no-print">
            <Menu.Item title="Add employee" link>
                <Link to="/employees/add">
                    <Icon name="plus" />
                </Link>
            </Menu.Item>
            <Menu.Item>
                <ContractDropdown text="Filter by Contract" clearable value={selectedcontract} onChange={SetSelectedContract} />
            </Menu.Item>
            {selectedcontract && (
                <Menu.Item>
                    <label>{`Filtering for ${selectedcontract}`}</label>
                </Menu.Item>
            )}
            <Menu.Menu position="right">
                <Menu.Item>
                    <Input placeholder="Filter Employees" icon={searchterm ? <Icon name="dont" color="red" link onClick={ClearFilters} /> : <Icon name="filter" />} value={searchterm} onChange={(ev, data) => SetSearchTerm(data.value)} />
                </Menu.Item>
            </Menu.Menu>
        </Menu>
    );
}
