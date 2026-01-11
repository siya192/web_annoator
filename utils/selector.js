export function findTextNode(text) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
  
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.includes(text)) {
        return node;
      }
    }
    return null;
  }
  