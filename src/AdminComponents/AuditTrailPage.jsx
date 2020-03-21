import React from "react";
import { Header } from "semantic-ui-react";
import AuditTrail from "./AuditTrail";

export default function AuditTrailPage({ setloading }) {
    return (
        <>
            <Header>Pipeline history</Header>
            <AuditTrail setloading={setloading}></AuditTrail>
        </>
    );
}
