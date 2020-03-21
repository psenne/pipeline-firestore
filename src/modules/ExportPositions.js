import XLSX from "xlsx";
import { saveAs } from "file-saver";
import { format, parseISO } from "date-fns";

// some random function for excel exporting
function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
}

// position:
//     title: String,
//     description: String,
//     level: String,
//     position_id: String,
//     contract: String,
//     candidate_submitted: Array of Objects,
//     location: String,
//     added_on: Date

export default function(positions) {
    const jsontable = positions.map(item => {

        const added_on = item.info.added_on ? format(parseISO(item.info.added_on), "MMM, d yyyy") : "";
        const candidates = item.info.candidates_submitted || {};

        return {
            "Position ID": item.info.position_id,
            "Position Title": item.info.title,
            Contract: item.info.contract,
            Summary: item.info.skill_summary,
            Description: item.info.description,
            Level: item.info.level,
            Location: item.info.location,

            Submissions: Object.keys(candidates).map(key => candidates[key].candidate_name).join(", "),
            "Added on": added_on
        };
    });

    var worksheet = XLSX.utils.json_to_sheet(jsontable);
    var workbook = XLSX.utils.book_new();
    var wopts = { bookType: "xlsx", bookSST: false, type: "binary" };

    //worksheet["A1"].s = { font: {sz: 14, bold: true, color: "#FF00FF" }}
    worksheet["!autofilter"] = { ref: worksheet["!ref"] };
    worksheet["!cols"] = [{ width: 13 }, { width: 45 }, { width: 20 }, { width: 40 }, { width: 40 }, { width: 20 }, { width: 20 }, { width: 50 }, { width: 20 }];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Open Positions");
    var wbout = XLSX.write(workbook, wopts);

    const today = format(new Date(), "dd.MMM.yyyy").toUpperCase();
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), "positions." + today + ".xlsx");
}
