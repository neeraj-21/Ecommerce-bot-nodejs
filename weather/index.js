"use strict";
const axios = require("axios");
const apiKey = "96e8d9df39b642eabd4112653192405";

const formatData = data => {
  return {
    location: `${data.location.name}, ${data.location.country}`,
    temperature: data.current.temp_c,
    condition: data.current.condition.text,
    code: data.current.condition.code,
    forecast: data.forecast.forecastday.map(day => {
      return {
        date: day.date,
        code: day.day.condition.code,
        condition: day.day.condition.text
      };
    })
  };
};

let getWeather = location => {
  return new Promise(async (resolve, reject) => {
    try {
      const weatherConditions = await axios.get(
        "https://api.apixu.com/v1/forecast.json",
        {
          params: {
            key: apiKey,
            q: location,
            days: 3
          }
        }
      );
      resolve(formatData(weatherConditions.data));
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = getWeather;
