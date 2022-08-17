export default class MyMemory {
  constructor() {
    this.API_KEY = 'wEHa01ExHQgkNmP3pnO0jibvA5LIumFK1GQ2L5PixRE';
    this.BASE_URL = 'https://api.mymemory.translated.net/';
  }

  destroyPunctuationMarks (text) {
    return text.replace(/[!?,.]/g, '');
  }

  async getTranslation(text) {
    const data = await this.fetchMymemory(text);
    return this.destroyPunctuationMarks(data.responseData.translatedText);
  }

  async fetchMymemory(word) {
    try {
      const response = await fetch(`${this.BASE_URL}get?q=${word}!&langpair=ru|en`);
      if(!response.ok) {
        throw new Error(response.statusText);
      }
      const json = await response.json();

      return json;
    } catch (error) {
      console.error(error)
    }
  }
}
