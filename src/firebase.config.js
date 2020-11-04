import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";
import "firebase/storage";
import "firebase/functions";


var config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
}

if (window.location.hostname === 'localhost') {
  config.databaseURL = "http://localhost:9000?ns=new-staffing-pipeline-prod"
}

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

if (window.location.hostname === 'localhost') {
  firebase.functions().useFunctionsEmulator('http://localhost:5001');
  firebase.firestore().settings({
    host: 'localhost:8080',
    ssl: false
  });
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
