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

// Компоненты

let guessTemperatureComponent = null;
let guessResultComponent = null;
let containerComponent = null;

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
      containerComponent.slideRightToTheLeft(() => {
        guessTemperatureComponent.setSubmitHandler(guessFormSubmitHandler);
      });

      component = guessTemperatureComponent;
      break;
    case (GuessComponents.RESULT):
      prevComponent = guessResultComponent;
      guessResultComponent = new GuessResultView(cityInfo, weatherInfo, payload.results);
      guessResultComponent.appear(() => {
        guessResultComponent.setNextBtnClickHandler(guessNextBtnHandler);
      });

      component = guessResultComponent;
      break;
  }

  if (prevComponent) {
    containerComponent.element.replaceChild(component.element, prevComponent.element);
    prevComponent.removeElement();
  } else {
    containerComponent.element.insertAdjacentElement('afterbegin', component.element);
  }

  component.updateLocalTime(calculateLocalTime(weatherInfo.timezone));
  timeUpdateIntervalId = setInterval(() => component.updateLocalTime(calculateLocalTime(weatherInfo.timezone)), 1000);
};

const removeGuessComponent = async (isModeChange = false, componentName) => {
  if (!componentName) {
    switch (currentMode) {
      case(GuessMode.QUESTION):
        componentName = GuessComponents.TEMPERATURE;
        break;
      case(GuessMode.RESULTS):
        componentName = GuessComponents.RESULT;
        break;
    }
  }

  const prom = new Promise((resolve) => {
    const removeComponent = (component) => {
      containerComponent.element.removeChild(component.element);
      component.removeElement();
    };

    switch (componentName) {
      case GuessComponents.TEMPERATURE:
        if (guessTemperatureComponent) {
          if (isModeChange) {
            containerComponent.slideLeft(() => {
              removeComponent(guessTemperatureComponent);
              guessTemperatureComponent = null;
              resolve();
            });
          } else {
            guessTemperatureComponent.vanish(() => {
              removeComponent(guessTemperatureComponent);
              guessTemperatureComponent = null;
              resolve();
            });
          }
        }
        break;
      case GuessComponents.RESULT:
        if (guessResultComponent) {
          containerComponent.slideLeft(() => {
            removeComponent(guessResultComponent);
            guessResultComponent = null;
            resolve();
          });
          guessResultComponent.removeDocumentKeydownHandler();
        }
        break;
    }
  });

  return prom;
};

const updateBackground = (images, city) => {
  if (images) {
    document.body.style.background = `url(${images.results[0].urls.full})`;
  } else {
    document.body.style.background = `url(https://source.unsplash.com/1600x900/?${city})`;
  }
};

const showGuessResult = async (results) => {
  currentMode = GuessMode.RESULTS;
  await removeGuessComponent(false, GuessComponents.TEMPERATURE);
  renderGuessComponent({
    component: GuessComponents.RESULT,
    results,
  });
  guessResultComponent.manageBtnVisibility(true);
  guessResultComponent.setDocumentKeydownHandler(guessNextBtnHandler);
};

const showGuessTemperature = (images) => {
  currentMode = GuessMode.QUESTION;
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

const initGuessComponent = async (container) => {
  containerComponent = container;
  const images = await getDataForGuess();
  showGuessTemperature(images);
};

function guessFormSubmitHandler(inputValue) {
  showGuessResult({
    real: Math.round(Number(weatherInfo.main.temp)),
    user: Number(inputValue),
    diff: Number(inputValue) - Number(Math.round(weatherInfo.main.temp)),
  });
}

async function guessNextBtnHandler() {
  const [, images] = await Promise.all([
    removeGuessComponent(false, GuessComponents.RESULT),
    getDataForGuess()
  ]);

  showGuessTemperature(images);
}

export {
  initGuessComponent,
  removeGuessComponent,
};
