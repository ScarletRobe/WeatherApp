import { getRandomPositiveInteger } from './utils.js';

export default class Geonames {
  constructor() {
    this.USERNAME = 'scrltrb';
    this.BASE_URL = 'http://api.geonames.org/searchJSON?';
    this.RESULTS_COUNT = 5000;
    this.LANG = 'en';
  }

  async getCityInfo() {
    return this.fetchGeonames(`${this.BASE_URL}&username=${this.USERNAME}&cities=cities15000&startRow=${getRandomPositiveInteger(0, this.RESULTS_COUNT)}&maxRows=1&lang=${this.LANG}`);
  }

  async fetchGeonames (URL) {
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
