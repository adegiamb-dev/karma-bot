
const countBy = require('lodash/countBy');
const count = (str, ch) => countBy(str)[ch] || 0;
const getUserId = (input) =>input.substring(2,input.indexOf('>'));


// look into creating an interface Response that expose common methods
class KarmaResponse {
    constructor(bot,repository){
        this.bot = bot;
        this.repo = repository;

        this.pointsRegex = /<@([\w]+> [\+|\-]+)/g
    }

    canRespond(message){

        let matches =  message.text.match(this.pointsRegex)

        return matches != null && matches.length > 0
    }

    async respond (message){
        let matches =  message.text.match(this.pointsRegex)

        if (matches === null){
            return;
        }

        for (const match of matches){

            var data = match.split(' ');

            if ( data.length < 2){
                return;
            }

            let userId = getUserId(data[0]);
            let  points = data[1].trim();

            this.bot.postMessage(message.channel,"Wow " + userId + "+=" + count(points,"+") + "-=" + count(points,"-"));

             let user = await this.bot.getUserById(userId);

             if (user !== null){
                var pointsToAdd = count(points,'+') - count(points,'-');

                this.repo.addUserKarma(user.profile.email,pointsToAdd)

             }
        }

    }
    
}

module.exports = KarmaResponse;