import XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment";

// some random function for excel exporting
function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
}

export default function(candidateList, status = "current") {
    // map candidates array for excel formatting
    const jsontable = candidateList
        .filter(item => item.info.archived === status)
        .map(item => {
            const potential_contracts = item.info.potential_contracts ? item.info.potential_contracts.join(", ") : "";
            const interview_date = item.info.interview_date ? moment(item.info.interview_date).format("MMM, DD YYYY") : "";
            const interviewers = item.info.interviewed_by ? " (" + item.info.interviewed_by.join(", ") + ")" : "";
            const loi_sent = item.info.loi_sent_by && item.info.loi_sent_date ? " (sent by " + item.info.loi_sent_by + " on " + moment(item.info.loi_sent_date).format("MMM, DD YYYY") + ")" : "";
            const salary = atob(item.info.salary);
            const recent_flag = item.info.isFlagged ? `${item.info.actioned_to}: ${item.info.flag_note} (on ${moment(item.info.flagged_on).format("MMM, DD YYYY")})` : "";

            return {
                Name: item.info.firstname + " " + item.info.lastname,
                "Email Address": item.info.emailaddress,
                Telephone: item.info.telephone,
                Status: item.info.status,
                "Prefered Location": item.info.prefered_location,
                "Current Contract": item.info.current_contract,
                "Current Company": item.info.current_company,
                "Potential Contracts": potential_contracts,
                Skill: item.info.skill,
                Level: item.info.level,
                "Interview Date": interview_date + interviewers,
                "LOI Status": item.info.loi_status + loi_sent,
                "Found By": item.info.found_by,
                Salary: salary,
                Notes: item.info.notes,
                "Next Steps": item.info.next_steps,
                Flag: recent_flag
            };
        });

    var worksheet = XLSX.utils.json_to_sheet(jsontable);
    var workbook = XLSX.utils.book_new();
    var wopts = { bookType: "xlsx", bookSST: false, type: "binary" };

    //worksheet["A1"].s = { font: {sz: 14, bold: true, color: "#FF00FF" }}
    worksheet["!autofilter"] = { ref: worksheet["!ref"] };
    worksheet["!cols"] = [{ width: 18 }, { width: 28 }, { width: 15 }, { width: 12 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 35 }, { width: 25 }, { width: 15 }, { width: 25 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 100 }, { width: 100 }, { width: 25 }];

    XLSX.utils.book_append_sheet(workbook, worksheet);
    var wbout = XLSX.write(workbook, wopts);

    const today = moment()
        .format("DD.MMM.YYYY")
        .toUpperCase();
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), "pipeline_candidates." + status + "." + today + ".xlsx");
}
