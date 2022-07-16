// page loader
const loadingSpinner = ".loading-spinner";

// page info
const topBarNavigation =
  ".notion-topbar .notion-focusable .notranslate:not([role='button'])";
const pageTitle = "[placeholder='Untitled']";
const pageBackground = ".whenContentEditable > .pseudoSelection:first-of-type";
const pageIconAndControlsContainer =
  ".pseudoSelection:not(.whenContentEditable > *)";

// page content
const textBlock = ".notion-text-block";
const todoBlock = ".notion-to_do-block";
const bulletedListBlock = ".notion-bulleted_list-block";
const numberedListBlock = ".notion-numbered_list-block";
const headerBlocks =
  ".notion-header-block, .notion-sub_header-block, .notion-sub_sub_header-block";
const toggleListBlock = ".notion-toggle-block";
const quoteBlock = ".notion-quote-block";
const calloutBlock = ".notion-callout-block";
const tableOfContentsBlock = ".notion-table_of_contents-block";
const imageBlock = ".notion-image-block";
const videoBlock = ".notion-video-block";
const audioBlock = ".notion-audio-block";
const fileBlock = ".notion-file-block";
const embedBlock = ".notion-embed-block";
const bookmarkBlock = ".notion-bookmark-block";
const captionBlockSelector = "[placeholder^='Write a caption']";

const autoDirElementsSelectors = `${topBarNavigation}, ${pageTitle}, ${textBlock}, ${todoBlock}, ${bulletedListBlock}, ${numberedListBlock}, ${headerBlocks}, ${toggleListBlock}, ${quoteBlock}, ${calloutBlock}, ${tableOfContentsBlock}, ${imageBlock} ${captionBlockSelector}, ${videoBlock} ${captionBlockSelector}, ${audioBlock} ${captionBlockSelector}, ${fileBlock} ${captionBlockSelector}, ${embedBlock} ${captionBlockSelector}, ${bookmarkBlock} ${captionBlockSelector}`;

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
  document.querySelectorAll(autoDirElementsSelectors).forEach((ele) => {
    ele.setAttribute("dir", "auto");

    // table of contents
    if (ele.matches(tableOfContentsBlock)) {
      const blocks = <NodeListOf<HTMLElement>>(
        ele.querySelectorAll("a [role='button'] > div")
      );

      blocks.forEach((block) => {
        block.style.marginInlineStart = block.style.marginLeft;
        block.style.marginLeft = "";
      });
    }
  });

  // handle content mutations
  const mutationObserver = new MutationObserver((records) => {
    records.forEach((record) => {
      if ((record.target as HTMLElement).tagName === "TITLE") {
        const text = record.addedNodes[0].textContent ?? "";
        const pageBackgroundBlock = document.querySelector(pageBackground);
        const pageIconBlock = document.querySelector(
          pageIconAndControlsContainer
        );

        if (startsWithAR(text)) {
          pageBackgroundBlock?.classList.add("rtl");
          pageIconBlock?.classList.add("rtl");
        } else {
          pageBackgroundBlock?.classList.remove("rtl");
          pageIconBlock?.classList.remove("rtl");
        }
      }

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

          // captions
          if (
            block.matches(
              `${imageBlock}, ${videoBlock}, ${audioBlock}, ${fileBlock}, ${embedBlock}, ${bookmarkBlock}`
            )
          ) {
            const captionBlock = block.querySelector(captionBlockSelector);

            if (captionBlock) (<HTMLElement>captionBlock).dir = "auto";
          }

          // rtl list/todo suggestion
          const previousSibling = <HTMLElement>record.previousSibling; // todo | bulleted list | numbered list
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

          // table of contents
          if (block.matches(`${tableOfContentsBlock} div div`)) {
            const rowBlock = <HTMLElement>(
              block.querySelector("a [role='button'] > div")
            );

            rowBlock.style.marginInlineStart = rowBlock.style.marginLeft;
            rowBlock.style.marginLeft = "";
          }
        });
      } else if (record.type === "characterData") {
        // reset direction to auto (remove rtl suggestion)
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
      }
    });
  });

  mutationObserver.observe(document.querySelector(".notion-page-content")!, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  mutationObserver.observe(document.querySelector("title")!, {
    childList: true,
  });
}

// utility
function startsWithAR(string: string) {
  return /^[\u0621-\u064A]/.test(string);
}
