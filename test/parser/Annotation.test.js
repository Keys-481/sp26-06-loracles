import { expect, test } from "vitest";

import Annotation from "../../src/parser/Annotation";

// Check valid object
test("Annotation valid, doesn't throw Error", () => {
  expect(() => {new Annotation("test", [0, 0], [2, 4])}).not.toThrow();
});