import Geonames from './fetch-geonames.js';
import Weather from './fetch-weather.js';

import GuessTemperatureView from './view/guess-temperature-view.js';
import GuessResultView from './view/guess-result-view.js';

import { calculateLocalTime } from './utils.js';
import { GuessMode } from './const.js';

const geonames = new Geonames();
const weather = new Weather();

// Элементы DOM

const container = document.querySelector('.card');

// Компоненты

let guessTemperatureComponent = null;
let guessResultComponent = null;

// Переменные

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
    guessTemperatureComponent = new GuessTemperatureView(cityInfo, weatherInfo, guessFormSubmitHandler);
    container.replaceChild(guessTemperatureComponent.element, prevGuessTemperatureComponent.element);
    prevGuessTemperatureComponent.removeElement();
  } else {
    guessTemperatureComponent = new GuessTemperatureView(cityInfo, weatherInfo, guessFormSubmitHandler);
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
  clearInterval(timeUpdateIntervalId);
};

const showGuessResult = (results) => {
  guessResultComponent = new GuessResultView(cityInfo, weatherInfo, results);
  container.replaceChild(guessResultComponent.element, guessTemperatureComponent.element);
  guessResultComponent.manageBtnVisibility(true);

  guessResultComponent.updateLocalTime(calculateLocalTime(weatherInfo.timezone));
  timeUpdateIntervalId = setInterval(() => guessResultComponent.updateLocalTime(calculateLocalTime(weatherInfo.timezone)), 1000);

};

const initGuessComponent = async () => {
  cityInfo = (await geonames.getCityInfo()).geonames[0];
  weatherInfo = await weather.searchByCity(cityInfo.name);
  renderGuessComponent();
};

function guessFormSubmitHandler(inputValue) {
  currentMode = GuessMode.RESULTS;
  showGuessResult({
    real: Math.round(Number(weatherInfo.main.temp)),
    user: Number(inputValue),
    diff: Number(inputValue) - Number(Math.round(weatherInfo.main.temp)),
  });
}

export {
  initGuessComponent,
  removeGuessComponent,
};
