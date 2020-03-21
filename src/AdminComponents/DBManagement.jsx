import React from "react";
import StatusTable from "./StatusTable";
import ContractsEditsTable from "./ContractsEditsTable";
import UsersEditsTable from "./UsersEditsTable";

export default function DBManagement({ setloading }) {
    return (
        <div>
            <StatusTable />
            <ContractsEditsTable />
            <UsersEditsTable />
        </div>
    );
}
