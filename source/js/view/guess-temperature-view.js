import AbstractView from './abstract-view.js';

const getGuessTemperatureTemplate = (cityInfo) => (
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
    <form class="guess__input">
      <input class="guess__search-bar" type="text" placeholder="Enter your answer"><span class="guess__search-bar-celsium">°C</span>
    </form>
  </div>`
);

export default class GuessTemperatureView extends AbstractView {
  #cb = null;
  #results = {
    isResults: false
  };
  constructor(cityInfo, weatherInfo, cb) {
    super();
    this.cityInfo = cityInfo;
    this.weatherInfo = weatherInfo;
    this.#cb = cb;

    this.element.style.setProperty('--bg-url', `url('https://openweathermap.org/img/wn/${this.weatherInfo.weather[0].icon}@2x.png')`);
  }

  get template() {
    return getGuessTemperatureTemplate(this.cityInfo, this.#results);
  }

  updateLocalTime(localDate) {
    this.element.querySelector('.guess__date').textContent = `Date: ${localDate.date}`;
    this.element.querySelector('.guess__time').textContent = `Current time: ${localDate.time}`;
  }

  setSubmitHandler() {
    this.element.querySelector('.guess__input').addEventListener('submit', (evt) => {
      evt.preventDefault();
      this.#cb(this.element.querySelector('.guess__search-bar').value);
      this.element.querySelector('.guess__search-bar').value = '';
    });
  }
}
