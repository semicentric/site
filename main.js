if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js?v=2");
}

UnicornStudio.addScene({
  elementId: "unicorn-container",
  projectId: "hJrULgFwHeuavZfcgp0u",
  scale: 1,
  dpi: 1.5,
  fps: 60,
  lazyLoad: true,
  production: true,
}).then(function () {
  document.body.classList.add("us-ready");
}).catch(function () {
  document.body.classList.add("us-ready");
});


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
