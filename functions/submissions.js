const functions = require("firebase-functions");
const admin = require("firebase-admin");
// const firebase_tools = require("firebase-tools");
const datefns = require("date-fns");
const atob = require("atob");
const _ = require("lodash");

var db = functions.firestore;
var rlt = admin.database();
var fsdb = admin.firestore();

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
