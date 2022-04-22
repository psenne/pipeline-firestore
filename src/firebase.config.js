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
};

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

if (window.location.hostname === "localhost") {
    firebase.functions().useEmulator("localhost", 5001);
    firebase.auth().useEmulator("http://localhost:9099/");
    firebase.firestore().useEmulator("localhost", 8080);
    firebase.database().useEmulator("localhost", 9000);
    firebase.storage().useEmulator("localhost", 9199);
}

const fbStorage = firebase.storage().ref();

const fbCandidatesDB = firebase.firestore().collection("candidates");
const fbEmployeesDB = firebase.firestore().collection("employees");
const fbCandidatesOld = firebase.database().ref("candidates");
const fbPositionsDB = firebase.firestore().collection("positions");
const fbPositionsOld = firebase.database().ref("positions");

const fbComments = firebase.firestore().collection("comments");

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
const SignOut = () => {
    return fbauth.signOut();
};

const SignInWithMicrosoft = () => {
    const provider = new firebase.auth.OAuthProvider("microsoft.com");
    provider.setCustomParameters({
        // Optional "tenant" parameter in case you are using an Azure AD tenant.
        // eg. '8eaef023-2b34-4da1-9baa-8bc8c9d6a490' or 'contoso.onmicrosoft.com'
        // or "common" for tenant-independent tokens.
        // The default value is "common".
        tenant: "8ae75429-ded1-468f-8270-cd49645289d9"
        //prompt: "none"
    });
    provider.addScope("User.Read");
    return fbauth.signInWithRedirect(provider);
    // return fbauth.signInWithPopup(provider);
};

export default firebase;
export { fbStorage, fbLoginsDB, fbUsersDB, fbauth, fbComments, fbCandidatesOld, fbCandidatesDB, fbEmployeesDB, fbPositionsDB, fbPositionsOld, fbAuditTrailDB, fbFlagNotes, fbStatusesDB, fbContractsDB, fbLOIStatusesDB, SignInWithGoogle, SignOut, SignInWithMicrosoft };
