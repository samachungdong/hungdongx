// =============================================================================
// DELAY-JS SIMULATOR — reproduces the class of bug LiteSpeed Cache's "Delay JS
// Execution" causes on custodian.com.au: scripts do not run at all until the
// visitor interacts (mouseover / click / keydown / wheel / touchstart /
// touchmove). GitHub Pages has no server-side plugin like LiteSpeed, so this
// file recreates the SAME mechanism by hand: any <script> written with
// type="text/plain" and either data-delayed-src="..." (external) or inline
// content is left inert by the browser (browsers only execute recognized JS
// mime types) until this simulator swaps it back to a real <script> on the
// first qualifying interaction — exactly what LiteSpeed's own client-side
// re-activation code does for tags it has rewritten server-side.
//
// USAGE — must be the very FIRST script in <head>, loaded normally (no
// type="text/plain" on this one):
//   <script src="delay-js-simulator.js"></script>
//   <script type="text/plain" data-delayed-src="https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX"></script>
//
// This only reproduces the "nothing runs until interaction" symptom for
// demonstration/testing. It is not a copy of LiteSpeed's actual code.
// =============================================================================
(function () {
  "use strict";

  var INTERACTION_EVENTS = ["mouseover", "click", "keydown", "wheel", "touchstart", "touchmove"];
  var activated = false;

  function activateDelayedScripts() {
    if (activated) return;
    activated = true;
    INTERACTION_EVENTS.forEach(function (evt) {
      document.removeEventListener(evt, activateDelayedScripts, true);
    });

    var delayed = document.querySelectorAll('script[type="text/plain"][data-delayed-src], script[type="text/plain"][data-delayed]');
    delayed.forEach(function (oldScript) {
      var newScript = document.createElement("script");
      Array.prototype.forEach.call(oldScript.attributes, function (attr) {
        if (attr.name === "type") return;
        if (attr.name === "data-delayed-src") { newScript.src = attr.value; return; }
        if (attr.name === "data-delayed") return;
        newScript.setAttribute(attr.name, attr.value);
      });
      if (!oldScript.hasAttribute("data-delayed-src")) {
        newScript.textContent = oldScript.textContent;
      }
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });

    console.log("[DelayJS-sim] interaction detected — " + delayed.length + " delayed script(s) activated.");
  }

  INTERACTION_EVENTS.forEach(function (evt) {
    document.addEventListener(evt, activateDelayedScripts, true);
  });

  console.log("[DelayJS-sim] active — scripts marked type=\"text/plain\" with data-delayed(-src) will wait for: " + INTERACTION_EVENTS.join(", "));
})();
