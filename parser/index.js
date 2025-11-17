"use strict";

//const colors = require("colors");
const dictionary = require("./dictionary");
const moment = require("moment");

let getFeel = temp => {
  if (temp < 5) {
    return "shivering cold";
  } else if (temp >= 5 && temp < 15) {
    return "pretty cold";
  } else if (temp >= 15 && temp < 25) {
    return "moderately cold";
  } else if (temp >= 25 && temp < 32) {
    return "quite warm";
  } else if (temp >= 32 && temp < 40) {
    return "very hot";
  } else {
    return "super hot";
  }
};

let getPrefix = (conditionCode, tense = "present") => {
  let findPrefix = dictionary[tense].find(item => {
    if (item.codes.indexOf(Number(conditionCode)) > -1) {
      return true;
    }
  });

  return findPrefix.prefix || "";
};

let getDate = day => {
  let dayStr = day.toLowerCase().trim();
  switch (dayStr) {
    case "tomorrow":
      return moment()
        .add(1, "d")
        .format("YYYY-MM-DD");
    case "day after tomorrow":
      return moment()
        .add(2, "d")
        .format("YYYY-MM-DD");
    default:
      return moment().format("YYYY-MM-DD");
  }
};

let currentWeather = response => {
  if (response.location) {
    const {location, condition, code, temperature} = response;
    return `Right now, ${getPrefix(
      code
    )} ${condition.toLowerCase()} in ${location}. It is ${getFeel(
      Number(temperature)
    )} at ${String(temperature)} degrees Celsius.`;
  } else {
    return "I don't seem to know anything about this place...Sorry :(";
  }
};

let forecastWeather = (response, data) => {
  if (response.location) {
    // convert 'tomorrow', 'day after tomorrow', 'today' into date formats like 23 June 2016
    let parseDate = getDate(data.time);
    let {location} = response;
    let {condition, code} = response.forecast.filter(
      i => i.date === parseDate
    )[0];

    let regEx = new RegExp(data.weather, "i");
    let testConditions = regEx.test(condition); // true or false
    return `${testConditions ? "Yes" : "No"}, ${getPrefix(
      code,
      "future"
    )} ${condition.toLowerCase()} ${data.time} in ${location}`;
  } else {
    return "I don't seem to know anything about this place...Sorry :(";
  }
};

module.exports = {
  currentWeather,
  forecastWeather
};
