import { getRandomPositiveInteger } from '../utils.js';

export default class FetchCountriesDataBase {
  constructor() {
    this.BASE_URL = 'https://parseapi.back4app.com/';
    this.X_PARSE_APPLICATION_ID = 'nIMeSE9Kkd87o3b7AbIA9PFKtERIps9SOWvGsAuO';
    this.X_PARSE_REST_API_KEY = 'PBEL8qEJOxzYMTEa49O0vgmNmA6XAAu9wLOGAhix';
    this.MIN_POPULATION = 1000000;
    this.TOTAL_CITIES = 546;
    this.RESULTS_COUNT = 5000;
    this.LANG = 'en';
  }

  #getParameters() {
    return encodeURIComponent(JSON.stringify({
      'population': {
        '$gte': this.MIN_POPULATION
      },
      'country': {
        '$exists': true
      }
    }));
  }

  #getHeaders() {
    return new Headers({
      'X-Parse-Application-Id': this.X_PARSE_APPLICATION_ID,
      'X-Parse-REST-API-Key': this.X_PARSE_REST_API_KEY,
    });
  }

  async getCityInfo() {
    return this.fetchDatabase(`${this.BASE_URL}classes/Continentscountriescities_City?skip=${getRandomPositiveInteger(0, this.TOTAL_CITIES)}&limit=1&where=${this.#getParameters()}`);
  }

  async getCountryInfo(countryID) {
    return this.fetchDatabase(`${this.BASE_URL}classes/Continentscountriescities_Country/${countryID}`);
  }

  async fetchDatabase (URL) {
    try {
      const response = await fetch(URL, {
        method: 'GET',
        headers: this.#getHeaders()
      });
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
