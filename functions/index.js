const functions = require("firebase-functions");
const admin = require("firebase-admin");
const datefns = require("date-fns");
const atob = require("atob");
const _ = require("lodash");

admin.initializeApp();
var db = functions.firestore;
var rlt = admin.database();


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

// exports.updateCandidateStatus = db.document("/candidates/{candidateID}").onWrite((change, context) => {
//     const candidateinfo = change.after.data();
//     let status = candidateinfo.status;
//     const interviewed = candidateinfo.loi_status == "notsent" && candidateinfo.interview_date;
//     const loisent = candidateinfo.loi_status == "sent";
//     const loiaccepted = candidateinfo.loi_status == "accepted";
//     const submitted = candidateinfo.submitted_positions != null;

//     if (submitted) {
//     } else if (loiaccepted) {
//         status = "active";
//     } else if (loisent) {
//         status = "recruiting";
//     } else if (interviewed) {
//         status = "interviewed";
//     } else {
//         status = "initial";
//     }

//     // return change.after.ref.set({status}, {merge:true}).then(()=>{
//     //     console.log(`Updated ${candidateinfo.firstname} ${candidateinfo.lastname} status to ${status}.`);
//     // }); //prettier-ignore
// });

exports.toggleSubmissionStatusCreate = db.document("/positions/{positionID}/submitted_candidates/{candidateID}").onCreate((data, context)=>{
    const candidateInfo = data.data();
    const ckey = context.params.candidateID;
    const now = new Date();

    return admin.firestore().doc(`candidates/${ckey}`).set({"status":"processing"}, { merge: true }).then(()=>{ 
        const eventinfo = `${candidateInfo.candidate_name} was submitted to ${candidateInfo.position_title} on ${candidateInfo.position_contract}.`;
        const event = {
            eventdate: now.toJSON(),
            eventinfo,
            candidatename: candidateInfo.candidate_name
        };

        return rlt.ref("auditing").push(event).then(()=>{ 
            console.info(event);
        });
    });
});

exports.toggleSubmissionStatusDelete = db.document("/positions/{positionID}/submitted_candidates/{candidateID}").onDelete((data, context)=>{
    const candidateInfo = data.data();
    const ckey = context.params.candidateID;
    const now = new Date();

    const event = {
        eventdate: now.toJSON(),
        eventinfo: `${candidateInfo.candidate_name} was removed from ${candidateInfo.position_title} on ${candidateInfo.position_contract}.`,
        candidatename: candidateInfo.candidate_name
    };


    return rlt.ref("auditing").push(event).then(()=>{ 
        console.info(event);
        admin.firestore().doc(`candidates/${ckey}`).collection("submitted_positions").get().then(docs => {
            var stillsubmitted = false;
            docs.forEach(doc => {
                stillsubmitted = true;
            })
            if(!stillsubmitted){
                admin.firestore().doc(`candidates/${ckey}`).set({"status":"active"}, { merge: true });
            }
        });
    });
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
                        if(beforeval !== undefined){
                            new_candidates_keys = _.reduce(afterval, (result, value, key) => (_.isEqual(value, beforeval[key]) ? result : result.concat(key)), []); // https://stackoverflow.com/questions/31683075/how-to-do-a-deep-comparison-between-2-objects-with-lodash
                        }
                        return new_candidates_keys.length > 0 ? new_candidates_keys.map(ckey => `submitted ${afterval[ckey].candidate_name} on ${datefns.format(new Date(afterval[ckey].submission_date), "MMM d, yyyy")}`).join(", ") : undefined; //create event description. undefined if no candidates were added. otherwise join returns ""
                    }
                } 
                else {
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
    } 
    else {
        return () => console.info("No substantial changes.");
    }
});
