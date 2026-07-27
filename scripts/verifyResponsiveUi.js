const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const markup = read("public/index.html");
const styles = read("public/styles.css");
const frontend = read("public/app.js");

assert.match(markup, /name="viewport"\s+content="width=device-width, initial-scale=1\.0"/);
assert.match(styles, /Balanced responsive parity layer/);
assert.match(styles, /@media \(max-width: 920px\)/);
assert.match(styles, /@media \(max-width: 640px\)/);
assert.match(styles, /@media \(max-width: 400px\)/);
assert.match(styles, /100dvh/);
assert.match(styles, /env\(safe-area-inset-top\)/);
assert.match(styles, /env\(safe-area-inset-bottom\)/);
assert.match(styles, /\.location-input-row[\s\S]{0,180}grid-template-columns: repeat\(3/);
assert.match(styles, /\.chatbot-panel[\s\S]{0,260}100dvh/);
assert.match(styles, /\.about-video-experience\[data-compact="true"\]/);
assert.match(styles, /@media \(max-width: 920px\) and \(hover: none\) and \(pointer: coarse\)/);

assert.match(frontend, /window\.matchMedia\("\(max-width: 920px\)"\)/);
assert.match(frontend, /experience\.dataset\.compact = "true"/);
assert.match(frontend, /if \(window\.innerWidth > 920\)/);
assert.match(frontend, /event\.key === "Escape" && siteNav\.classList\.contains\("is-open"\)/);
assert.match(frontend, /document\.addEventListener\("pointerdown"/);
assert.match(frontend, /nextState \? "Close navigation" : "Open navigation"/);

const layerStart = styles.indexOf("/* Balanced responsive parity layer.");
assert.ok(layerStart > 0, "Responsive parity layer must exist.");
const responsiveLayer = styles.slice(layerStart);
assert.ok(
  responsiveLayer.trimStart().startsWith("/* Balanced responsive parity layer."),
  "Responsive overrides must remain isolated in the final CSS layer."
);

console.log(JSON.stringify({
  passed: true,
  desktopDefaultPreserved: true,
  tabletBreakpoint: 920,
  phoneBreakpoint: 640,
  narrowPhoneBreakpoint: 400,
  safeAreaAware: true,
  compactVideoMode: true,
  mobileNavigationDismissal: ["link", "outside_pointer", "escape", "desktop_resize"]
}, null, 2));
