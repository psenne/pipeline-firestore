const functions = require("firebase-functions");
const admin = require("firebase-admin");
// const firebase_tools = require("firebase-tools");
const datefns = require("date-fns");
const atob = require("atob");
const _ = require("lodash");

var db = functions.firestore;
var rlt = admin.database();
var fsdb = admin.firestore();

// when a candidate has been submitted to a position, then change status to processing

exports.addCreatedEvent = db.document("/candidates/{candidateID}").onCreate((snapshot, context) => {
    const username = snapshot.data().created_by;
    const candidatename = `${snapshot.data().firstname} ${snapshot.data().lastname}`;
    const now = new Date();
    const event = {
        eventdate: now.toJSON(),
        eventinfo: `${username} added ${candidatename}.`,
        candidatename
    };

    return rlt.ref("auditing").push(event).then(()=>{ 
        console.log(event);
    }) //prettier-ignore
});

exports.updateCandidateEvent = db.document("/candidates/{candidateID}").onUpdate(({ before, after }, context) => {
    const orgInfo = before.data();
    const newInfo = after.data();

    const username = newInfo.modified_by;
    const candidatename = `${orgInfo.firstname} ${orgInfo.lastname}`;
    const now = new Date();

    //get fields that have changed
    const changedFields = Object.keys({ ...orgInfo, ...newInfo }) //grab all keys
        .map(key => {
            var beforeval = orgInfo[key];
            var afterval = newInfo[key];
            if (JSON.stringify(beforeval) !== JSON.stringify(afterval) && key !== "submitted_positions" && key !== "isFlagged" && key !== "flag_history" && key !== "status" && key !== "modified_fields" && key !== "modified_date" && key !== "modified_by" && key !== "created_date" && key !== "created_by") {
                if (beforeval === undefined && afterval instanceof Array) {
                    //field was filled in
                    return `added "${afterval.join(", ")}" to ${key.replace(/[_]/g, " ").toUpperCase()}`;
                } else if (beforeval instanceof Array && afterval === undefined) {
                    //field was erased
                    return `erased "${beforeval.join(", ")}" from ${key.replace(/[_]/g, " ").toUpperCase()}`;
                } else if (beforeval instanceof Array && afterval instanceof Array) {
                    //field was added to or removed from
                    if (!afterval.every(e => beforeval.includes(e)) || !beforeval.every(e => afterval.includes(e))) {
                        //if the array elements have changed, then add key to changedFields
                        return `updated ${key.replace(/[_]/g, " ").toUpperCase()} to "${afterval.join(", ")}"`;
                    }
                } else {
                    //field is not multiple selection
                    if (key === "interview_date" || key === "loi_sent_date" || key === "flagged_on") {
                        beforeval = beforeval ? datefns.format(beforeval.toDate(), "M/d/yyyy") : "";
                        afterval = afterval ? datefns.format(afterval.toDate(), "M/d/yyyy") : "";
                    }
                    if (key === "salary") {
                        afterval = afterval ? "$" + atob(afterval) : "";
                    }
                    if (beforeval && !afterval) {
                        return `erased "${beforeval}" from ${key.replace(/[_]/g, " ").toUpperCase()}`;
                    } else if (!beforeval && afterval) {
                        return `added "${afterval}" to ${key.replace(/[_]/g, " ").toUpperCase()}`;
                    } else {
                        return `updated ${key.replace(/[_]/g, " ").toUpperCase()} to "${afterval}"`;
                    }
                }
            }
        })
        .filter(key => {
            if (key !== undefined) {
                return true;
            }
        });

    if (changedFields.length > 0) {
        const eventinfo = `${username} ${changedFields.join(", ")}`;
        const event = {
            eventdate: now.toJSON(),
            eventinfo,
            candidatename
        };

        //return () => console.info("All fields:", changedFields, newInfo);

        return rlt.ref("auditing").push(event).then(()=>{ 
            console.info(event);
        }) //prettier-ignore
    }
});

exports.deletedCandidateEvent = db.document("/candidates/{candidateID}").onDelete((snapshot, context) => {
    const candidatename = `${snapshot.data().firstname} ${snapshot.data().lastname}`;
    const now = new Date();
    const event = {
        eventdate: now.toJSON(),
        eventinfo: `${candidatename} was deleted from the database.`,
        candidatename
    };

    // delete submitted positions subcollection. because deleting the candidate, doesn't delete it's children docs
    snapshot.ref
        .collection(`submitted_positions`)
        .get()
        .then(submissions => {
            const subcollectionbatch = fsdb.batch();
            submissions.forEach(submission => {
                const submissionInfo = submission.data();
                fsdb.collection("positions").doc(submissionInfo.position_key).collection("submitted_candidates").doc(submissionInfo.candidate_id).delete();
                subcollectionbatch.delete(submission.ref);
            });
            subcollectionbatch.commit();
        });

    return rlt.ref("auditing").push(event).then(()=>{ 
        console.info(event);
    }) //prettier-ignore
});
