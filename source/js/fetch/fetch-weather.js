export default class Weather {
  constructor() {
    this.API_KEY = 'e0c1bc649d3e128f415295a54d0cfcea';
    this.lang = 'en';
  }

  switchLang(lang = 'en') {
    this.lang = lang;
  }

  destroySpaces (text) {
    return text.replaceAll(/\s/g, '-');
  }

  async searchByCity (city) {
    let data = await this.fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.API_KEY}&units=metric&lang=${this.lang}`);
    if (data) {
      return data;
    }

    city = this.destroySpaces(city);
    data = await this.fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.API_KEY}&units=metric&lang=${this.lang}`);
    if (data) {
      return data;
    }
  }

  async searchByCoord (lat, lon) {
    return this.fetchWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric&lang=${this.lang}`);
  }

  async fetchWeather (URL) {
    try {
      const response = await fetch(URL);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const json = await response.json();

      return json;
    } catch (error) {
      console.error(error);
    }
  }
}
