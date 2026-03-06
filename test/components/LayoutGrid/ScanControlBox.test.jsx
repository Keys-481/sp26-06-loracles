import { expect, test } from "vitest";
import { render } from "@testing-library/react";

import ScanControlBox from "../../../src/components/LayoutGrid/ScanControlBox";

// Check valid object
test("ScanControlBox valid, doesn't throw Error", () => {
  expect(() => render(<ScanControlBox />)).not.toThrow();
});