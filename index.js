//https://github.com/slackapi/hubot-slack/issues/584#issuecomment-611808704

const KarmaService = require('./services/karma-service');
const AzureTableRepository = require('./repositories/azure-table-repository');

const SlackBot = require('./bots/slack-bot');

const dotenv = require('dotenv');

dotenv.config();

const bot = new SlackBot({});
bot.connect();

const karmaService = new KarmaService(new AzureTableRepository('slack'), process.env.KARMA_DEFAULT_VALUE);

bot.on('addKarma', async (bot, data) => {
  await karmaService.addKarma(bot, data);
});

bot.on('onError', async (error) => {
  console.error(error);
});
