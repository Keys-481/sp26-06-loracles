import { expect, test } from "vitest";

import ImageBounds from "../../src/parser/ImageBounds";

// Check valid object
test("ImageBounds valid, doesn't throw Error", () => {
  expect(() => {new ImageBounds([0, 0], [2, 4])}).not.toThrow();
});