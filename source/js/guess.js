import Geonames from './fetch-geonames.js';
import Weather from './fetch-weather.js';

import GuessTemperatureView from './view/guess-temperature-view.js';

import { calculateLocalTime } from './utils.js';
import { GuessMode } from './const.js';

const geonames = new Geonames();
const weather = new Weather();

const container = document.querySelector('.card');

let guessTemperatureComponent = null;

let timeUpdateIntervalId;
let weatherInfo;
let cityInfo;
let currentMode = GuessMode.QUESTION;

const renderGuessComponent = () => {
  if (timeUpdateIntervalId) {
    clearInterval(timeUpdateIntervalId);
  }

  if (guessTemperatureComponent) {
    const prevGuessTemperatureComponent = guessTemperatureComponent;
    guessTemperatureComponent = new GuessTemperatureView(cityInfo.geonames[0], weatherInfo, guessFormSubmitHandler);
    container.replaceChild(guessTemperatureComponent.element, prevGuessTemperatureComponent.element);
    prevGuessTemperatureComponent.removeElement();
  } else {
    guessTemperatureComponent = new GuessTemperatureView(cityInfo.geonames[0], weatherInfo, guessFormSubmitHandler);
    container.insertAdjacentElement('afterbegin', guessTemperatureComponent.element);
  }

  if (currentMode === GuessMode.QUESTION) {
    guessTemperatureComponent.setSubmitHandler();
  }

  guessTemperatureComponent.updateLocalTime(calculateLocalTime(weatherInfo.timezone));
  timeUpdateIntervalId = setInterval(() => guessTemperatureComponent.updateLocalTime(calculateLocalTime(weatherInfo.timezone)), 1000);

};

const removeGuessComponent = () => {
  container.removeChild(guessTemperatureComponent.element);
  guessTemperatureComponent.removeElement();
  guessTemperatureComponent = null;
};

const initGuessComponent = async () => {
  cityInfo = await geonames.getCityInfo();
  weatherInfo = await weather.searchByCity(cityInfo.geonames[0].name);
  renderGuessComponent();
};

function guessFormSubmitHandler(inputValue) {
  currentMode = GuessMode.RESULTS;
  const diff = inputValue - Math.round(weatherInfo.main.temp);
  console.log(inputValue, Math.round(weatherInfo.main.temp), diff >= 0 ? `+${diff}` : String(diff));
}

export {
  initGuessComponent,
  removeGuessComponent,
};
