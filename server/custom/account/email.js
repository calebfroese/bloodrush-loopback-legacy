var mailConfig = require('./email.config.js');
var SparkPost = require('sparkpost');
var client = new SparkPost(mailConfig.sparkpostApiKey);

module.exports = {
    signup: (email, teamName, callback) => {
        // Generate a token
        var token = makeid(12);
        var year = (new Date()).getFullYear();
        var yearNow = year;
        if (yearNow > 2017) {
            year = year + ' - ' + yearNow
        }

        var params = {
            content: {
                template_id: 'signup',
                use_draft_template: false
            },
            recipients: [
                {
                    address: {
                        email: email
                    }
                }
            ],
            substitution_data: {
                token: token,
                teamName: teamName,
                year: year
            }
        }
        client.transmissions.send(params);
        callback(token);
    }
}

function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}