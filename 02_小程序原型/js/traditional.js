(function (root) {
  "use strict";

  const convert = root.OpenCC.Converter({ from: "cn", to: "tw" });
  root.EscortTraditional = convert;
  const labels = ["alt", "title", "placeholder", "aria-label", "aria-valuetext"];

  // Convert the displayed text only. Paths, form values, bridge IDs and stored records keep their original keys.
  function translate(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!/\p{Script=Han}/u.test(node.data) || node.parentElement?.closest("script, style, textarea")) return;
      const value = convert(node.data);
      if (node.data !== value) node.data = value;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE || node.matches("script, style, svg")) return;
    for (const label of labels) translateLabel(node, label);
    if (!node.matches("textarea")) node.childNodes.forEach(translate);
  }

  function translateLabel(element, name) {
    const value = element.getAttribute(name);
    if (!value) return;
    const translated = convert(value);
    if (translated !== value) element.setAttribute(name, translated);
  }

  translate(document.body);
  new MutationObserver(records => {
    for (const change of records) {
      if (change.type === "attributes") translateLabel(change.target, change.attributeName);
      else if (change.type === "characterData") translate(change.target);
      else change.addedNodes.forEach(translate);
    }
  }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: labels });
})(window);
