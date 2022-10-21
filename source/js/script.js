import { windowLoadHandler, removeWeatherComponent } from './search.js';
import { initGuessComponent, removeGuessComponent } from './guess.js';

import { AppMode } from './const.js';

// Элементы DOM

const switchModeBtn = document.querySelector('.switch-mode-btn');

// Переменные

let currentMode = AppMode.GUESS;

//

switchModeBtn.addEventListener('click', switchAppModeHandler);
window.addEventListener('load', initGuessComponent);


// Обработчики

function switchAppModeHandler() {
  switch (currentMode) {
    case AppMode.WEATHER:
      currentMode = AppMode.GUESS;
      removeWeatherComponent();
      initGuessComponent();
      break;
    case AppMode.GUESS:
      currentMode = AppMode.WEATHER;
      removeGuessComponent();
      windowLoadHandler();
      break;
  }
}
