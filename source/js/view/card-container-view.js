import AbstractView from './abstract-view.js';
import { ContainerMode } from '../const.js';

const SLIDE_ANIMATION_TIME = 1000;

const getWeatherWindowTemplate = () => (
  `<section class="card visually-hidden">
  </section>`
);

export default class CardContainerView extends AbstractView {

  get template() {
    return getWeatherWindowTemplate(this.data);
  }

  slideLeft(callback) {
    this.element.classList.add('slide-left');
    setTimeout(() => {
      this.element.classList.remove('slide-left');
      this.manageVisibility(false);
      callback?.();
    }, SLIDE_ANIMATION_TIME);
  }

  slideRightToTheLeft(callback) {
    this.element.classList.add('slide-right-to-left');
    this.manageVisibility(true);
    setTimeout(() => {
      this.element.classList.remove('slide-right-to-left');
      callback?.();
    }, SLIDE_ANIMATION_TIME);
  }

  switchMode(mode) {
    switch (mode) {
      case ContainerMode.NORMAL:
        this.element.classList.remove('card--scoreboard');
        break;
      case ContainerMode.SCOREBOARD:
        this.element.classList.add('card--scoreboard');
        break;
    }
  }

  manageVisibility(isVisible = true) {
    if (isVisible) {
      this.element.classList.remove('visually-hidden');
    } else {
      this.element.classList.add('visually-hidden');
    }
  }
}
