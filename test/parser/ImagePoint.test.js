import { expect, test } from "vitest";

import ImagePoint from "../../src/parser/ImagePoint";

// Check valid object
test("Image{point} valid, doesn't throw Error", () => {
  expect(() => {new ImagePoint([2, 4])}).not.toThrow();
});