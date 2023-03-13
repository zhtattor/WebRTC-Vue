<template>
	<div>
		<button @click="offer">Offer</button>
		<button @click="connect">Connect</button>
	</div>
</template>

<script>
	// eslint-disable-next-line
	import firestore from "@/firestore";
	// eslint-disable-next-line
	import { updateDoc, getDoc, doc, setDoc, arrayUnion } from "firebase/firestore";

	export default {
		data() {
			return {
				pc: null
			};
		},
		methods: {
			async offer() {
				// Create a new peer connection
				const turn_config = {
					iceServers: [
						{
							urls: "stun:relay.metered.ca:80"
						},
						{
							urls: "turn:relay.metered.ca:80",
							username: "7c6e2dfc7ba5dd33578fc9e1",
							credential: "18GkZDVEKpCweYAf"
						},
						{
							urls: "turn:relay.metered.ca:443",
							username: "7c6e2dfc7ba5dd33578fc9e1",
							credential: "18GkZDVEKpCweYAf"
						},
						{
							urls: "turn:relay.metered.ca:443?transport=tcp",
							username: "7c6e2dfc7ba5dd33578fc9e1",
							credential: "18GkZDVEKpCweYAf"
						}
					]
				};
				this.pc = new RTCPeerConnection(turn_config);
				this.pc.addEventListener("icegatheringstatechange", () => {
					console.log("Peer state => ", this.pc.iceGatheringState);
				});
				// Getting the user media ( Webcam in this case )
				const stream = await navigator.mediaDevices.getUserMedia({ video: true });
				stream.getTracks().forEach((track) => {
					this.pc.addTrack(track, stream);
					// Adding the tracks to the peer to stream to the other side
				});

				// Setting the ICE candidates to firestore
				const icesref = doc(firestore, "offer", "ices");
				await setDoc(icesref, {
					ices: []
				}); // CLearing out the prevbiously ICE candidates list
				this.pc.onicecandidate = (e) => {
					if (e.candidate) {
						updateDoc(icesref, {
							ices: arrayUnion(e.candidate.toJSON())
						}).then(() => {
							console.log("Successfully set ICE candidate");
						});
					}
				};

				// Create an offer and set it in firestore
				let offer = await this.pc.createOffer();
				await setDoc(doc(firestore, "offer", "main"), offer.toJSON());
				// Setting the offer to firestore
				console.log("Successfully set offer");

				await this.pc.setLocalDescription(offer);
			},
			async connect() {
				// Extracting the answer and set to local description
				// Extract he ICE candidates also

				// Getting Answerer's SDP here
				const answer = await getDoc(doc(firestore, "answer", "main")); // Getting the answer
				const ices = await getDoc(doc(firestore, "answer", "ices")); // Get answerer ICE candidates
				let answersdp, iceslistreal;
				if (answer.exists()) answersdp = answer.data();
				if (ices.exists()) iceslistreal = ices.data();

				// Setting remote Description here
				await this.pc.setRemoteDescription(new RTCSessionDescription(answersdp));
				iceslistreal["ices"].forEach((e) => {
					this.pc.addIceCandidate(new RTCIceCandidate(e));
				});
				console.log("Successfully set remote description");
			}
		}
	};
</script>
