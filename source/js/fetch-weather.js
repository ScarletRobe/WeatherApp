export default class Weather {
  constructor() {
    this.API_KEY = 'e0c1bc649d3e128f415295a54d0cfcea';
    this.lang = 'en';
  }

  switchLang(lang = 'en') {
    this.lang = lang;
  }

  async searchByCity (city) {
    if (city === this.city) {
      return;
    }

    return this.fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.API_KEY}&units=metric&lang=${this.lang}`);
  }

  async searchByCoord (lat, lon) {
    if (lat === this.lat && lon === this.lon) {
      return;
    }

    return this.fetchWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric&lang=${this.lang}`);
  }

  async fetchWeather (URL) {
    const response = await fetch(URL);
    const json = await response.json();

    return json;
  }
}
