import ImageBounds from './ImageBounds';

class Annotation {
  #line;
  #bounds;

  constructor(line, nw, se) {
    [this.#line, this.#bounds] = [line, new ImageBounds(nw, se)];
  }

  get line() {
    return this.#line;
  }

  get bounds() {
    return this.#bounds;
  }

  set line(value) {
    this.#line = value;
  }

  set bounds(value) {
    this.#bounds = value;
  }
}

export default Annotation;