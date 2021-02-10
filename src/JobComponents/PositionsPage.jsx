import React, { useState, useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import NavBar from "../NavBar";
import ViewAllPositions from "./ViewAllPositions";
import AddPositionForm from "./AddPositionForm";
import EditPositionForm from "./EditPositionForm";
import PositionDetailPage from "./PositionDetailPage";

export default function PositionsPage() {
    const { path } = useRouteMatch();
    return (
        <div>
            <NavBar active="positions" />
            <Switch>
                <Route path={`${path}/add`}>
                    <AddPositionForm />
                </Route>
                <Route path={`${path}/:id/edit`}>
                    <EditPositionForm />
                </Route>
                <Route path={`${path}/:id`}>
                    <PositionDetailPage />
                </Route>
                <Route path={`${path}/`}>
                    <ViewAllPositions />
                </Route>
            </Switch>
        </div>
    );
}
