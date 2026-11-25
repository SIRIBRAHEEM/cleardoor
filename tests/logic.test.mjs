import { test } from "node:test";
import assert from "node:assert/strict";
import {
  countSyllables,
  splitSentences,
  textStats,
  simplifyText,
  gradeLabel,
} from "../src/lib/text.js";
import { SAMPLE_TEXT } from "../src/lib/sample.js";

test("countSyllables counts simple words", () => {
  assert.equal(countSyllables("cat"), 1);
  assert.equal(countSyllables("water"), 2);
  assert.equal(countSyllables("photosynthesis"), 5);
  assert.equal(countSyllables(""), 0);
});

test("splitSentences splits on full stops and question marks", () => {
  const out = splitSentences("Plants need light. Do they need water? Yes.");
  assert.equal(out.length, 3);
  assert.equal(out[0], "Plants need light.");
});

test("splitSentences handles empty input", () => {
  assert.deepEqual(splitSentences(""), []);
  assert.deepEqual(splitSentences("   "), []);
});

test("textStats measures a simple text as easy", () => {
  const s = textStats("The cat sat on the mat. The dog ran fast.");
  assert.ok(s.grade < 5, `expected low grade, got ${s.grade}`);
  assert.equal(s.words, 10);
  assert.equal(s.sentences, 2);
});

test("textStats measures academic text as harder than simple text", () => {
  const hard = textStats(SAMPLE_TEXT);
  const easy = textStats("Plants make food. They use light and water.");
  assert.ok(hard.grade > easy.grade);
  assert.ok(hard.hardWords > easy.hardWords);
});

test("simplifyText swaps formal words for plain words", () => {
  const out = simplifyText("Plants utilise sunlight to produce glucose.");
  assert.ok(out.text.includes("use"), out.text);
  assert.ok(!out.text.toLowerCase().includes("utilise"), out.text);
  assert.ok(out.changes.length >= 1);
});

test("simplifyText keeps capital letters at sentence starts", () => {
  const out = simplifyText("Therefore the plant grows.");
  assert.ok(out.text.startsWith("So"), out.text);
});

test("simplifyText splits very long sentences", () => {
  const long =
    "The plant takes in water through its roots and moves the water up through the stem into the leaves where the water is used together with sunlight and carbon dioxide to make sugar for the whole plant to grow strong and healthy every single day of the year.";
  const out = simplifyText(long);
  assert.ok(out.after.sentences > 1, out.text);
  assert.ok(out.after.avgSentence < out.before.avgSentence);
});

test("simplifyText lowers the reading grade of the sample lesson", () => {
  const out = simplifyText(SAMPLE_TEXT);
  assert.ok(
    out.after.grade < out.before.grade,
    `before ${out.before.grade}, after ${out.after.grade}`,
  );
  assert.ok(out.after.hardWords <= out.before.hardWords);
});

test("simplifyText handles empty input without crashing", () => {
  const out = simplifyText("");
  assert.equal(out.text, "");
  assert.equal(out.before.words, 0);
});

test("gradeLabel maps grades to plain labels", () => {
  assert.equal(gradeLabel(3), "Very easy");
  assert.equal(gradeLabel(8), "Fairly easy");
  assert.equal(gradeLabel(15), "Very hard");
});
