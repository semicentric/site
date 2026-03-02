if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

UnicornStudio.addScene({
  elementId: "unicorn-container",
  projectId: "hJrULgFwHeuavZfcgp0u",
  scale: 1,
  dpi: 1.5,
  fps: 60,
  lazyLoad: true,
  production: true,
});
