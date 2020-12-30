const azure = require('azure-storage');
class AzureTableRepository {
   

    constructor(clientApp) {
        this.tableService = azure.createTableService();
        this.clientApp = clientApp;
    
        this.tableName = "karma";

        this.tableService.createTableIfNotExists(this.tableName, (error,result,response) =>{
            if (error){
                throw new Error("Failed to create table:" + response);
            }
            
            console.debug(`Table created:${result.created}`);
        });
    }


    getKarma = async (email) => {
        return new Promise((resolve,reject) =>{
            let promiseHandler = (err, result) => {
                if (err) {
                    if (err.statusCode === 404){
                        resolve(null);
                    }else{
                        reject(err);
                    }                    
                } else {
                    resolve({
                        karma:result.karma._,
                        email:result.RowKey._,
                    });
                }
            };

            this.tableService.retrieveEntity(this.tableName,email,this.clientApp,promiseHandler);

        });
    }

    setKarma = async (email,karma) =>{
        return new Promise (async (resolve,reject) =>{
            let promiseHandler = (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            };

            let task = {
                PartitionKey: email,
                RowKey: this.clientApp,
                karma,
            };

            this.tableService.insertOrReplaceEntity('karma',task,promiseHandler);
        });
    }
}


module.exports = AzureTableRepository;