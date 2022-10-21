/**
 * Возвращает случайное число из диапазона.
 * @param {number} min - минимальное число из диапазона
 * @param {number} max - максимальное число из диапазона
 * @returns {integer} - случайное число
 */
const getRandomPositiveInteger = (min, max = 0) => {
  if (max < 0 || min < 0 || max % 1 !== 0 || min % 1 !== 0) {
    throw new Error('Задан некорректный диапазон');
  }
  if (max < min) {
    [min, max] = [max, min];
  }
  return Math.abs(Math.round(min - 0.5 + Math.random() * (max - min + 1)));
};

const calculateLocalTime = (timezone) => {
  const date = new Date();
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  const currTime = new Date(utcTime + (1000 * timezone));
  return {
    time: currTime.toLocaleTimeString(),
    date: currTime.toLocaleDateString(),
  };
};

export {
  getRandomPositiveInteger,
  calculateLocalTime,
};
