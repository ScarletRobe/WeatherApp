import { windowLoadHandler, removeWeatherComponent } from './search.js';
import { initGuessComponent, removeGuessComponent } from './guess.js';

import CardContainerView from './view/card-container-view.js';

// Элементы DOM

const appContainer = document.querySelector('.container');
const controlBtnsContainer = document.querySelector('.control-buttons');
const controlBtns = controlBtnsContainer.querySelectorAll('.switch-mode-btn');

// Переменные

const cardContainer = new CardContainerView();

//

appContainer.insertAdjacentElement('afterbegin', cardContainer.element);
controlBtnsContainer.addEventListener('click', switchAppModeHandler);
window.addEventListener('load', appLoadHandler);

// Обработчики

async function switchAppModeHandler (evt) {
  if (evt.target.classList.contains('switch-mode-btn') && !evt.target.classList.contains('switch-mode-btn--active')) {
    controlBtns.forEach((btn) => {
      btn.classList.add('switch-mode-btn--active');
    });

    switch (evt.target.control.id) {
      case ('btn--guess'):
        await removeWeatherComponent();
        await initGuessComponent(cardContainer);
        break;
      case ('btn--weather'):
        await removeGuessComponent(true);
        await windowLoadHandler(cardContainer);
        break;
    }

    controlBtns.forEach((btn) => {
      btn.classList.remove('switch-mode-btn--active');
    });
    evt.target.classList.add('switch-mode-btn--active');
  }
}

async function appLoadHandler () {
  await windowLoadHandler(cardContainer);
  controlBtnsContainer.querySelector('.switch-mode-btn--guess').classList.remove('switch-mode-btn--active');
}
