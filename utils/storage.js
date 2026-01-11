export function saveAnnotation(obj) {
    chrome.storage.local.get(["annotations"], (res) => {
      const annotations = res.annotations || [];
      annotations.push(obj);
      chrome.storage.local.set({ annotations });
    });
  }
  