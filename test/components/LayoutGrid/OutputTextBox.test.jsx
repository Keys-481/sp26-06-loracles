import { expect, test } from "vitest";
import { render } from "@testing-library/react";

import OutputTextBox from "../../../src/components/LayoutGrid/OutputTextBox";


// Check labelText inputs
test("OutputTextBox undefined labelText throws TypeError", () => {
  expect(() => render(<OutputTextBox />)).toThrow(TypeError);
});
test("OutputTextBox numeric labelText throws TypeError", () => {
  expect(() => render(<OutputTextBox labelText={3} />)).toThrow(TypeError);
});
test("OutputTextBox empty labelText throws Error", () => {
  expect(() => render(<OutputTextBox labelText="" />)).toThrow(Error);
});
test("OutputTextBox whitespace labelText throws Error", () => {
  expect(() => render(<OutputTextBox labelText="    " />)).toThrow(Error);
});
test("OutputTextBox String labelText doesn't throw TypeError", () => {
  expect(() => render(<OutputTextBox labelText="This is an example label" />)).not.toThrow(TypeError);
});

// Check placeholder inputs
test("OutputTextBox numeric placeholder throws TypeError", () => {
  expect(() => render(<OutputTextBox labelText="This is an example label" placeholder={3} />)).toThrow(TypeError);
});
test("OutputTextBox valid placeholder doesn't throw TypeError", () => {
  expect(() => render(<OutputTextBox labelText="This is an example label" placeholder="this is a placeholder" />)).not.toThrow(TypeError);
});

// Check valid object
test("OutputTextBox valid labelText and empty placeholder doesn't throw Error", () => {
  expect(() => render(<OutputTextBox labelText="This is an example label" />)).not.toThrow();
});
test("OutputTextBox valid labelText and placeholder doesn't throw Error", () => {
  expect(() => render(<OutputTextBox labelText="This is an example label" placeholder="this is a placeholder" />)).not.toThrow();
});