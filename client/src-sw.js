const { offlineFallback, warmStrategyCache } = require("workbox-recipes");
const { CacheFirst } = require("workbox-strategies");
const { registerRoute } = require("workbox-routing");
const { CacheableResponsePlugin } = require("workbox-cacheable-response");
const { ExpirationPlugin } = require("workbox-expiration");
const { precacheAndRoute } = require("workbox-precaching/precacheAndRoute");

precacheAndRoute(self.__WB_MANIFEST);

const pageCache = new CacheFirst({
  cacheName: "page-cache",
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
    }),
  ],
});

offlineFallback({
  cacheName: "offline-cache",
  fallbackHTML: "<h1>You are offline</h1>",
  fallbacks: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
      response: "<img src='/offline-image.png'>",
    },
    {
      urlPattern: /\.(?:js|css)$/,
      response: "",
    },
  ],
});

warmStrategyCache({
  urls: ["/index.html", "/"],
  strategy: pageCache,
});

registerRoute(({ request }) => request.mode === "navigate", pageCache);

// TODO: Implement asset caching
registerRoute(
  ({ request }) =>
    request.destination === "style" || request.destination === "script",
  new CacheFirst({
    cacheName: "assets-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);
