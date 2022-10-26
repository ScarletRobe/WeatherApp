import AbstractView from '../abstract-view.js';

const VANISH_ANIMATION_TIME = 150;

const getGuessTemperatureTemplate = (cityInfo, questionNum, questionsAmount) => (
  `<div class="guess">
   <h2 class="guess__question-number">${questionNum} / ${questionsAmount}</h2>
    <div class="guess__known-info">
      <div class="guess__about">
        <h1 class="guess__country">${cityInfo.countryName},</h1>
        <br>
        <h1 class="guess__city">${cityInfo.name}</h1>
      </div>
      <div class="guess__other-info">
        <div class="guess__date"></div>
        <div class="guess__time"></div>
      </div>
    </div>
    <form class="guess__input">
      <input class="guess__search-bar" type="text" placeholder="Enter your answer"><span class="guess__search-bar-celsium">°C</span>
    </form>
  </div>`
);

export default class GuessTemperatureView extends AbstractView {
  #results = {
    isResults: false
  };

  constructor(cityInfo, weatherInfo, questionNum, questionsAmount) {
    super();
    this.cityInfo = cityInfo;
    this.weatherInfo = weatherInfo;
    this.questionNum = questionNum;
    this.questionsAmount = questionsAmount;

    this.element.style.setProperty('--bg-url', `url('https://openweathermap.org/img/wn/${this.weatherInfo.weather[0].icon}@2x.png')`);
  }

  get element() {
    const element = super.element;
    if (this.questionNum > 1) {
      element.querySelector('.guess__search-bar').focus();
    }
    return element;
  }

  get template() {
    return getGuessTemperatureTemplate(this.cityInfo, this.questionNum, this.questionsAmount);
  }

  updateLocalTime(localDate) {
    this.element.querySelector('.guess__date').textContent = `Date: ${localDate.date}`;
    this.element.querySelector('.guess__time').textContent = `Current time: ${localDate.time}`;
  }

  vanish(callback) {
    this.element.classList.add('vanish');
    setTimeout(() => {
      this.element.classList.remove('vanish');
      callback();
    }, VANISH_ANIMATION_TIME);
  }

  setSubmitHandler(cb) {
    this.element.querySelector('.guess__input').addEventListener('submit', (evt) => {
      evt.preventDefault();
      cb(this.element.querySelector('.guess__search-bar').value);
      this.element.querySelector('.guess__search-bar').value = '';
    });
  }
}
