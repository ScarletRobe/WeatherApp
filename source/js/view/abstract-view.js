export default class AbstractView {
  #element = null;

  get template() {
    throw new Error('Abstract method not implemented: get template');
  }

  get element() {
    if (!this.#element) {
      this.#element = this.#createElement(this.template);
    }

    return this.#element;
  }

  #createElement(template) {
    const newElement = document.createElement('div');
    newElement.innerHTML = template;

    return newElement.firstElementChild;
  }

  removeElement() {
    this.#element = null;
  }
}
