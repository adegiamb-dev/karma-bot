//https://github.com/slackapi/hubot-slack/issues/584#issuecomment-611808704
const Bot = require('slackbots');
const countBy = require('lodash/countBy');
const EventEmitter = require('events').EventEmitter;

const getUserId = (input) => input.substring(2, input.indexOf('>'));
const count = (str, ch) => countBy(str)[ch] || 0;

class SlackBot extends EventEmitter {
  #bot;
  #token;
  #pointsRegex;

  constructor(options) {
    super(options);
    this.#token = process.env.SLACK_BOT_TOKEN;
    this.name = process.env.BOT_NAME;
    this.#pointsRegex = /<@([\w]+> [\+|\-]+)/g;

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
    return this.#bot.postMessage(model.requestData.channel, `<@${model.userId}> has ${model.karma} karma point(s).`);
  }

  #canRespond = (message) => {
    let matches = message.text.match(this.#pointsRegex);

    return matches != null && matches.length > 0;
  };

  #onStart = () => {
    const params = {
      icon_emoji: ':robot_face:',
    };

    this.#bot.postMessageToChannel('building-bots', 'The ones you judge today, may be the judgments you endure tomorrow.', params);
  };

  #onMessage = async (data) => {
    if (data.type === 'message') {
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
          let points = dataParts[1].trim();

          let user = await this.#bot.getUserById(userId);

          if (user !== null) {
            var model = {
              email: user.profile.email,
              userId: user.id,
              karma: count(points, '+') - count(points, '-'),
              requestData: data,
            };

            this.emit('addKarma', this, model);
          }
        }
      }
    }
  };
}

module.exports = SlackBot;
