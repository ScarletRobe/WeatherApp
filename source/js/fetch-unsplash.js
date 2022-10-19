import { getRandomPositiveInteger } from './utils.js';

export default class Unsplash {
  constructor() {
    this.API_KEY = 'wEHa01ExHQgkNmP3pnO0jibvA5LIumFK1GQ2L5PixRE';
    this.BASE_URL = 'https://api.unsplash.com/search/photos/';
  }

  async getImage (keyword) {
    const data = await this.fetchUnsplash(keyword);
    if (!data || data.total === 0) {
      return data;
    }

    const pageAmount = data.total_pages;
    return this.fetchUnsplash(keyword, getRandomPositiveInteger(0, pageAmount >= 3 ? Math.ceil(pageAmount / 3) : pageAmount));
  }

  async fetchUnsplash(keyword, page) {
    try {
      const response = await fetch(`${this.BASE_URL}?query=${keyword}&page=${page ? page : ''}&per_page=0&client_id=${this.API_KEY}`);
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
