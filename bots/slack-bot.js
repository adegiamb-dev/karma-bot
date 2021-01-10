//https://github.com/slackapi/hubot-slack/issues/584#issuecomment-611808704
const Bot = require('slackbots');
const countBy = require('lodash/countBy');
const EventEmitter = require('events').EventEmitter;
const { KARMA_ADD_STATUS, KARMA_GET_STATUS } = require('../constants');

const getUserId = (input) => input.substring(2, input.indexOf('>'));
const count = (str, ch) => countBy(str)[ch] || 0;

class SlackBot extends EventEmitter {
  #bot;
  #token;
  #pointsRegex;

  constructor(options) {
    super(options);
    this.#token = process.env.SLACK_BOT_TOKEN;
    this.#pointsRegex = /(<@[\w]+>) (\+{2,}|\-{2,})/g;

    this.clientApp = Object.freeze('slack');
    this.name = process.env.BOT_NAME;

    console.assert(this.#token, 'token must be defined.');
    console.assert(this.name, 'the bot must have a name.');

    this.#bot = new Bot({
      token: this.#token,
      name: this.name,
      disconnect: true,
    });
  }

  async connect() {
    this.#bot.on('start', this.#onStart);
    this.#bot.on('message', this.#onMessage);
    this.#bot.on('error', (err) => this.emit('onError', err));

    this.#bot.login();
  }

  async karmaAdded(model) {
    let message = '';

    switch (model.karmaStatus) {
      case KARMA_ADD_STATUS.SUCCESS_UP:
        message = `<@${model.userId}> nice your karma is now ${model.karma}. :)`;
        break;
      case KARMA_ADD_STATUS.SUCCESS_DOWN:
        message = `<@${model.userId}> oh no what happen your karma is now ${model.karma}. :(`;
        break;
      case KARMA_ADD_STATUS.FAILURE_SELF_KARMA:
        message = `<@${model.userId}> wow you can not play with your own karma.`;
        break;
      case KARMA_ADD_STATUS.SUCCESS_INITIAL:
        message = `<@${model.userId}> nice your first ${model.karma}. We added some extra karma.  `;
        break;
      default:
        message = `<@${model.userId}> talk to your admin something is up with your karma tracking.`;
        break;
    }

    return this.#bot.postMessage(model.requestData.channel, message);
  }
  async displayKarma(model) {
    let message = '';
    switch (model.karmaStatus) {
      case KARMA_GET_STATUS.SUCCESSFUL:
        message = `<@${model.userId}> has ${model.karma} karma.`;
        break;
      default:
        message = `<@${model.userId}> has 0 karma.  Let's help change that :).`;
        break;
    }

    return this.#bot.postMessage(model.requestData.channel, message);
  }

  #canRespond = (message) => {
    let matches = message.text.match(this.#pointsRegex);

    return matches != null && matches.length > 0;
  };

  #onStart = () => {
    //todo look into how not use the arrow function
    const params = {
      icon_emoji: ':robot_face:',
    };

    this.#bot.postMessageToChannel('building-bots', 'The ones you judge today, may be the judgments you endure tomorrow.', params);
  };

  #onMessage = async (data) => {
    if (data.type === 'message') {
      if (this.#isCommand(data.text)) {
        this.#processCommand(data);

        return;
      }

      if (this.#canRespond(data)) {
        let matches = data.text.match(this.#pointsRegex);

        if (matches === null) {
          return;
        }

        for (const match of matches) {
          var dataParts = match.split(' ');

          if (dataParts.length < 2) {
            return;
          }

          let userId = getUserId(dataParts[0]);
          let points = dataParts[1].trim().substring(1); //remove on character to get the current value of karma to add.

          let user = await this.#bot.getUserById(userId);

          if (user !== null) {
            var model = {
              email: user.profile.email,
              userId: user.id,
              requestUserId: data.user,
              karma: count(points, '+') - count(points, '-'),
              requestData: data,
            };

            this.emit('addKarma', this, model);
          }
        }
      }
    }
  };

  #isCommand = (text) => {
    return text.startsWith(`<@${this.#bot.self.id}>`);
  };

  #processCommand = async (request) => {
    var commandInput = request.text.replace(`<@${this.#bot.self.id}>`, '').trim();

    var params = commandInput.split(' ');

    if (params.length) {
      var command = params[0];

      switch (command.toLowerCase()) {
        case 'karma':
          this.#processGetKarma(params, request);
          break;
        case 'top':
          console.log('get top');
          break;
        default:
          console.log('bad command');
          break;
      }
    }
  };

  #processGetKarma = async (params, request) => {
    var userId = params.length == 1 ? request.user : this.#convertToId(params[1]);

    let user = await this.#bot.getUserById(userId);

    if (user === null) {
      console.log('user not found.');
    }

    this.emit('retrieveUserKarma', this, {
      userId,
      email: user.profile.email,
      requestData: request,
    });
  };

  #convertToId = (input) => {
    return input.substring(2, input.length - 1);
  };
}

module.exports = SlackBot;
