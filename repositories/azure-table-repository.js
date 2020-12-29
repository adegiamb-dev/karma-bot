const azure = require('azure-storage');

class AzureTableRepository {

    constructor(clientApp) {
        this.tableService = azure.createTableService();
        this.clientApp = clientApp;


        this.tableService.createTableIfNotExists("karma", (error,result,response) =>{
            if (error){
                throw new Error("Failed to create table:" + response);
            }
            
            console.debug(`Table created:${result.created}`);
        });
    }


    getUserKarma = (email) => {
 
    }

    addUserKarma = (email,points) =>{
        
            this.tableService.retrieveEntity('karma',email,this.clientApp, (error,existingKarma) =>{

                //todo need add check for error

                let existingPoints = existingKarma != null ? existingKarma.points._ : 0;
                let totalPoints = existingPoints + points;

                let entityGen = azure.TableUtilities.entityGenerator;
                let task = {
                    PartitionKey: entityGen.String(email),
                    RowKey: entityGen.String(this.clientApp),
                    points: totalPoints,
                };

                this.tableService.insertOrReplaceEntity('karma',task,function(error,result){
                });
            })
         
    }
}

module.exports = AzureTableRepository;