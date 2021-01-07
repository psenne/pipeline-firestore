import React from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import NavBar from "../NavBar";
import ViewAllEmployees from "./ViewAllEmployees";
import AddEmployeePage from "./AddEmployeePage";
import EditEmployeePage from "./EditEmployeePage";
import EmployeeProfilePage from "./EmployeeProfilePage";

export default function EmployeePage() {
    const { path } = useRouteMatch();
    return (
        <div>
            <NavBar active="employees" />
            <Switch>
                <Route path={`${path}/add`}>
                    <AddEmployeePage />
                </Route>
                <Route path={`${path}/:id/edit`}>
                    <EditEmployeePage />
                </Route>
                <Route path={`${path}/:id`}>
                    <EmployeeProfilePage />
                </Route>
                <Route path={`${path}/`}>
                    <ViewAllEmployees />
                </Route>
            </Switch>
        </div>
    );
}
