import { expect, test } from "vitest";

import InferenceResult from "../../src/parser/InferenceResult";

// Check valid object
test("InferenceResult valid, doesn't throw Error", () => {
  expect(() => {new InferenceResult("test")}).not.toThrow();
});