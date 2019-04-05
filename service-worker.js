const CACHE_NAME = "xeu.cache.v1";
const urlsToCache = ["/index.html", "/main.js", "style.css"];

this.addEventListener("install", async () => {
    const cache = await caches.open(CACHE_NAME);
    cache.addAll(urlsToCache);
});

self.addEventListener('fetch', (event) => {

    const getCachedResponse = async () => {
        if (/^https?:\/\/.*/.test(event.request.url) === false) {
            return fetch(event.request);
        }
        try {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            }

            const networkedResponse = await fetch(event.request);
            console.log("new cached Response", networkedResponse);

            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkedResponse.clone());
            return networkedResponse;
        } catch (error) {
            console.error('error ', error)
            throw (error);
        }
    }

    event.respondWith(getCachedResponse());
});