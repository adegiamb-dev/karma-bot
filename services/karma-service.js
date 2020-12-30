// look into creating an interface Response that expose common methods
class KarmaService {
  constructor(repository, defaultKarma) {
    this.repo = repository;
    this.defaultKarma = defaultKarma;
  }

  async addKarma(bot, model) {
    let userKarma = await this.repo.getKarma(model.email);

    let existingKarma = userKarma != null ? userKarma.karma : this.defaultKarma;
    let newKarma = existingKarma + model.karma;

    let karmaSet = await this.repo.setKarma(model.email, newKarma);

    if (karmaSet) {
      model.karma = newKarma;
      bot.karmaAdded(model);
    }
  }
}

module.exports = KarmaService;
