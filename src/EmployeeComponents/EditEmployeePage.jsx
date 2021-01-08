import React from "react";
import { Link, useParams } from "react-router-dom";
import { fbEmployeesDB } from "../firebase.config";

export default function EditEmployeePage() {
    const { id } = useParams();

    return <div>Edit Employee</div>;
}
