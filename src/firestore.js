import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	// Replace with your own Firebase configuration key

	apiKey: "AIzaSyAM4A5JuGrBgEoKCqXBiSqXEZbkt9XIfmA",
	authDomain: "webrtc-e1b4e.firebaseapp.com",
	projectId: "webrtc-e1b4e",
	storageBucket: "webrtc-e1b4e.appspot.com",
	messagingSenderId: "658442262566",
	appId: "1:658442262566:web:8545c52f3452b403692ee7",
	measurementId: "G-PMWYGPFJGX"
};

const app = initializeApp(firebaseConfig);
export default getFirestore(app);
