/* =========================
   FIND TEXT NODE
========================= */
function findTextNode(text) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
  
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.includes(text)) {
        return node;
      }
    }
    return null;
  }
  
  /* =========================
     SAVE HIGHLIGHT
  ========================= */
  document.addEventListener("mouseup", () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
  
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
  
    const span = document.createElement("span");
    span.className = "wa-highlight yellow";
  
    try {
      range.surroundContents(span);
    } catch {
      return;
    }
  
    chrome.storage.local.get(["annotations"], (res) => {
      const annotations = res.annotations || [];
      annotations.push({
        url: location.href,
        text: span.innerText,
        color: "yellow",
        note: ""
      });
      chrome.storage.local.set({ annotations });
    });
  
    sel.removeAllRanges();
  });
  
  /* =========================
     APPLY HIGHLIGHT
  ========================= */
  function applyHighlight(a) {
    const node = findTextNode(a.text);
    if (!node) return false;
  
    const start = node.nodeValue.indexOf(a.text);
    if (start === -1) return false;
  
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, start + a.text.length);
  
    const span = document.createElement("span");
    span.className = `wa-highlight ${a.color}`;
    span.dataset.note = a.note || "";
  
    try {
      range.surroundContents(span);
      return true;
    } catch {
      return false;
    }
  }
  
  /* =========================
     RESTORE USING OBSERVER
  ========================= */
  function restoreAnnotations() {
    chrome.storage.local.get(["annotations"], (res) => {
      const annotations = (res.annotations || []).filter(
        a => a.url === location.href
      );
  
      const pending = new Set(annotations);
  
      const tryApply = () => {
        pending.forEach(a => {
          if (applyHighlight(a)) pending.delete(a);
        });
        if (pending.size === 0) observer.disconnect();
      };
  
      const observer = new MutationObserver(tryApply);
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
  
      // initial attempt
      tryApply();
    });
  }
  
  window.addEventListener("load", restoreAnnotations);
  
  /* =========================
     NOTES
  ========================= */
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("wa-highlight")) return;
  
    const old = e.target.dataset.note || "";
    const note = prompt("Add note", old);
    if (note === null) return;
  
    e.target.dataset.note = note;
  
    chrome.storage.local.get(["annotations"], (res) => {
      const annotations = (res.annotations || []).map(a =>
        a.text === e.target.innerText ? { ...a, note } : a
      );
      chrome.storage.local.set({ annotations });
    });
  });
  
  

        
  
  