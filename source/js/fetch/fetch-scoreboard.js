export default class Scoreboard {
  constructor() {
    this.API_KEY = '';
    this.BASE_URL = 'https://leonid.alwaysdata.net/';
  }

  async getScoreboard() {
    return await this.fetchScoreboard();
  }

  async patchScoreboard(user) {
    return await this.fetchScoreboard('PATCH', user);
  }

  async fetchScoreboard(method, user) {
    try {
      const response = await fetch(`${this.BASE_URL}api/scoreboard`, {
        method,
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify(user),
      });
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
