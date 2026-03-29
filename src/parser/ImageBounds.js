import ImagePoint from './ImagePoint';

class ImageBounds {

  #northWest; /** Top left corner */
  #southEast; /** bottom right corner */

  constructor(nw, se) {
    this.#northWest = new ImagePoint(nw);
    this.#southEast = new ImagePoint(se);
  }

  get x1() {
    return this.#northWest.x;
  }

  get y1() {
    return this.#northWest.y;
  }

  get x2() {
    return this.#southEast.x;
  }

  get y2() {
    return this.#southEast.y;
  }

  set x1(value) {
    this.#northWest.x = value;
  }

  set y1(value) {
    this.#northWest.y = value;
  }

  set x2(value) {
    this.#southEast.x = value;
  }

  set y2(value) {
    this.#southEast.y = value;
  }
}

export default ImageBounds;