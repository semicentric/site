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

setTimeout(function () {
  window.scrollTo(0, 1);
}, 100);

document.getElementById("contact-link").addEventListener("click", function (e) {
  e.preventDefault();
  var u = "plyght";
  var d = "semicentric.co";
  var addr = u + "@" + d;
  navigator.clipboard.writeText(addr).then(function () {
    var el = e.target;
    el.textContent = "Copied!";
    setTimeout(function () { el.textContent = "Contact"; }, 1500);
  });
});
