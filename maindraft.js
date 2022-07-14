"use strict";
if (record.type === "characterData") {
    const block = (record.target.parentElement?.closest(todoBlock));
    if (record.target.textContent?.trim() && block.dir === "rtl")
        block.dir = "auto";
}
if (record.previousSibling &&
    block.matches(todoBlock) &&
    record.previousSibling.matches(todoBlock)) {
    const textBlock = (record.previousSibling.querySelector(todoBlockText));
    if (startsWithAR(textBlock.innerText)) {
        block.dir = "rtl";
        console.log("Starts with ar");
    }
}
