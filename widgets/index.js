'use strict';
class Widgets {
    // constructor({

    // });
    button(text,buttonType,buttonUrl,buttonTitle,webHeight){
        let response = {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: text,
                    buttons: [{
                        type: buttonType,
                        //url: f.SERVER_URL + "/options",
                        url: buttonUrl,
                        title: buttonTitle,
                        webview_height_ratio: webHeight,
                        messenger_extensions: true
                    }]
                }
            }
        };
      
        return response;
    }
}

module.exports = Widgets;