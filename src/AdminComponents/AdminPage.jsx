import React, { useState } from "react";
import NavBar from "../NavBar";
import { Tab } from "semantic-ui-react";
import DBManagement from "./DBManagement";
import AuditTrailPage from "./AuditTrailPage";

const AdminPage = () => {
    const [loading, setloading] = useState(false);
    const panes = [
        {
            menuItem: "DB Management",
            render: () => (
                <Tab.Pane>
                    <DBManagement />
                </Tab.Pane>
            )
        },
        {
            menuItem: "History",
            render: () => (
                <Tab.Pane loading={loading}>
                    <AuditTrailPage setloading={setloading} />
                </Tab.Pane>
            )
        }
    ];

    return (
        <>
            <NavBar active="admin" />
            <Tab menu={{ attached: true }} panes={panes} />
        </>
    );
};

export default AdminPage;
