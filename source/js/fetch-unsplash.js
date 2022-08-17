import { getRandomPositiveInteger } from './utils.js';

export default class Unsplash {
  constructor() {
    this.API_KEY = 'wEHa01ExHQgkNmP3pnO0jibvA5LIumFK1GQ2L5PixRE';
    this.BASE_URL = 'https://api.unsplash.com/search/photos/';
  }

  async getImage (keyword) {
    const data = await this.fetchUnsplash(keyword);
    console.log(data);
    if (!data) {
      return;
    }

    const pageAmount = data.total_pages;
    return this.fetchUnsplash(keyword, getRandomPositiveInteger(0, Math.ceil(pageAmount / 3)));
  }

  async fetchUnsplash(keyword, page) {
    try {
      let response;
      if (page) {
        response = await fetch(`${this.BASE_URL}?query=${keyword}&page=${page}&per_page=0&client_id=${this.API_KEY}`);
      } else {
        response = await fetch(`${this.BASE_URL}?query=${keyword}&per_page=0&client_id=${this.API_KEY}`);
      }
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const json = await response.json();

      return json;
    } catch (error) {
      console.log(error);

    }
  }
}
