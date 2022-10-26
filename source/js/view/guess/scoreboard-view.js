import AbstractView from '../abstract-view.js';

const getScoreboardListTemplate = (scoreboard) => (
  scoreboard.map((item) => `<li class="scoreboard__item">${item.nickname}: ${item.score}</li>`).join('\n')
);

const getScoreboardDescriptionTemplate = (place) => place ? `<h2 class="scoreboard__description vh">Your place in scoreboard: ${place}!</h2>` : '';

const getScoreboardFormtemplate = (place) => (
  place ?
    `<div class="scoreboard__registration">
    <h2 class="scoreboard__registration-header">Enter your name to update scoreboard</h2>
      <form action="" class="scoreboard__form">
        <input class="guess__search-bar scoreboard__search-bar" type="text" placeholder="Enter your name here">
        <button class="scoreboard__form-submit-btn" type="submit">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" width="40px" height="40px"><defs><clipPath><path fill="#000" fill-opacity=".514" d="m-7 1024.36h34v34h-34z"/></clipPath><clipPath><path fill="#aade87" fill-opacity=".472" d="m-6 1028.36h32v32h-32z"/></clipPath></defs><path d="m345.44 248.29l-194.29 194.28c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744l171.91-171.91-171.91-171.9c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.29 194.28c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373" transform="matrix(.03541-.00013.00013.03541 2.98 3.02)" fill="rgba(255, 255, 255, 0.5)"/></svg>
        </button>
      </form>
    </div>` :
    ''
);

const getScoreboardTemplate = (scoreboard, totalScore, place) => (
  `<div class="scoreboard">
  <h1 class="scoreboard__header">You scored: ${totalScore}!</h1>

  ${getScoreboardDescriptionTemplate(place)}

  <div class="scoreboard__list-wrapper">
    <ol class="scoreboard__list">

      ${getScoreboardListTemplate(scoreboard)}

    </ol>
  </div>

  ${getScoreboardFormtemplate(place)}

  <button class="scoreboard__try-again-btn">Try again</button>
</div>`
);

export default class ScoreboardView extends AbstractView {
  constructor(data) {
    super();
    const {scoreboard, totalScore, place} = data;
    this.scoreboard = scoreboard;
    this.totalScore = totalScore;
    this.place = place;
  }

  get template() {
    return getScoreboardTemplate(this.scoreboard, this.totalScore, this.place);
  }

  setSubmitHandler(cb) {
    this.element.querySelector('.scoreboard__form').addEventListener('submit', (evt) => {
      evt.preventDefault();
      cb(this.element.querySelector('.scoreboard__search-bar').value);
      this.element.querySelector('.guess__search-bar').value = '';
    });
  }
}
