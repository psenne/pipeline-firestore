const functions = require("firebase-functions");
const admin = require("firebase-admin");
// const firebase_tools = require("firebase-tools");
const datefns = require("date-fns");
const atob = require("atob");
const _ = require("lodash");

var db = functions.firestore;
var rlt = admin.database();
// var fsdb = admin.firestore();
// var bucket = admin.storage().bucket();

exports.deleteEmployee = db.document("/employees/{id}").onDelete((snapshot, context) => {
    const name = `${snapshot.data().firstname} ${snapshot.data().lastname}`;
    const id = context.params.id;
    const now = new Date();
    const event = {
        eventdate: now.toJSON(),
        eventinfo: `${name} was deleted from the database.`,
        candidatename: name
    };

    // console.log(bucket);

    // bucket.deleteFiles({
    //     prefix: `${id}/`
    // });

    return rlt.ref("auditing").push(event).then(()=>{ 
        console.info(event);
    }) //prettier-ignore
});
