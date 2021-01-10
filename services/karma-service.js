const { KARMA_ADD_STATUS } = require('../constants');

class KarmaService {
  constructor(repository, defaultKarma, maxPointsPerRequest) {
    this.repo = repository;
    this.defaultKarma = defaultKarma;
    this.maxPointsPerRequest = Number(maxPointsPerRequest);
  }

  async addKarma(bot, model) {
    let userKarma = await this.repo.getKarma(bot.clientApp, model.email);

    if (model.userId === model.requestUserId) {
      model.karmaStatus = KARMA_ADD_STATUS.FAILURE_SELF_KARMA;
    }

    let existingKarma = 0;

    if (userKarma != null) {
      existingKarma = userKarma.karma;
    } else {
      existingKarma = this.defaultKarma;
      model.karmaStatus = KARMA_ADD_STATUS.SUCCESS_INITIAL;
    }

    let karmaToAdd = model.karma;

    if (Math.abs(karmaToAdd) - this.maxPointsPerRequest > 0) {
      karmaToAdd = Math.sign(karmaToAdd) === -1 ? this.maxPointsPerRequest * -1 : this.maxPointsPerRequest;
    }

    let newKarma = existingKarma + karmaToAdd;

    let karmaSet = await this.repo.setKarma(bot.clientApp, model.email, newKarma);

    if (karmaSet) {
      if (!model.karmaStatus) {
        model.karmaStatus = newKarma > existingKarma ? KARMA_ADD_STATUS.SUCCESS_UP : KARMA_ADD_STATUS.SUCCESS_DOWN;
      }
      model.karma = newKarma;
    } else {
      model.karmaStatus = KARMA_ADD_STATUS.FAILURE;
    }

    bot.karmaAdded(model);
  }
}

module.exports = KarmaService;
