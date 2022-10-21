import Geonames from './fetch/fetch-geonames.js';
import Weather from './fetch/fetch-weather.js';

import GuessTemperatureView from './view/guess/guess-temperature-view.js';
import GuessResultView from './view/guess/guess-result-view.js';

import { calculateLocalTime } from './utils.js';
import { GuessMode, GuessComponents } from './const.js';

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

const renderGuessComponent = (payload) => {
  let component;
  let prevComponent;

  if (timeUpdateIntervalId) {
    clearInterval(timeUpdateIntervalId);
  }

  switch (payload.component) {
    case (GuessComponents.TEMPERATURE):
      prevComponent = guessTemperatureComponent;
      guessTemperatureComponent = new GuessTemperatureView(cityInfo, weatherInfo, guessFormSubmitHandler);
      component = guessTemperatureComponent;
      break;
    case (GuessComponents.RESULT):
      prevComponent = guessResultComponent;
      guessResultComponent = new GuessResultView(cityInfo, weatherInfo, payload.results);
      component = guessResultComponent;
      break;
  }

  if (prevComponent) {
    container.replaceChild(component.element, prevComponent.element);
    prevComponent.removeElement();
  } else {
    container.insertAdjacentElement('afterbegin', component.element);
  }

  switch (currentMode) {
    case (GuessMode.QUESTION):
      guessTemperatureComponent.setSubmitHandler();
      break;
  }

  component.updateLocalTime(calculateLocalTime(weatherInfo.timezone));
  timeUpdateIntervalId = setInterval(() => component.updateLocalTime(calculateLocalTime(weatherInfo.timezone)), 1000);
};

const removeGuessComponent = (component) => {
  switch (component) {
    case GuessComponents.TEMPERATURE:
      if (guessTemperatureComponent) {
        container.removeChild(guessTemperatureComponent.element);
        guessTemperatureComponent.removeElement();
        guessTemperatureComponent = null;
      }
      break;
    case GuessComponents.RESULT:
      if (guessResultComponent) {
        container.removeChild(guessResultComponent.element);
        guessResultComponent.removeElement();
        guessResultComponent = null;
      }
      break;
    default:
      removeGuessComponent(GuessComponents.TEMPERATURE);
      removeGuessComponent(GuessComponents.RESULT);
  }
  clearInterval(timeUpdateIntervalId);
};

const showGuessResult = (results) => {
  removeGuessComponent(GuessComponents.TEMPERATURE);
  renderGuessComponent({
    component: GuessComponents.RESULT,
    results,
  });
  guessResultComponent.manageBtnVisibility(true);
};

const initGuessComponent = async () => {
  cityInfo = (await geonames.getCityInfo()).geonames[0];
  weatherInfo = await weather.searchByCity(cityInfo.name);
  renderGuessComponent({
    component: GuessComponents.TEMPERATURE,
  });
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
