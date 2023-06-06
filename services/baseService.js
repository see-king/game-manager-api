const db = require("../db/remote")
const _f = require("fetsch")

class baseService {
    
    static cache( index, value){
        this._CACHE[index] = value
    }

    /**
     * Returns a copy of cached value or passed default value
     * @param {string} index index of value in cache
     * @param {*} defaultValue default value
     * @returns {*|null} returns fetched value if index found, default value or null if not found.
     */
    static getCached (index, defaultValue ){ return this.cacheExists(index) ? this.Copy( this._CACHE[index] ) : defaultValue}

    static cacheExists(index) { return this._CACHE.hasOwnProperty(index)}

    static clearCache( index ) { 
        if( index ) {
            if( this.cacheExists(index) ){
                delete this._CACHE[index]
                return true
            } else {
                this.Error(`Cache index "${index}" does not exist, nothing to clear`)
                return false
            }
        } else {
            this._CACHE = {}             
            return true
        }
    }


    static Copy( x ){
        return JSON.parse( JSON.stringify(x) );
    }

    static printCache(){ console.debug( "\n\n\nCache:\n", this._CACHE) }
    
    static Error( message ){ this.error = message }

    static extend( ancestor ) {
        Object.assign( ancestor, this )
    }


    static async getRecords( query, data = null , entityName = "records", parseData = {} ){
        try {

            // parse the placeholders
            query = _f.strFormat( query, parseData )

            const [items] = await this.DB.query( query, data )
            if( Array.isArray(items) ){
                return items;
            } else {
                console.error(`Error retreiving ${entityName}`)
            }
        } catch(e) {
            const err = `Error retrieving ${entityName}`
            console.error( err + ":", e.message )
            this.Error(err)
        }
    }

    static async updateValue( table, idFields, data ){
        const q = _f.prepareStatement(data, "upd", idFields, table )
        console.debug(q)
        // TODO: get previous value
        // TODO: update record
        // TODO: store change record to DB 
        // TODO: ?? maybe do the last two in one transaction? Would be logical ?? 
        

    }

     /**
     * Throws an error. If local error type is defined, it will be thrown, otherwise a generic error is thrown.
     * @param {*} errorText
     */
    static Throw(errorText, messageToLog) {
        if (messageToLog) console.error(messageToLog);
        throw new (this.localErrorClass ? this.localErrorClass : Error)(errorText);
    }

}

class BaseServiceError extends Error {
    errorCode;
    
    constructor(message, errorCode = 400)     {
      super(message);
      this.name = "BaseServiceError";
      this.errorCode = errorCode;
    }
  }
  

baseService.error = null
baseService._CACHE = {}
baseService.DB = db 
baseService.localErrorClass = BaseServiceError;

module.exports = baseService