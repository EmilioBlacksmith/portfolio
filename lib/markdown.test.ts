import { test } from "node:test";
import assert from "node:assert/strict";
import { convertWikiLinks, readingTime, resolveAsset } from "./markdown.ts";

test("resolveAsset passes through external and absolute URLs", () => {
  assert.equal(
    resolveAsset("https://cdn.example.com/a.png"),
    "https://cdn.example.com/a.png"
  );
  assert.equal(resolveAsset("//cdn.example.com/a.png"), "//cdn.example.com/a.png");
  assert.equal(resolveAsset("/blog/a.png"), "/blog/a.png");
  assert.equal(resolveAsset("a.png"), "/blog/a.png");
});

test("convertWikiLinks expands image embeds with and without alt text", () => {
  assert.equal(convertWikiLinks("![[a.png]]"), "![a.png](/blog/a.png)");
  assert.equal(convertWikiLinks("![[a.png|Alt]]"), "![Alt](/blog/a.png)");
  assert.equal(
    convertWikiLinks("![[https://cdn.example.com/a.png|X]]"),
    "![X](https://cdn.example.com/a.png)"
  );
});

test("convertWikiLinks leaves non-image wikilinks untouched", () => {
  assert.equal(convertWikiLinks("[[doc.pdf]]"), "[[doc.pdf]]");
  assert.equal(convertWikiLinks("[[doc.pdf|label]]"), "[[doc.pdf|label]]");
});

test("convertWikiLinks turns image wikilinks into markdown links", () => {
  assert.equal(convertWikiLinks("[[photo.jpg|nice]]"), "[nice](/blog/photo.jpg)");
});

test("readingTime is at least one minute and scales with length", () => {
  assert.equal(readingTime(""), 1);
  assert.equal(readingTime("one"), 1);
  assert.equal(
    readingTime(Array.from({ length: 400 }, () => "word").join(" ")),
    2
  );
});
