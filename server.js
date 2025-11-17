"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config");
const FBeamer = require("./fbeamer");
// Vanilla
const matcher = require("./matcher");
const weather = require("./weather");
const widgets = require('./widgets');
const Razorpay = require('razorpay');
const {currentWeather, forecastWeather} = require("./parser");

const server = express();
const PORT = process.env.PORT || 3000;
const f = new FBeamer(config.fb);
const w = new widgets();

let instance = new Razorpay({
  key_id: 'rzp_test_VsOoD4FfLQugju',
  key_secret: 'DVPYIhCE7v0Ou0JqsAY94AUi',
});

server.get("/", (req, res) => f.registerHook(req, res));
server.post(
  "/",
  bodyParser.json({
    verify: f.verifySignature.call(f)
  })
);
server.post("/", (req, res, next) => {
  // Messages will be received here if the signature goes through
  // we will pass the messages to FBeamer for parsing
  return f.incoming(req, res, data => {
    try {
      console.log("************123");
      console.log(data.object);
      console.log("************321");
      if (data.type === "text") {
        matcher(data.content, async resp => {
          switch (resp.intent) {
            // case "Hello":
            //   await f.txt(data.sender, `${resp.entities.greeting} to you too!`);
            //   break;
            case "CurrentWeather":
              await f.txt(data.sender, "Let me check...");
              let cwData = await weather(resp.entities.city);
              let cwResult = currentWeather(cwData);
              await f.txt(data.sender, cwResult);
              break;
            case "WeatherForecast":
              await f.txt(data.sender, "Let me check...");
              let wfData = await weather(resp.entities.city);
              let wfResult = forecastWeather(wfData, resp.entities);
              await f.txt(data.sender, wfResult);
              break;
            case "abc":
              await f.txt(data.sender, "wait...");
              await f.webview(data.sender,setRoomPreferences());
              break;
            case "xyz":
              await f.txt(data.sender, "wait...for a while");
              await f.webview(data.sender,selectProduct());
              break;
            case "ng":
              await f.txt(data.sender, "wait...for a while");
              await f.webview(data.sender,angularTour());
              break;
            default: {
              await f.txt(data.sender, "I don't know what you mean :(");
            }
          }
        });
      }
    } catch (e) {
      console.log(e);
    }
  });
});

//for webview start
// Serve the options path and set required headers
server.get('/options', (req, res, next) => {
  let referer = req.get('Referer');
  if (referer) {
      if (referer.indexOf('www.messenger.com') >= 0) {
          res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
      } else if (referer.indexOf('www.facebook.com') >= 0) {
          res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
      }
      //res.sendFile('public/payment.html', {root: __dirname});
      res.sendFile('public/payment.html', {root: __dirname});
  }
});

server.get('/selctProduct', (req, res, next) => {
  let referer = req.get('Referer');
  if (referer) {
      if (referer.indexOf('www.messenger.com') >= 0) {
          res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
      } else if (referer.indexOf('www.facebook.com') >= 0) {
          res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
      }
      //res.sendFile('public/payment.html', {root: __dirname});
      res.sendFile('public/selectProducts.html', {root: __dirname});
  }
});

// Define the template and webview
function setRoomPreferences() {
  // let response = {
  //     attachment: {
  //         type: "template",
  //         payload: {
  //             template_type: "button",
  //             text: "OK, let's set your room preferences so I won't need to ask for them in the future.",
  //             buttons: [{
  //                 type: "web_url",
  //                 //url: f.SERVER_URL + "/options",
  //                 url: "https://rzp.io/l/Y1QGgew",
  //                 title: "Set preferences",
  //                 webview_height_ratio: "full",
  //                 messenger_extensions: true
  //             }]
  //         }
  //     }
  // };
  let response = w.button('Test Button','web_url',f.SERVER_URL + "/options",'Set Preferences','full');
  return response;
}

function selectProduct() {
  let response = w.button('Select Product','web_url',f.SERVER_URL + "/selctProduct",'Set Preferences','full');
  return response;
};

function angularTour() {
  let response = w.button('Select Product','web_url',f.SERVER_URL,'Set Preferences','full');
  return response;
};

// Handle postback from webview
server.get('/optionspostback', (req, res) => {
  let body = req.query;
  console.log(req);
  console.log(body);
  //console.log(body);
  // let response = {
  //     "text": `Great, I will book you a ${body.bed} bed, with ${body.pillows} pillows and a ${body.view} view.`
  // };
  //let response = `Great, I will book you a ${body.bed} bed, with ${body.pillows} pillows and a ${body.view} view.`;
  let response = "New";
  res.status(200).send('Please close this window to return to the conversation thread.');
  f.txt(body.psid, response);
});

server.get('/createorder', (req, res) => {
  let body = req.query;
  console.log(req);
  console.log(body);

  let options = {
    amount :'20000', 
    currency :'INR', 
    receipt:'receipt',  
    payment_capture:1, 
    notes:'Pillow,Bed'
  };
  instance.orders.create(options,function(err,order){
    if (!err){
      console.log(order);
    }else{
      console.log(err);
    }
  });
  //console.log(body);
  // let response = {
  //     "text": `Great, I will book you a ${body.bed} bed, with ${body.pillows} pillows and a ${body.view} view.`
  // };
  //let response = `Great, I will book you a ${body.bed} bed, with ${body.pillows} pillows and a ${body.view} view.`;
  let response = `Pay for ${body.pillows} pillow`;
  res.status(200).send('Please close this window to return to the conversation thread.');
  f.txt(body.psid, response);
});
//for webview end

server.listen(PORT, () =>
  console.log(`FBeamer Bot Service running on Port ${PORT}`)
);
