const admin = require("firebase-admin");
admin.initializeApp();

const candFns = require("./candidates.js");
const posFns = require("./positions.js");
const emplFns = require("./employees.js");
const subFns = require("./submissions.js");

exports.candFns = candFns;
exports.posFns = posFns;
exports.emplFns = emplFns;
exports.subFns = subFns;
