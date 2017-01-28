var mailConfig = require('./email.config.js');
var SparkPost = require('sparkpost');
var client = new SparkPost(mailConfig.sparkpostApiKey);
var internalQuery = require('./../internal-query.js');

module.exports = {
    signup: (email, teamId, callback) => {
        // Generate a token
        var token = makeid(12);
        var year = (new Date()).getFullYear();
        var yearNow = year;
        if (yearNow > 2017) {
            year = year + ' - ' + yearNow
        }


        // Find the team
        internalQuery('get', `/teams/${teamId}`, team => {
            // Patch the team
            // team.verified = true;
            // internalQuery.patch(`/teams/${teamId}`, team => {
                callback(team);
            // });
        });

        // var params = {
        //     content: {
        //         template_id: 'signup',
        //         use_draft_template: false
        //     },
        //     recipients: [
        //         {
        //             address: {
        //                 email: email
        //             }
        //         }
        //     ],
        //     substitution_data: {
        //         token: token,
        //         teamId: teamId,
        //         year: year
        //     }
        // }
        // client.transmissions.send(params);
    }
}

function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}