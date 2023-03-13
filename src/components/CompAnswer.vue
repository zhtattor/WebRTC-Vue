git branch -M main
<template>
	<div>
		<button @click="answer">Answer</button>
		<video id="vid" playsinline=""></video>
	</div>
</template>

<script>
	import firestore from "@/firestore";
	import { setDoc, doc, arrayUnion, updateDoc, getDoc } from "@firebase/firestore";

	export default {
		data() {
			return { pc: null, stream: new MediaStream() };
		},
		methods: {
			async answer() {
				// TURN servers

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
					console.log("Peer state => ", pc.iceGatheringState);
				});

				// Sending the answerer's ICE candidates to the offerer
				const icesref = doc(firestore, "answer", "ices");
				await setDoc(icesref, { ices: [] });
				this.pc.onicecandidate = (e) => {
					if (e.candidate) {
						updateDoc(icesref, {
							ices: arrayUnion(e.candidate.toJSON())
						}).then(() => {
							console.log("Successfully set ICE candidate");
						});
					}
				};

				// Receiving remote tracks
				this.pc.ontrack = (event) => {
					console.log("New track recieved !!!");
					event.streams[0].getTracks().forEach((track) => {
						this.stream.addTrack(track);
					});
				};

				// Set the track into the DOM
				const vid = document.getElementById("vid");
				vid.srcObject = this.stream;
				vid.play(); // Make sure to play the video, otherwise there will be no video

				// ----Extracting the offer from firestore
				const offer = await getDoc(doc(firestore, "offer", "main")); // Get the main SDP
				const iceslist = await getDoc(doc(firestore, "offer", "ices")); // Get offerer ICE candidates
				let offersdp, iceslistreal;
				if (offer.exists()) offersdp = offer.data();
				if (iceslist.exists()) iceslistreal = iceslist.data();

				// Setting remote description here
				await this.pc.setRemoteDescription(new RTCSessionDescription(offersdp));

				// Generating answer and setting the answer
				let answer = await this.pc.createAnswer();
				await setDoc(doc(firestore, "answer", "main"), answer.toJSON());
				console.log("Successfully set the answer");

				// Setting local description and offerer's ICE candidates here
				await this.pc.setLocalDescription(new RTCSessionDescription(answer));
				iceslistreal["ices"].forEach((e) => {
					this.pc.addIceCandidate(new RTCIceCandidate(e));
				});
			}
		}
	};
</script>
