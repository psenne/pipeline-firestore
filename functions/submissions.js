const functions = require("firebase-functions");
const admin = require("firebase-admin");
// const firebase_tools = require("firebase-tools");
const datefns = require("date-fns");
const atob = require("atob");
const _ = require("lodash");

var db = functions.firestore;
var rlt = admin.database();
var fsdb = admin.firestore();

exports.toggleSubmissionStatusCreate = db.document("/submissions/{id}").onCreate((data, context) => {
    const info = data.data();
    const ckey = info.candidate_key;
    const now = new Date();

    const eventinfo = `${info.candidate_name} was submitted to ${info.position_title} on ${info.contract}.`;
    const event = {
        eventdate: now.toJSON(),
        eventinfo,
        candidatename: info.candidate_name
    };

    return rlt
        .ref("auditing")
        .push(event)
        .then(() => {
            functions.logger.log(event);
            fsdb.doc(`candidates/${ckey}`).set({ status: "processing" }, { merge: true });
        });
});

// when a candidate has been unsubmitted from a position, then change status back to active (unless they still have other submissions)
exports.toggleSubmissionStatusDelete = db.document("/submissions/{id}").onDelete((data, context) => {
    const info = data.data();
    const ckey = info.candidate_key;
    const now = new Date();

    const event = {
        eventdate: now.toJSON(),
        eventinfo: `${info.candidate_name} was unsubmitted from ${info.position_title} on ${info.contract}.`,
        candidatename: info.candidate_name
    };

    return rlt
        .ref("auditing")
        .push(event)
        .then(() => {
            functions.logger.log(event);

            fsdb.collection("submissions")
                .where("candidate_key", "==", ckey)
                .get()
                .then(docs => {
                    if (docs.empty) {
                        fsdb.doc(`candidates/${ckey}`)
                            .get()
                            .then(candidate => {
                                if (candidate.exists) {
                                    candidate.ref.set({ status: "active" }, { merge: true });
                                }
                            });
                    } else {
                        fsdb.doc(`candidates/${ckey}`)
                            .get()
                            .then(candidate => {
                                if (candidate.exists) {
                                    candidate.ref.set({ status: "processing" }, { merge: true });
                                }
                            });
                    }
                });
        });
});
