import React, { Component } from "react";
import CandidateSearchContext from "../contexts/CandidateSearchContext";
import { Link } from "react-router-dom";
import { Dropdown, Input, Icon, Menu, Container } from "semantic-ui-react";
import StatusDropdown from "./StatusDropdown";
import ExportToExcel from "../modules/ExportToExcel";

// populates the dropdown options for filtering by current or archived candidates in the table
// prettier-ignore
const filterOptions = [
    { key: "current", text: "View Current", value: "current" }, 
    { key: "archived", text: "View Archived", value: "archived" }
];

class CandidateToolbar extends Component {
    static contextType = CandidateSearchContext;

    UpdateStatus = value => {
        const { setstatus } = this.context;
        setstatus(value);
    };

    UpdateSearchTerm = value => {
        const { setsearchterm } = this.context;
        setsearchterm(value);
    };

    UpdateArchiveStatus = value => {
        const { setarchived } = this.context;
        setarchived(value);
    };

    ClearFilters = () => {
        const { setsearchterm, setarchived, setstatus } = this.context;
        setsearchterm("");
        setarchived("current");
        setstatus("");
    };

    render() {
        const { searchterm, archived, status } = this.context;

        return (
            <Container fluid>
                <Menu className="no-print" style={{"margin": "1rem"}}>
                    <Menu.Item title="Add new candidate" link>
                        <Link to="/candidates/add">
                            <Icon name="plus" />
                        </Link>
                    </Menu.Item>
                    <Menu.Item>
                        <StatusDropdown text="Filter by Status" value={status} onChange={(ev, data) => this.UpdateStatus(data.value)} />
                    </Menu.Item>
                    <Menu.Item>
                        <Dropdown options={filterOptions} value={archived} onChange={(ev, data) => this.UpdateArchiveStatus(data.value)} />
                    </Menu.Item>
                    <Menu.Menu position="right">
                        <Menu.Item>
                            <Input placeholder="Search" value={searchterm} onChange={(ev, data) => this.UpdateSearchTerm(data.value)} />
                        </Menu.Item>
                        <Menu.Item>
                            <Icon.Group onClick={this.ClearFilters} title="Clear filters">
                                <Icon name="filter" size="large" link />
                                <Icon name="dont" size="large" color="red" link />
                            </Icon.Group>
                        </Menu.Item>
                        <Menu.Item>
                            <Icon name="external" link onClick={() => ExportToExcel(this.props.candidates, archived)} title="Export to Excel" />
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
            </Container>
        );
    }
}

export default CandidateToolbar;
