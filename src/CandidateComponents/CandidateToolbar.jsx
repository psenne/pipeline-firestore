import React, { Component } from "react";
import CandidateSearchContext from "../contexts/CandidateSearchContext";
import { Link } from "react-router-dom";
import { Input, Icon, Menu, Container } from "semantic-ui-react";
import StatusDropdown from "../CommonComponents/StatusDropdown";
import ExportToExcel from "../modules/ExportToExcel";

// populates the dropdown options for filtering by current or archived candidates in the table
// prettier-ignore
// const filterOptions = [
//     { key: "current", text: "Viewing Current", value: "current" },
//     { key: "archived", text: "Viewing Archived", value: "archived" }
// ];

class CandidateToolbar extends Component {
    static contextType = CandidateSearchContext;

    UpdateStatus = value => {
        const { setstatus, setpagenum } = this.context;
        setpagenum(1);
        setstatus(value);
    };

    UpdateSearchTerm = value => {
        const { setsearchterm, setpagenum } = this.context;
        setpagenum(1);
        setsearchterm(value);
    };

    UpdateArchiveStatus = value => {
        const { setarchived } = this.context;
        setarchived(value);
    };

    ClearFilters = () => {
        const { setsearchterm, setarchived, setstatus, setpagenum } = this.context;
        setsearchterm("");
        setarchived("current");
        setstatus("");
        setpagenum(1);
    };

    render() {
        const { searchterm, archived, status } = this.context;

        return (
            <Container fluid>
                <Menu stackable className="no-print" style={{ margin: "1rem" }}>
                    <Menu.Item title="Add new candidate" link>
                        <Link to="/candidates/add">
                            <Icon name="plus" />
                        </Link>
                    </Menu.Item>
                    <Menu.Item>
                        <StatusDropdown text="Filter by Status" value={status} onChange={(ev, data) => this.UpdateStatus(data.value)} />
                    </Menu.Item>
                    {/* <Menu.Item>
                        <Dropdown options={filterOptions} value={archived} onChange={(ev, data) => this.UpdateArchiveStatus(data.value)} />
                    </Menu.Item> */}
                    <Menu.Menu position="right">
                        <Menu.Item>
                            <Input placeholder="Filter Candidates" icon={searchterm ? <Icon name="dont" color="red" link onClick={this.ClearFilters} /> : <Icon name="filter" />} value={searchterm} onChange={(ev, data) => this.UpdateSearchTerm(data.value)} />
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
