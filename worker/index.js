// Custom service worker logic merged into the next-pwa generated worker.
// Handles Web Push notifications for streak reminders, new questions,
// leaderboard changes and exam-results-ready events.

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: "TECHMED AIS", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "TECHMED AIS Brainstorming";
  const options = {
    body: payload.body || "You have a new update.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-96.png",
    tag: payload.tag || "techmed-notification",
    data: { url: payload.url || "/dashboard" },
    vibrate: [80, 40, 80],
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
