var mailConfig = require('./email.config.js');
var SparkPost = require('sparkpost');
var client = new SparkPost(mailConfig.sparkpostApiKey);
var internalQuery = require('./../internal-query.js');
var logging = require('./../../logging.js');

module.exports = {
    signup: (email, teamId, callback) => {
        // Generate a token
        var token = teamId + '-' + makeid(20);
        var year = (new Date()).getFullYear();
        var yearNow = year;
        if (yearNow > 2017) {
            year = year + ' - ' + yearNow
        }
        // Find the team
        internalQuery('get', `/teams/${teamId}`, {}, team => {
            // Patch the team
            // callback(team)
            // var team = team;
            team.token = token;
            internalQuery('patch', `/teams/${teamId}`, team, response => {
                // Send the email
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
                        teamName: team.name,
                        year: year
                    }
                }
                client.transmissions.send(params);
                logging.event('Signup success. Verification email send to ' + team.id);
                callback(response);
            });
        });

    },
    verifyEmail: (token, callback) => {
        // Fetch the team with the token
        internalQuery('get', `/teams?filter={"token":"${token}"}`, {}, teams => {
            var team = teams[0];
            team.token = null;
            team.verified = true;
            logging.event('Verified team ' + team.id);
            internalQuery('patch', `/teams/${team.id}`, team, response => {
                callback(response)
            });
        })
    }
}

function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}