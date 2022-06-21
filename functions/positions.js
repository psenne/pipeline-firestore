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
        functions.logger.log(event);
    }) //prettier-ignore
});

exports.deletedPositionEvent = db.document("/positions/{positionID}").onDelete((snapshot, context) => {
    const positionname = `${snapshot.data().level} ${snapshot.data().title} (${snapshot.data().contract})`;
    const pkey = context.params.positionID;
    const now = new Date();
    const event = {
        eventdate: now.toJSON(),
        eventinfo: `${positionname} was deleted from the database.`,
        candidatename: positionname
    };

    //delete submission
    fsdb.collection("submissions")
        .where("position_key", "==", pkey)
        .get()
        .then(docs => {
            docs.forEach(doc => {
                doc.ref.delete();
            });
        })
        .catch(err => {
            functions.logger.log(err);
        });

    return rlt.ref("auditing").push(event).then(()=>{ 
        functions.logger.info(event);
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
                if (beforeval !== "" && afterval === "") {
                    return `erased "${beforeval}" from ${key.replace(/[_]/g, " ").toUpperCase()}`;
                } else if (beforeval === "" && afterval !== "") {
                    return `added "${afterval}" to ${key.replace(/[_]/g, " ").toUpperCase()}`;
                } else {
                    return `updated ${key.replace(/[_]/g, " ").toUpperCase()} to "${afterval}"`;
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
            functions.logger.info(event);
        }) //prettier-ignore
    }

    return false;
});
