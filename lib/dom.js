/**
 * @type {(html: string) => Document}
 * Convert any HTML string to new Document
 */
export function formatNextDocument(html) {
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

/**
 * @type {(nextDoc: Document) => void}
 * Replace Body
 */
export function replaceBody(nextDoc) {
  const nodesToPreserve = document.body.querySelectorAll('[flamethrower-preserve]');
  nodesToPreserve.forEach((oldDocElement) => {
    let nextDocElement = nextDoc.body.querySelector('[flamethrower-preserve][id="' + oldDocElement.id + '"]');
    if (nextDocElement) {
      const clone = oldDocElement.cloneNode(true);
      nextDocElement.replaceWith(clone);
    }
  });

  document.body.replaceWith(nextDoc.body);
}

/**
 * @type {(nextDoc: Document) => void}
 * Merge new head data
 */
export function mergeHead(nextDoc) {
  // Update head
  // Head elements that changed on next document
  /** @type {(doc: Document) => Element[]} */
  const getValidNodes = (doc) => Array.from(doc.querySelectorAll('head>:not([rel="prefetch"]'));
  const oldNodes = getValidNodes(document);
  const nextNodes = getValidNodes(nextDoc);
  const { staleNodes, freshNodes } = partitionNodes(oldNodes, nextNodes);

  staleNodes.forEach((node) => node.remove());

  document.head.append(...freshNodes);
}

/** @type {(oldNodes: Element[], nextNodes: Element[]) => PartitionedNodes} */
function partitionNodes(oldNodes, nextNodes) {
  /** @type {Element[]} */
  const staleNodes = [];
  /** @type {Element[]} */
  const freshNodes = [];

  let oldMark = 0;
  let nextMark = 0;
  while (oldMark < oldNodes.length || nextMark < nextNodes.length) {
    const old = oldNodes[oldMark];
    const next = nextNodes[nextMark];
    if (old?.isEqualNode(next)) {
      oldMark++;
      nextMark++;
      continue;
    }
    const oldInFresh = old ? freshNodes.findIndex((node) => node.isEqualNode(old)) : -1;
    if (oldInFresh !== -1) {
      freshNodes.splice(oldInFresh, 1);
      oldMark++;
      continue;
    }
    const nextInStale = next ? staleNodes.findIndex((node) => node.isEqualNode(next)) : -1;
    if (nextInStale !== -1) {
      staleNodes.splice(nextInStale, 1);
      nextMark++;
      continue;
    }
    old && staleNodes.push(old);
    next && freshNodes.push(next);
    oldMark++;
    nextMark++;
  }

  return { staleNodes, freshNodes };
}

/** @typedef {{ freshNodes: Element[]; staleNodes: Element[]; }} PartitionedNodes */

/**
 * Runs JS in the fetched document
 * head scripts will only run with data-reload attr
 * all body scripts will run
 *
 * @type {() => void}
 */
export function runScripts() {
  // Run scripts with data-reload attr
  const headScripts = document.head.querySelectorAll('[data-reload]');
  headScripts.forEach(replaceAndRunScript);

  // Run scripts in body
  const bodyScripts = document.body.querySelectorAll('script');
  bodyScripts.forEach(replaceAndRunScript);
}

/** Private helper to re-execute scripts
 * @type {(oldScript: HTMLScriptElement) => void}
 */
function replaceAndRunScript(oldScript) {
  const newScript = document.createElement('script');
  const attrs = Array.from(oldScript.attributes);
  for (const { name, value } of attrs) {
    newScript[name] = value;
  }
  newScript.append(oldScript.textContent);
  oldScript.replaceWith(newScript);
}
