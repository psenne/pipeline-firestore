const functions = require("firebase-functions");
const admin = require("firebase-admin");
var rlt = admin.database();
var fsdb = admin.firestore();

exports.updateContractName = functions.database.ref("/contracts/{id}/name").onUpdate((change, context) => {
    const now = new Date();
    const oldname = change.before.val();
    const newname = change.after.val();
    const event = {
        eventdate: now.toJSON(),
        eventinfo: `Contract name changed to ${newname}.`,
        candidatename: oldname
    };

    fsdb.collection("positions")
        .where("contract", "==", oldname)
        .get()
        .then(docs => {
            docs.forEach(doc => {
                doc.ref.update({ contract: newname });
            });
        });

    rlt.ref("auditing")
        .push(event)
        .then(() => {
            functions.logger.log(event);
        });

    return null;
});
