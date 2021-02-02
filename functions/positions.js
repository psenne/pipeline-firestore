const functions = require("firebase-functions");
const admin = require("firebase-admin");
// const firebase_tools = require("firebase-tools");
const datefns = require("date-fns");
const atob = require("atob");
const _ = require("lodash");

var db = functions.firestore;
var rlt = admin.database();
var fsdb = admin.firestore();

/** Position trigger section */

exports.addPositionCreatedEvent = db.document("/positions/{positionID}").onCreate((snapshot, context) => {
    const username = snapshot.data().added_by;
    const positionname = `${snapshot.data().level} ${snapshot.data().title} (${snapshot.data().contract})`;
    const now = new Date();
    const event = {
        eventdate: now.toJSON(),
        eventinfo: `${username} added ${positionname}.`,
        candidatename: positionname
    };

    return rlt.ref("auditing").push(event).then(()=>{ 
        console.log(event);
    }) //prettier-ignore
});

exports.deletedPositionEvent = db.document("/positions/{positionID}").onDelete((snapshot, context) => {
    const positionname = `${snapshot.data().level} ${snapshot.data().title} (${snapshot.data().contract})`;
    const now = new Date();
    const event = {
        eventdate: now.toJSON(),
        eventinfo: `${positionname} was deleted from the database.`,
        candidatename: positionname
    };

    // delete submitted candidates subcollection. because deleting the position, doesn't delete it's children docs
    snapshot.ref
        .collection(`submitted_candidates`)
        .get()
        .then(submissions => {
            const subcollectionbatch = fsdb.batch();
            submissions.forEach(submission => {
                const submissionInfo = submission.data();
                fsdb.collection("candidates").doc(submissionInfo.candidate_id).collection("submitted_positions").doc(submissionInfo.position_key).delete();
                subcollectionbatch.delete(submission.ref);
            });
            subcollectionbatch.commit();
        });

    return rlt.ref("auditing").push(event).then(()=>{ 
        console.info(event);
    }) //prettier-ignore
});

exports.updatePositionEvent = db.document("/positions/{positionID}").onUpdate(({ before, after }, context) => {
    const orgInfo = before.data();
    const newInfo = after.data();
    const username = newInfo.modified_by;

    const positionname = `${newInfo.level} ${newInfo.title} (${newInfo.contract})`;
    const now = new Date();

    //get fields that have changed
    const changedFields = Object.keys({ ...orgInfo, ...newInfo }) //grab all keys
        .map(key => {
            var beforeval = orgInfo[key];
            var afterval = newInfo[key];
            if (!_.isEqual(beforeval, afterval) && key !== "added_on" && key !== "modified_on" && key !== "modified_by" && key !== "added_by") {
                if (key === "candidates_submitted") {
                    if (afterval instanceof Object) {
                        //candidates submitted section
                        var new_candidates_keys = Object.keys(afterval);
                        if (beforeval !== undefined) {
                            new_candidates_keys = _.reduce(afterval, (result, value, key) => (_.isEqual(value, beforeval[key]) ? result : result.concat(key)), []); // https://stackoverflow.com/questions/31683075/how-to-do-a-deep-comparison-between-2-objects-with-lodash
                        }
                        return new_candidates_keys.length > 0 ? new_candidates_keys.map(ckey => `submitted ${afterval[ckey].candidate_name} on ${datefns.format(new Date(afterval[ckey].submission_date), "MMM d, yyyy")}`).join(", ") : undefined; //create event description. undefined if no candidates were added. otherwise join returns ""
                    }
                } else {
                    //other than candidate submissions
                    if (beforeval !== "" && afterval === "") {
                        return `erased "${beforeval}" from ${key.replace(/[_]/g, " ").toUpperCase()}`;
                    } else if (beforeval === "" && afterval !== "") {
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
            candidatename: positionname
        };
        return rlt.ref("auditing").push(event).then(()=>{ 
            console.info(event);
        }) //prettier-ignore
    } else {
        return () => console.info("No substantial changes.");
    }
});
