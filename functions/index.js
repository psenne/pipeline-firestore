const functions = require("firebase-functions");
const admin = require("firebase-admin");
// const firebase_tools = require("firebase-tools");
const datefns = require("date-fns");
const atob = require("atob");
const _ = require("lodash");

admin.initializeApp();
var db = functions.firestore;
var rlt = admin.database();
var fsdb = admin.firestore();

/// firestore context
// >  {
// >    eventId: '4cd027da-9bc4-40c6-ab46-c84aa7511ffb',
// >    timestamp: '2020-10-18T19:51:38.104Z',
// >    eventType: 'google.firestore.document.update',
// >    resource: {
// >      service: 'firestore.googleapis.com',
// >      name: 'projects/new-staffing-pipeline-prod/databases/(default)/documents/candidates/3f4JOlA8wM2Vga1URjtD'
// >    },
// >    params: { candidateID: '3f4JOlA8wM2Vga1URjtD' }
// >  }

// exports.recursiveDelete = functions
//     .runWith({
//         timeoutSeconds: 540,
//         memory: "2GB"
//     })
//     .https.onCall(async (data, context) => {
//         // Only allow admin users to execute this function.
//         // if (!(context.auth && context.auth.token && context.auth.token.admin)) {
//         //     throw new functions.https.HttpsError("permission-denied", "Must be an administrative user to initiate delete.");
//         // }
//         console.log(data.path);
//         const path = data.path;
//         console.log(`User ${context.auth.uid} has requested to delete path ${path}`);

//         // Run a recursive delete on the given document or collection path.
//         // The 'token' must be set in the functions config, and can be generated
//         // at the command line by running 'firebase login:ci'.
//         await firebase_tools.firestore.delete(path, {
//             project: process.env.GCLOUD_PROJECT,
//             recursive: true,
//             yes: true,
//             token: functions.config().fb.token
//         });

//         return {
//             path: path
//         };
//     });

// when a candidate has been submitted to a position, then change status to processing
exports.toggleSubmissionStatusCreate = db.document("/positions/{positionID}/submitted_candidates/{candidateID}").onCreate((data, context) => {
    const candidateInfo = data.data();

    const ckey = context.params.candidateID;
    const now = new Date();

    return fsdb
        .doc(`candidates/${ckey}`)
        .set({ status: "processing" }, { merge: true })
        .then(() => {
            const eventinfo = `${candidateInfo.candidate_name} was submitted to ${candidateInfo.position_title} on ${candidateInfo.position_contract}.`;
            const event = {
                eventdate: now.toJSON(),
                eventinfo,
                candidatename: candidateInfo.candidate_name
            };

            return rlt
                .ref("auditing")
                .push(event)
                .then(() => {
                    console.info(event);
                });
        });
});

// when a candidate has been unsubmitted from a position, then change status back to active (unless they still have other submissions)
exports.toggleSubmissionStatusDelete = db.document("/positions/{positionID}/submitted_candidates/{candidateID}").onDelete((data, context) => {
    const candidateInfo = data.data();
    const ckey = context.params.candidateID;
    const now = new Date();

    const event = {
        eventdate: now.toJSON(),
        eventinfo: `${candidateInfo.candidate_name} was removed from ${candidateInfo.position_title} on ${candidateInfo.position_contract}.`,
        candidatename: candidateInfo.candidate_name
    };

    return rlt
        .ref("auditing")
        .push(event)
        .then(() => {
            console.info(event);
            fsdb.doc(`candidates/${ckey}`)
                .get()
                .then(candidate => {
                    if (candidate.exists) {
                        candidate.ref
                            .collection("submitted_positions")
                            .get()
                            .then(submissions => {
                                var stillsubmitted = false;
                                submissions.forEach(submission => {
                                    stillsubmitted = true;
                                });
                                if (!stillsubmitted) {
                                    candidate.ref.set({ status: "active" }, { merge: true });
                                }
                            });
                    }
                });
        });
});

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
