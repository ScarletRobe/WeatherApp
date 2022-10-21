import AbstractView from './abstract-view.js';

const getWeatherWindowTemplate = (data) => (
  `<div class="wrapper">
    <form class="card__search" id="search">
      <input class="card__search-bar" type="text" placeholder="Search" autocomplete="on">
      <button class="card__search-btn" type="submit">
        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path d="M505.04 442.66l-99.71-99.69c-4.5-4.5-10.6-7-17-7h-16.3c27.6-35.3 44-79.69 44-127.99C416.03 93.09 322.92 0 208.02 0S0 93.09 0 207.98s93.11 207.98 208.02 207.98c48.3 0 92.71-16.4 128.01-44v16.3c0 6.4 2.5 12.5 7 17l99.71 99.69c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.59.1-33.99zm-297.02-90.7c-79.54 0-144-64.34-144-143.98 0-79.53 64.35-143.98 144-143.98 79.54 0 144 64.34 144 143.98 0 79.53-64.35 143.98-144 143.98zm.02-239.96c-40.78 0-73.84 33.05-73.84 73.83 0 32.96 48.26 93.05 66.75 114.86a9.24 9.24 0 0 0 14.18 0c18.49-21.81 66.75-81.89 66.75-114.86 0-40.78-33.06-73.83-73.84-73.83zm0 96c-13.26 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24z"></path></svg>
      </button>
    </form>
    <h1 class="card__city">Weather in ${data.name}</h1>
    <div class="card__temperature">${Math.round(data.main.temp)}°C</div>
    <img class="card__icon" src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon">
    <div class="card__more-info">
      <div class="card__details">
        <div class="card__description">${data.weather[0].description}</div>
        <div class="card__humidity">Humidity: ${data.main.humidity}%</div>
        <div class="card__wind-speed">Wind speed: ${data.wind.speed} km/h</div>
        <div class="card__pressure">Pressure: ${data.main.pressure} hPa</div>
      </div>
      <div class="card__other-info">
        <div class="card__date">Date: </div>
        <div class="card__time">Current time:</div>
        <!-- <div class="card__sun">
          <div class="card__sunrise">06:00</div>
          <div class="card__sunset">18:00</div>
        </div> -->
      </div>
    </div>
  </div>`
);

export default class WeatherWindowView extends AbstractView{
  #cb = null;

  constructor(data, formSubmitCallback) {
    super();
    this.data = data;
    this.#cb = formSubmitCallback;
  }

  get template() {
    return getWeatherWindowTemplate(this.data);
  }

  updateLocalTime(localDate) {
    this.element.querySelector('.card__date').textContent = `Date: ${localDate.date}`;
    this.element.querySelector('.card__time').textContent = `Current time: ${localDate.time}`;
  }

  setSubmitHandler() {
    this.element.querySelector('.card__search').addEventListener('submit', (evt) => {
      evt.preventDefault();
      this.#cb(this.element.querySelector('.card__search-bar').value);
      this.element.querySelector('.card__search-bar').value = '';
    });
  }
}
