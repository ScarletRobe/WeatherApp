import Geonames from './fetch/fetch-geonames.js';
import Weather from './fetch/fetch-weather.js';
import Unsplash from './fetch/fetch-unsplash.js';

import GuessTemperatureView from './view/guess/guess-temperature-view.js';
import GuessResultView from './view/guess/guess-result-view.js';

import { calculateLocalTime } from './utils.js';
import { GuessMode, GuessComponents } from './const.js';

const geonames = new Geonames();
const weather = new Weather();
const unsplash = new Unsplash();

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
      guessTemperatureComponent = new GuessTemperatureView(cityInfo, weatherInfo);
      container.classList.add('slide-right-to-left');
      setTimeout(() => {
        container.classList.remove('slide-right-to-left');
      }, 1000);
      guessTemperatureComponent.setSubmitHandler(guessFormSubmitHandler);

      component = guessTemperatureComponent;
      break;
    case (GuessComponents.RESULT):
      prevComponent = guessResultComponent;
      guessResultComponent = new GuessResultView(cityInfo, weatherInfo, payload.results);
      guessResultComponent.element.classList.add('appear');
      setTimeout(() => {
        guessResultComponent.element.classList.remove('appear');
      }, 150);
      guessResultComponent.setNextBtnClickHandler(guessNextBtnHandler);

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
      break;
  }

  component.updateLocalTime(calculateLocalTime(weatherInfo.timezone));
  timeUpdateIntervalId = setInterval(() => component.updateLocalTime(calculateLocalTime(weatherInfo.timezone)), 1000);
};

const removeGuessComponent = async (component) => (
  new Promise((resolve) => {
    switch (component) {
      case GuessComponents.TEMPERATURE:
        if (guessTemperatureComponent) {
          guessTemperatureComponent.element.classList.add('vanish');
          setTimeout(() => {
            guessTemperatureComponent.element.classList.remove('vanish');
            container.removeChild(guessTemperatureComponent.element);
            guessTemperatureComponent.removeElement();
            guessTemperatureComponent = null;
            resolve();
          }, 150);
        }
        break;
      case GuessComponents.RESULT:
        if (guessResultComponent) {
          container.classList.add('slide-left');
          setTimeout(() => {
            container.classList.remove('slide-left');
            container.removeChild(guessResultComponent.element);
            guessResultComponent.removeElement();
            guessResultComponent = null;
            resolve();
          }, 1000);
          guessResultComponent.removeDocumentKeydownHandler();
        }
        break;
      default:
        removeGuessComponent(GuessComponents.TEMPERATURE);
        removeGuessComponent(GuessComponents.RESULT);
        resolve();
    }
    clearInterval(timeUpdateIntervalId);
  })
);

const updateBackground = (images, city) => {
  if (images) {
    document.body.style.background = `url(${images.results[0].urls.full})`;
  } else {
    document.body.style.background = `url(https://source.unsplash.com/1600x900/?${city})`;
  }
};

const showGuessResult = async (results) => {
  await removeGuessComponent(GuessComponents.TEMPERATURE);
  renderGuessComponent({
    component: GuessComponents.RESULT,
    results,
  });
  guessResultComponent.manageBtnVisibility(true);
  guessResultComponent.setDocumentKeydownHandler(guessNextBtnHandler);
};

const showGuessTemperature = (images) => {
  renderGuessComponent({
    component: GuessComponents.TEMPERATURE,
  });
  updateBackground(images.value, cityInfo.name);
};

const getDataForGuess = async () => {
  try {
    cityInfo = (await geonames.getCityInfo()).geonames[0];
    const [data, images] = await Promise.allSettled([
      weather.searchByCity(cityInfo.name),
      unsplash.getImage(cityInfo.name, cityInfo.countryName),
    ]);

    if (!data.value) {
      throw new Error('Ошибка при загрузке информации о погоде');
    }
    weatherInfo = data.value;

    return images;
  } catch (error) {
    console.error(error);
  }
};

const initGuessComponent = async (images) => {
  images = await getDataForGuess();
  showGuessTemperature(images);
};

function guessFormSubmitHandler(inputValue) {
  currentMode = GuessMode.RESULTS;
  showGuessResult({
    real: Math.round(Number(weatherInfo.main.temp)),
    user: Number(inputValue),
    diff: Number(inputValue) - Number(Math.round(weatherInfo.main.temp)),
  });
}

async function guessNextBtnHandler() {
  const [, images] = await Promise.all([
    removeGuessComponent(GuessComponents.RESULT),
    getDataForGuess()
  ]);

  showGuessTemperature(images);
}

export {
  initGuessComponent,
  removeGuessComponent,
};
