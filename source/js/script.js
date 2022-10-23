import { windowLoadHandler, removeWeatherComponent } from './search.js';
import { initGuessComponent, removeGuessComponent } from './guess.js';

import { AppMode } from './const.js';

// Элементы DOM

const controlBtnsContainer = document.querySelector('.control-buttons');
const controlBtns = controlBtnsContainer.querySelectorAll('.switch-mode-btn');

// Переменные

//

controlBtnsContainer.addEventListener('click', switchAppModeHandler);
window.addEventListener('load', initGuessComponent);

// Обработчики

async function switchAppModeHandler (evt) {
  switch (true) {
    case (evt.target.classList.contains('btn--guess') && !evt.target.classList.contains('switch-mode-btn--active')):
      removeWeatherComponent();
      initGuessComponent();
      break;
    case (evt.target.classList.contains('btn--weather') && !evt.target.classList.contains('switch-mode-btn--active')):
      await removeGuessComponent();
      windowLoadHandler();
      break;
  }

  controlBtns.forEach((btn) => {
    btn.classList.remove('switch-mode-btn--active');
  });
  evt.target.classList.add('switch-mode-btn--active');
}
