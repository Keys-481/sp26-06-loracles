import { expect, test } from "vitest";

import InferenceResult from "../../src/parser/InferenceResult";
import Annotation from "../../src/parser/Annotation";
import ImageBounds from "../../src/parser/ImageBounds";
import ImagePoint from "../../src/parser/ImagePoint";

test("ImagePoint valid", () => {
  const x = 0;
  const y = 0;
  let ip;

  expect(() => {ip = new ImagePoint([0, 0]);}).not.toThrow();

  expect(ip).toBeInstanceOf(ImagePoint);
  expect(ip.x).equals(x);
  expect(ip.y).equals(y);
  expect(ip.x).toBeTypeOf("number");
  expect(ip.y).toBeTypeOf("number");

  const new_x = 90;
  expect(() => {ip.x = new_x;}).not.toThrow();
  expect(ip).toBeInstanceOf(ImagePoint);
  expect(ip.x).equals(new_x);
  expect(ip.y).equals(y);
  expect(ip.x).toBeTypeOf("number");
  expect(ip.y).toBeTypeOf("number");

  const new_y = 1;
  expect(() => {ip.y = new_y;}).not.toThrow();
  expect(ip).toBeInstanceOf(ImagePoint);
  expect(ip.x).equals(new_x);
  expect(ip.y).equals(new_y);
  expect(ip.x).toBeTypeOf("number");
  expect(ip.y).toBeTypeOf("number");

  expect(ip.toString()).toBeTypeOf("string");
});

test("ImageBounds valid", () => {
  const p1 = [30, 9];
  const p2 = new Uint32Array(2);
  p2[0] = 90;
  p2[1] = 999999999999999;
  let ib;

  expect(() => {ib = new ImageBounds(p1, p2);}).not.toThrow();
  expect(ib).toBeInstanceOf(ImageBounds);
  expect(ib.x1).equals(p1[0]);
  expect(ib.y1).equals(p1[1]);
  expect(ib.x1).toBeTypeOf("number");
  expect(ib.y1).toBeTypeOf("number");

  expect(ib.x2).equals(p2[0]);
  expect(ib.y2).equals(p2[1]);
  expect(ib.x2).toBeTypeOf("number");
  expect(ib.y2).toBeTypeOf("number");

  const new_x1 = 90;
  expect(() => {ib.x1 = new_x1;}).not.toThrow();
  expect(ib).toBeInstanceOf(ImageBounds);
  expect(ib.x1).equals(new_x1);
  expect(ib.y1).equals(p1[1]);
  expect(ib.x1).toBeTypeOf("number");
  expect(ib.y1).toBeTypeOf("number");

  expect(ib.x2).equals(p2[0]);
  expect(ib.y2).equals(p2[1]);
  expect(ib.x2).toBeTypeOf("number");
  expect(ib.y2).toBeTypeOf("number");

  const new_y1 = 0;
  expect(() => {ib.y1 = new_y1;}).not.toThrow();
  expect(ib).toBeInstanceOf(ImageBounds);
  expect(ib.x1).equals(new_x1);
  expect(ib.y1).equals(new_y1);
  expect(ib.x1).toBeTypeOf("number");
  expect(ib.y1).toBeTypeOf("number");

  expect(ib.x2).equals(p2[0]);
  expect(ib.y2).equals(p2[1]);
  expect(ib.x2).toBeTypeOf("number");
  expect(ib.y2).toBeTypeOf("number");

  const new_x2 = -1;
  const new_x2_val = 2 ** (8 * Uint32Array.BYTES_PER_ELEMENT) - 1;
  expect(() => {ib.x2 = new_x2;}).not.toThrow();
  expect(ib).toBeInstanceOf(ImageBounds);
  expect(ib.x1).equals(new_x1);
  expect(ib.y1).equals(new_y1);
  expect(ib.x1).toBeTypeOf("number");
  expect(ib.y1).toBeTypeOf("number");

  expect(ib.x2).equals(new_x2_val);
  expect(ib.y2).equals(p2[1]);
  expect(ib.x2).toBeTypeOf("number");
  expect(ib.y2).toBeTypeOf("number");

  const new_y2 = 10;
  expect(() => {ib.y2 = new_y2;}).not.toThrow();
  expect(ib).toBeInstanceOf(ImageBounds);
  expect(ib.x1).equals(new_x1);
  expect(ib.y1).equals(new_y1);
  expect(ib.x1).toBeTypeOf("number");
  expect(ib.y1).toBeTypeOf("number");

  expect(ib.x2).equals(new_x2_val);
  expect(ib.y2).equals(new_y2);
  expect(ib.x2).toBeTypeOf("number");
  expect(ib.y2).toBeTypeOf("number");

  expect(ib.toString()).toBeTypeOf("string");
});

// Check valid object
test("Annotation valid", () => {
  const l = "This is a line of text";
  const p1 = [0, 1];
  const p2 = [500, 20];
  let a;

  expect(() => {a = new Annotation(l, p1, p2);}).not.toThrow();

  expect(a).toBeInstanceOf(Annotation);
  expect(a.line).equals(l);
  expect(a.bounds).toBeInstanceOf(ImageBounds);
  expect(a.bounds.x1).equals(p1[0]);
  expect(a.bounds.x2).equals(p2[0]);
  expect(a.bounds.y1).equals(p1[1]);
  expect(a.bounds.y2).equals(p2[1]);

  const new_l = "new stringgg";
  expect(() => {a.line = new_l;}).not.toThrow();
  expect(a).toBeInstanceOf(Annotation);
  expect(a.line).equals(new_l);
  expect(a.line).toBeTypeOf("string");
  expect(a.bounds).toBeInstanceOf(ImageBounds);
  expect(a.bounds.x1).equals(p1[0]);
  expect(a.bounds.x2).equals(p2[0]);
  expect(a.bounds.y1).equals(p1[1]);
  expect(a.bounds.y2).equals(p2[1]);

  const new_p1 = [90, 2];
  const new_p2 = [92, 900];
  const new_bounds = new ImageBounds(new_p1, new_p2);
  expect(() => {a.bounds = new_bounds;}).not.toThrow();
  expect(a).toBeInstanceOf(Annotation);
  expect(a.line).equals(new_l);
  expect(a.bounds).toBeInstanceOf(ImageBounds);
  expect(a.bounds.x1).equals(new_p1[0]);
  expect(a.bounds.x2).equals(new_p2[0]);
  expect(a.bounds.y1).equals(new_p1[1]);
  expect(a.bounds.y2).equals(new_p2[1]);

  expect(a.toString()).toBeTypeOf("string");
});

// Check valid object
test("InferenceResult valid", () => {
  const l = "This is a line of text";
  const p1 = [0, 1];
  const p2 = [500, 20];
  let ir;

  expect(() => {ir = new InferenceResult("./files/exfile.json");}).not.toThrow();

  expect(ir).toBeInstanceOf(InferenceResult);
});