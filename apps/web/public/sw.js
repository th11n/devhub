const CACHE = "devhub-shell-v2";
const APP_SHELL = ["/", "/manifest.webmanifest", "/logo.png"];

self.addEventListener("install", (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
				),
			),
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	const url = new URL(event.request.url);
	const cacheable =
		url.origin === self.location.origin &&
		(event.request.mode === "navigate" ||
			url.pathname === "/" ||
			url.pathname.startsWith("/_next/static/") ||
			url.pathname === "/logo.png" ||
			url.pathname === "/manifest.webmanifest");
	if (event.request.method !== "GET" || !cacheable) return;
	event.respondWith(
		fetch(event.request)
			.then((response) => {
				const copy = response.clone();
				caches.open(CACHE).then((cache) => cache.put(event.request, copy));
				return response;
			})
			.catch(() =>
				caches
					.match(event.request)
					.then((cached) => cached || caches.match("/quick-add")),
			),
	);
});
