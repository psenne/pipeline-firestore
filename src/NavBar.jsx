import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "semantic-ui-react";

const NavBar = ({ active }) => {
    return (
        <Menu tabular className="no-print">
            <Menu.Item active={active === "dashboard"}>
                <Link to="/">Dashboard</Link>
            </Menu.Item>
            <Menu.Item active={active === "candidates"}>
                <Link to="/candidates">Candidates</Link>
            </Menu.Item>
            <Menu.Item active={active === "positions"}>
                <Link to="/positions">Positions</Link>
            </Menu.Item>
            <Menu.Item active={active === "admin"}>
                <Link to="/admin">Admin</Link>
            </Menu.Item>
        </Menu>
    );
};
export default NavBar;
