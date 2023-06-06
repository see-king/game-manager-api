const baseService = require("./baseService");
/**
 * mockup database service that stores data in variables while the server is running
 */




class DbService extends baseService{

    data = {}
    backups = []

    maxBackups = 10;

    static async update( data ){
        await this.backup();
        this.data = data;
        return true;
    }


    static async getAll(){
        return this.data;
    }

    static async get( field ){
        if( !this.data[field] ) return this.Throw("Field not found: " + field)
        return this.data[field];
    }

    /**
     * store current state of db as a backup
     */
    static async backup(){
        console.debug("backing up current data")
        const current = JSON.stringify(this.data);
        const currentDate = new Date();
        const timestamp = currentDate. getTime()

        this.backups = [...this.backups, {
            timestamp,
            data: JSON.parse(current)
        }];
        if( this.backups.length > this.maxBackups){
            console.debug("Max backup size is reached, removing record with timestamp", this.backups[0].timestamp);
            // cut off the eariest backup
            this.backups.splice(0, 1);
        }
        return true;
    }
}

baseService.extend(DbService);

module.exports = DbService;