const azure = require('azure-storage');
class AzureTableRepository {
  constructor() {
    this.tableService = azure.createTableService();
    this.tableName = 'karma';

    this.tableService.createTableIfNotExists(this.tableName, (error, result, response) => {
      if (error) {
        throw new Error('Failed to create table:' + response);
      }

      console.debug(`Table created:${result.created}`);
    });
  }

  getKarma = async (clientApp, email) => {
    return new Promise((resolve, reject) => {
      let promiseHandler = (err, result) => {
        if (err) {
          if (err.statusCode === 404) {
            resolve(null);
          } else {
            reject(err);
          }
        } else {
          resolve({
            karma: result.karma._,
            email: result.PartitionKey._,
          });
        }
      };

      this.tableService.retrieveEntity(this.tableName, email, clientApp, promiseHandler);
    });
  };

  async setKarma(clientApp, email, karma) {
    return new Promise(async (resolve, reject) => {
      let promiseHandler = (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      };

      let task = {
        PartitionKey: email,
        RowKey: clientApp,
        karma,
      };

      this.tableService.insertOrReplaceEntity(this.tableName, task, promiseHandler);
    });
  }
}

module.exports = AzureTableRepository;
