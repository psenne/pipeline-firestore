import { fbCandidatesDB, fbCandidatesOld } from "./firebase.config.js";
import { tmplCandidate } from "./constants/candidateInfo";
import { parseISO } from "date-fns";

export function ExportCandidates() {
  fbCandidatesOld.limitToFirst(500).on("value", data => {
    data.forEach(function(item) {
      const info = item.val();
      const key = item.key;

      const candidate = {};
      for (let [k, v] of Object.entries(info)) {
        if (k.includes("date") && v !== "") {
          candidate[k] = parseISO(v);
        } 
        else if (v !== "") {
          candidate[k] = v;
        } 
        else {
          candidate[k] = null;
        }
      }
      console.log(candidate);
      fbCandidatesDB.doc(key).set(candidate)
    });
  });
}
