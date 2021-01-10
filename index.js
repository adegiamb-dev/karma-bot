//https://github.com/slackapi/hubot-slack/issues/584#issuecomment-611808704

const KarmaService = require('./services/karma-service');
const AzureTableRepository = require('./repositories/azure-table-repository');
const { KARMA_ADD_STATUS } = require('./constants');

const SlackBot = require('./bots/slack-bot');

const dotenv = require('dotenv');
const { LinearRetryPolicyFilter } = require('azure-storage');

dotenv.config();

try {
  const bot = new SlackBot({});
  bot.connect();

  const karmaService = new KarmaService(new AzureTableRepository(), process.env.KARMA_DEFAULT_VALUE, process.env.KARMA_MAX_PER_REQUEST);

  bot.on('addKarma', async (bot, data) => {
    await karmaService.addKarma(bot, data);
  });

  bot.on('retrieveUserKarma', async (bot, data) => {
    await karmaService.getKarma(bot, data);
  });

  bot.on('onError', async (error) => {
    console.error(error);
  });
} catch (ex) {
  console.error(ex);
}
