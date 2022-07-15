// page loader
const loadingSpinner = ".loading-spinner";

// page info
const topBarNavigation =
  ".notion-topbar .notion-focusable .notranslate:not([role='button'])";
const pageTitle = "[placeholder='Untitled']";

// page content
const textBlock = ".notion-text-block";
const todoBlock = ".notion-to_do-block";
const bulletedListBlock = ".notion-bulleted_list-block";
const numberedListBlock = ".notion-numbered_list-block";
const headerBlocks =
  ".notion-header-block, .notion-sub_header-block, .notion-sub_sub_header-block";
const toggleListBlock = ".notion-toggle-block";
const quoteBlock = ".notion-quote-block";
const quoteBorderStyle = "3px solid currentcolor";
const calloutBlock = ".notion-callout-block";
const calloutTextMargin = "8px";

const autoDirElementsSelectors = `${topBarNavigation}, ${pageTitle}, ${textBlock}, ${todoBlock}, ${bulletedListBlock}, ${numberedListBlock}, ${headerBlocks}, ${toggleListBlock}, ${calloutBlock}`;

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

  document.querySelectorAll(quoteBlock).forEach((block) => {
    block.setAttribute("dir", "ltr");
    const textBlock = <HTMLElement>(
      block.querySelector("[placeholder='Empty quote']")
    );

    if (startsWithAR(textBlock?.innerText)) {
      block.setAttribute("dir", "rtl");
      textBlock.parentElement!.style.borderRight = quoteBorderStyle;
      textBlock.parentElement!.style.borderLeft = "";
    }
  });

  document.querySelectorAll(calloutBlock).forEach((block) => {
    block.setAttribute("dir", "ltr");
    const textBlock = <HTMLElement>(
      block.querySelector("[placeholder='Type something…']")
    );

    if (startsWithAR(textBlock?.innerText)) {
      block.setAttribute("dir", "rtl");
      textBlock.parentElement!.style.marginRight = calloutTextMargin;
      textBlock.parentElement!.style.marginLeft = "";
    }
  });

  // handle content mutations
  const mutationObserver = new MutationObserver((records) => {
    records.forEach((record) => {
      if (record.type === "childList" && record.addedNodes.length) {
        record.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const block = <HTMLElement>node;

          // new 'auto dir' element
          if (
            autoDirElementsSelectors
              .split(",")
              .some((selector) => block.matches(selector))
          ) {
            block.setAttribute("dir", "auto");
          }

          // rtl list/todo suggestion
          let previousSibling = <HTMLElement>record.previousSibling; // todo | bulleted list | numbered list
          if (
            previousSibling &&
            ((block.matches(todoBlock) && previousSibling.matches(todoBlock)) ||
              (block.matches(bulletedListBlock) &&
                previousSibling.matches(bulletedListBlock)) ||
              (block.matches(numberedListBlock) &&
                previousSibling.matches(numberedListBlock)))
          ) {
            const textBlock = (<HTMLElement>(
              previousSibling.querySelector(
                "[placeholder]:not([placeholder='']"
              )
            ))!;

            if (startsWithAR(textBlock.innerText)) block.dir = "rtl";
          }
        });
      } else if (record.type === "characterData") {
        // ar suggestion
        const block = <HTMLElement>(
          (record.target.parentElement?.closest(todoBlock) ??
            record.target.parentElement?.closest(bulletedListBlock) ??
            record.target.parentElement?.closest(numberedListBlock))
        );

        if (
          record.target.textContent?.trim() &&
          !startsWithAR(record.target.textContent) &&
          block?.dir === "rtl"
        )
          block.dir = "auto";

        // quotes
        const targetQuoteBlock =
          record.target.parentElement?.closest(quoteBlock);
        if (targetQuoteBlock) {
          const block = record.target.parentElement!.parentElement!;

          if (
            record.target.textContent &&
            startsWithAR(record.target.textContent)
          ) {
            targetQuoteBlock.setAttribute("dir", "rtl");
            block.style.borderRight = quoteBorderStyle;
            block.style.borderLeft = "";
          } else {
            targetQuoteBlock.setAttribute("dir", "left");
            block.style.borderLeft = quoteBorderStyle;
            block.style.borderRight = "";
          }
        }

        // callouts
        const targetCalloutBlock =
          record.target.parentElement?.closest(calloutBlock);
        if (targetCalloutBlock) {
          const block = record.target.parentElement!.parentElement!;

          if (
            record.target.textContent &&
            startsWithAR(record.target.textContent)
          ) {
            targetCalloutBlock.setAttribute("dir", "rtl");
            block.style.marginRight = calloutTextMargin;
            block.style.marginLeft = "";
          } else {
            targetCalloutBlock.setAttribute("dir", "left");
            block.style.marginLeft = calloutTextMargin;
            block.style.marginRight = "";
          }
        }
      }
    });
  });

  mutationObserver.observe(document.querySelector(".notion-page-content")!, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}

// utility
function startsWithAR(string: string) {
  return /^[\u0621-\u064A]/.test(string);
}
