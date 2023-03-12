import { createRouter, createWebHistory } from "vue-router";
import CompAnswer from "./components/CompAnswer";
import CompOffer from "./components/CompOffer";

const routes = [
	{
		path: "/offer",
		component: CompOffer
	},
	{
		path: "/answer",
		component: CompAnswer
	}
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes
});

export default router;
