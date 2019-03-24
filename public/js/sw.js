var version = "1.0",
    cacheList = [
        "/",
        "css/global.css",
        "css/mani.css",
        "css/modal.css",
        "js/globals.js",
        "js/ProgressHandler.js",
        "js/modalHandler.js",
        "js/loadHandler.js",
    ];

/*  Service Worker Event Handlers */

self.addEventListener("install", function (event) {

    console.log("Installing the service worker!");

    caches.open("PRECACHE")
        .then(function (cache) {

            cache.addAll(cacheList);

        });

});

self.addEventListener("activate", function (event) {

    console.log("Activating the service worker!");

});

self.addEventListener("fetch", function (event) {

    event.respondWith(
        caches.match(event.request)
            .then(function (response) {

                if (response) {
                    return response;
                }

                return fetch(event.request);
            })
    );

});
