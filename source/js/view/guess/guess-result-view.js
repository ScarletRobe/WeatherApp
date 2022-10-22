import AbstractView from '../abstract-view.js';

const getGuessTemperatureTemplate = (cityInfo, results) => (
  `<div class="guess">
    <div class="guess__known-info">
      <div class="guess__about">
        <h1 class="guess__country">${cityInfo.countryName},</h1>
        <br>
        <h1 class="guess__city">${cityInfo.name}</h1>
      </div>
      <div class="guess__other-info">
        <div class="guess__date">Date:</div>
        <div class="guess__time">Current time:</div>
      </div>
    </div>
    <div class="guess__result">
      <div class="real">True answer: ${results.real}°C</div>
      <div class="user">Your answer: ${results.user}°C</div>
      <div class="diff">Difference: <span style="color:${Math.abs(results.diff) <= 5 ? 'green' : Math.abs(results.diff) <= 10 ? 'orange' : 'red'}">${results.diff >= 0 ? `+${results.diff}` : String(results.diff)}</span>°C</div>
    </div>
    <div class="card__next-btn visually-hidden">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" width="80px" height="80px"><defs><clipPath><path fill="#000" fill-opacity=".514" d="m-7 1024.36h34v34h-34z"/></clipPath><clipPath><path fill="#aade87" fill-opacity=".472" d="m-6 1028.36h32v32h-32z"/></clipPath></defs><path d="m345.44 248.29l-194.29 194.28c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744l171.91-171.91-171.91-171.9c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.29 194.28c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373" transform="matrix(.03541-.00013.00013.03541 2.98 3.02)" fill="rgba(255, 255, 255, 0.5)"/></svg>
    </div>
  </div>`
);

export default class GuessResultView extends AbstractView {
  #nextBtnCb = null;

  constructor(cityInfo, weatherInfo, results) {
    super();
    this.cityInfo = cityInfo;
    this.weatherInfo = weatherInfo;
    this.results = results;

    this.element.style.setProperty('--bg-url', `url('https://openweathermap.org/img/wn/${this.weatherInfo.weather[0].icon}@2x.png')`);
  }

  get template() {
    return getGuessTemperatureTemplate(this.cityInfo, this.results);
  }

  manageBtnVisibility(isVisible) {
    if (isVisible) {
      this.element.querySelector('.card__next-btn').classList.remove('visually-hidden');
      return;
    }
    this.element.querySelector('.card__next-btn').classList.add('visually-hidden');
  }

  updateLocalTime(localDate) {
    this.element.querySelector('.guess__date').textContent = `Date: ${localDate.date}`;
    this.element.querySelector('.guess__time').textContent = `Current time: ${localDate.time}`;
  }

  setNextBtnClickHandler(cb) {
    this.element.querySelector('.card__next-btn').addEventListener('click', (evt) => {
      evt.preventDefault();
      cb();
    });
  }

  removeDocumentKeydownHandler() {
    document.removeEventListener('keydown', this.documentKeydownHandler);
  }

  setDocumentKeydownHandler(cb) {
    this.#nextBtnCb = cb;
    document.addEventListener('keydown', this.documentKeydownHandler);
  }

  documentKeydownHandler = (evt) => {
    evt.preventDefault();
    if (evt.key === 'Enter') {
      evt.preventDefault();
      this.#nextBtnCb();
    }
  };
}
