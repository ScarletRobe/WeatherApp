import Geonames from './fetch/fetch-geonames.js';
import Weather from './fetch/fetch-weather.js';
import Unsplash from './fetch/fetch-unsplash.js';
import Scoreboard from './fetch/fetch-scoreboard.js';

import GuessTemperatureView from './view/guess/guess-temperature-view.js';
import GuessResultView from './view/guess/guess-result-view.js';
import ScoreboardView from './view/guess/scoreboard-view.js';

import { calculateLocalTime } from './utils.js';
import { GuessMode, GuessComponents, ContainerMode } from './const.js';

const geonames = new Geonames();
const weather = new Weather();
const unsplash = new Unsplash();
const scoreboard = new Scoreboard();

// Компоненты

let guessTemperatureComponent = null;
let guessResultComponent = null;
let guessScoreboardComponent = null;
let containerComponent = null;

// Переменные

const MAX_QUESTIONS_AMOUNT = 1;
let questionNum = null;
let timeUpdateIntervalId;
let weatherInfo;
let cityInfo;
let currentMode = GuessMode.QUESTION;

const renderGuessComponent = (payload) => {
  let component;
  let prevComponent;

  const updateTime = () => {
    component.updateLocalTime(calculateLocalTime(weatherInfo.timezone));
    timeUpdateIntervalId = setInterval(() => component.updateLocalTime(calculateLocalTime(weatherInfo.timezone)), 1000);
  };

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
      updateTime();
      break;

    case (GuessComponents.RESULT):
      prevComponent = guessResultComponent;
      guessResultComponent = new GuessResultView(cityInfo, weatherInfo, payload.data);
      guessResultComponent.appear(() => {
        guessResultComponent.setNextBtnClickHandler(guessNextBtnHandler);
      });

      component = guessResultComponent;
      updateTime();
      break;

    case (GuessComponents.SCOREBOARD):
      containerComponent.switchMode(ContainerMode.SCOREBOARD);
      guessScoreboardComponent = new ScoreboardView(payload.data);
      containerComponent.slideRightToTheLeft(() => {
        guessScoreboardComponent.setSubmitHandler(guessFormSubmitHandler);
      });

      component = guessScoreboardComponent;
      break;
  }

  if (prevComponent) {
    containerComponent.element.replaceChild(component.element, prevComponent.element);
    prevComponent.removeElement();
  } else {
    containerComponent.element.insertAdjacentElement('afterbegin', component.element);
  }
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
      case(GuessMode.SCOREBOARD):
        componentName = GuessComponents.SCOREBOARD;
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
      case GuessComponents.SCOREBOARD:
        if (guessScoreboardComponent) {
          containerComponent.slideLeft(() => {
            removeComponent(guessScoreboardComponent);
            guessScoreboardComponent = null;
            resolve();
          });
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
    data: results,
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

const showGuessScoreboard = async () => {
  currentMode = GuessMode.SCOREBOARD;
  renderGuessComponent({
    component: GuessComponents.SCOREBOARD,
    data: 1,
  });
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
  questionNum = 1;
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
  if (++questionNum > MAX_QUESTIONS_AMOUNT) {
    await removeGuessComponent(false, GuessComponents.RESULT);
    showGuessScoreboard();
    return;
  }
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
