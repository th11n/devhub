"use client";

import { useEffect } from "react";
import { flushPendingSubmissions } from "@/lib/submission-queue";

export default function PwaManager() {
	useEffect(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.register("/sw.js").catch((error) => {
				console.error("Could not register service worker", error);
			});
		}

		const sync = () => void flushPendingSubmissions();
		sync();
		window.addEventListener("online", sync);
		window.addEventListener("focus", sync);
		return () => {
			window.removeEventListener("online", sync);
			window.removeEventListener("focus", sync);
		};
	}, []);

	return null;
}
