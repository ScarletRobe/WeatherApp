export default class Scoreboard {
  constructor() {
    this.API_KEY = '';
    this.BASE_URL = 'http://leonid.alwaysdata.net/';
  }

  async getScoreboard() {
    return await this.fetchScoreboard();
  }

  async fetchScoreboard() {
    try {
      const response = await fetch(`${this.BASE_URL}api/scoreboard`);
      if(!response.ok) {
        throw new Error(response.statusText);
      }
      const json = await response.json();

      return json;
    } catch (error) {
      console.error(error);
    }
  }
}
