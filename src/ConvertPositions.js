import { fbPositionsDB, fbPositionsOld } from "./firebase.config.js";
import tmplPosition from "./constants/positionInfo";
import { parseISO } from "date-fns";
import history from "./modules/history";

export function ExportPositions() {
    fbPositionsOld.on("value", data => {
        data.forEach(function(item) {
            const info = item.val();
            const key = item.key;

            const position = {};
            for (let [k, v] of Object.entries(info)) {
                if (k.includes("added_on") && v !== "") {
                    position[k] = parseISO(v);
                } else if (v !== "") {
                    position[k] = v;
                } else {
                    //position[k] = null;
                }
            }
            fbPositionsDB.doc(key).set({...tmplPosition, ...position});
        });
    });
    history.push("/positions")
    
}
