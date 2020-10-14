import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";
import "firebase/storage";

var prodconfig = {
    apiKey: "AIzaSyCNMMcb5kK1Mc-8v-_LjxI6gl7RDLbfj98",
    authDomain: "staffing-pipeline.firebaseapp.com",
    databaseURL: "https://staffing-pipeline.firebaseio.com",
    projectId: "staffing-pipeline",
    storageBucket: "staffing-pipeline.appspot.com",
    messagingSenderId: "403362370549",
    appId: "1:403362370549:web:c3a6d08e56a8e152c406bc"

};

var newconfig = {
    apiKey: "AIzaSyC49vm8o8hAe1tyGGRSyEaHXab_Jq_UpRI",
    authDomain: "new-staffing-pipeline-prod.firebaseapp.com",
    databaseURL: "https://new-staffing-pipeline-prod.firebaseio.com",
    projectId: "new-staffing-pipeline-prod",
    storageBucket: "new-staffing-pipeline-prod.appspot.com",
    messagingSenderId: "893630469792",
    appId: "1:893630469792:web:73127b6dc47d1098de5bc5",
    measurementId: "G-8F9BPWLV46"
  };

var devconfig = {
    apiKey: "AIzaSyCzu1yAol8hre3s8SGINGzf0BwVFhxrIbY",
    authDomain: "staffing-pipeline-dev.firebaseapp.com",
    databaseURL: "https://staffing-pipeline-dev.firebaseio.com",
    projectId: "staffing-pipeline-dev",
    storageBucket: "staffing-pipeline-dev.appspot.com",
    messagingSenderId: "90337545773",
    appId: "1:90337545773:web:39eda8e65470fdda90b2a4"
  
};

// eslint-disable-next-line
const config = process.env.NODE_ENV === "production" ? newconfig : newconfig;
// const config = process.env.NODE_ENV === "production" ? prodconfig : devconfig;
// const config = process.env.NODE_ENV === "production" ? devconfig : devconfig;

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

const fbStorage = firebase.storage().ref();

const fbCandidatesDB = firebase.firestore().collection("candidates");
const fbCandidatesOld = firebase.database().ref("candidates");
const fbPositionsDB = firebase.firestore().collection("positions");
const fbPositionsOld = firebase.database().ref("positions");

const fbUsersDB = firebase.database().ref("users");
const fbLoginsDB = firebase.database().ref("logins");
const fbAuditTrailDB = firebase.database().ref("auditing");
const fbStatusesDB = firebase.database().ref("statuses");
const fbContractsDB = firebase.database().ref("contracts");
const fbLOIStatusesDB = firebase.database().ref("loistatuses");
const fbFlagNotes = firebase.database().ref("flagnotes");

const fbauth = firebase.auth();

//callback function for clicking Login Button
const SignInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider(); //strictly use Google's Authentication service (built in to Firebase)
    return fbauth.signInWithPopup(provider);
};

//callback function for clicking profile avatar (logout button)
const SignOutWithGoogle = () => {
    return fbauth.signOut();
};

export default firebase;
export { fbStorage, fbLoginsDB, fbUsersDB, fbauth, fbCandidatesOld, fbCandidatesDB, fbPositionsDB, fbPositionsOld, fbAuditTrailDB, fbFlagNotes, fbStatusesDB, fbContractsDB, fbLOIStatusesDB, SignInWithGoogle, SignOutWithGoogle };
