
//https://github.com/slackapi/hubot-slack/issues/584#issuecomment-611808704
const SlackBot = require('slackbots');
const KarmaResponse = require('./responses/karma-response');
const AzureTableRepository = require('./repositories/azure-table-repository');

const dotenv = require('dotenv')

dotenv.config()

const bot = new SlackBot({
    token: `${process.env.BOT_TOKEN}`, 
    name:'karmabot',
})

const karmaResponse = new KarmaResponse(bot, new AzureTableRepository('slack'));


bot.on('start', () => {
    const params = {
        icon_emoji: ':robot_face:'
    }

    bot.postMessageToChannel(
        'building-bots',
        'The ones you judge today, may be the judgments you endure tomorrow.',
        params
    );
});



bot.on('error',(err) =>{
    console.error(err);
})

bot.on('message',(data)=>{

    if (data.type === 'message'){
        if (karmaResponse.canRespond(data)){
            karmaResponse.respond(data);
        }
    }

    if (data.type === 'message.im'){
        console.log("direct message")
    }
    
});