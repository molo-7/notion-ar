/* Selectors */
// page loader
const loadingSpinner = ".loading-spinner";

// page info
const topBarNavigation =
  ".notion-topbar .notion-focusable .notranslate:not([role='button'])";
const pageTitle = "[placeholder='Untitled']";

// page content
const textBlock = ".notion-text-block";

const autoDirElementsSelectors = `${topBarNavigation}, ${pageTitle}, ${textBlock}`;

/* Activate App */
let { pathname } = window.location;
window.addEventListener("load", active);
setInterval(() => {
  const newPathname = window.location.pathname;
  if (newPathname !== pathname) {
    pathname = newPathname;
    active();
  }
}, 1000);

function active() {
  const interval = setInterval(() => {
    // when page content is loaded
    if (!document.querySelector(loadingSpinner)) {
      clearInterval(interval);
      main();
    }
  }, 1000);
}

/* Main */
function main() {
  document
    .querySelectorAll(autoDirElementsSelectors)
    .forEach((ele) => ele.setAttribute("dir", "auto"));

  // handle newly created blocks
  const mutationObserver = new MutationObserver((records) => {
    records.forEach((record) => {
      if (record.addedNodes) {
        record.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const block = node as Element;

          // auto dir check
          if (
            autoDirElementsSelectors
              .split(",")
              .some((selector) => block.matches(selector))
          ) {
            block.setAttribute("dir", "auto");
          }
        });
      }
    });
  });

  mutationObserver.observe(document.querySelector(".notion-page-content")!, {
    childList: true,
    subtree: true,
  });
}
