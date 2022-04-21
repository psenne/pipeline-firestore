import React from "react";
import { fbCandidatesDB, fbEmployeesDB, fbContractsDB, fbPositionsDB, fbUsersDB } from "./firebase.config";
import exportFromJSON from "export-from-json";

function DownloadData(data, fileName = "download") {
    const exportType = exportFromJSON.types.json;

    exportFromJSON({ data, fileName, exportType });
}

async function DownloadCandidates() {
    const candidates = await fbCandidatesDB.get();
    const downloadedcandidates = [];
    candidates.forEach(entry => {
        const data = entry.data();
        data.created_at = data.created_date ? data.created_date.toDate() : new Date("1/1/2018");
        data.updated_at = data.modified_date ? data.modified_date.toDate() : data.created_at;
        data.interview_date = data.interview_date ? data.interview_date.toDate() : null;
        data.loi_sent_date = data.loi_sent_date ? data.loi_sent_date.toDate() : null;
        const candidate = { id: entry.id, ...data };
        downloadedcandidates.push(candidate);
    });
    DownloadData(downloadedcandidates, "candidates");
}

async function DownloadContracts() {
    const downloadedcontracts = [];
    fbContractsDB.on("value", contracts => {
        contracts.forEach(entry => {
            const data = entry.val();
            const contract = { id: entry.key, ...data };
            downloadedcontracts.push(contract);
        });
        DownloadData(downloadedcontracts, "contracts");
    });
}

async function DownloadUsers() {
    const downloadedusers = [];
    fbUsersDB.on("value", users => {
        users.forEach(entry => {
            const data = entry.val();
            const user = { id: entry.key, ...data };
            downloadedusers.push(user);
        });
        DownloadData(downloadedusers, "users");
    });
}

async function DownloadPositions() {
    const positions = await fbPositionsDB.get();
    const downloadedpositions = [];
    positions.forEach(entry => {
        const data = entry.data();
        data.created_at = data.added_on ? data.added_on.toDate() : new Date("1/1/2018");
        data.updated_at = data.modified_on ? data.modified_on.toDate() : data.created_at;
        const position = { id: entry.id, ...data };
        downloadedpositions.push(position);
    });
    DownloadData(downloadedpositions, "positions");
}

async function DownloadEmployees() {
    const employees = await fbEmployeesDB.get();
    const downloadedemployees = [];
    employees.forEach(entry => {
        const data = entry.data();
        data.created_at = data.created_date ? data.created_date.toDate() : new Date("1/1/2018");
        data.updated_at = data.modified_date ? data.modified_date.toDate() : data.created_at;
        data.hired_on = data.hired_on ? data.hired_on.toDate() : null;
        data.birthday = data.birthday ? data.birthday.toDate() : null;
        data.salary = data.salary ? atob(data.salary) : null;
        const employee = { id: entry.id, ...data };
        downloadedemployees.push(employee);
    });
    DownloadData(downloadedemployees, "employees");
}

export default function DL() {
    return (
        <div>
            <h1>
                <button onClick={DownloadCandidates}>Download candidates</button>
            </h1>
            <h1>
                <button onClick={DownloadContracts}>Download contracts</button>
            </h1>
            <h1>
                <button onClick={DownloadEmployees}>Download employees</button>
            </h1>
            <h1>
                <button onClick={DownloadPositions}>Download positions</button>
            </h1>
            <h1>
                <button onClick={DownloadUsers}>Download managers</button>
            </h1>
        </div>
    );
}
