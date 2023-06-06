// MOCHA TEST
const Service = require("../services/experiments")

var assert = require('assert');
// var uniqid = require( 'uniqid');
let newId = null, expDeleted = false

describe('Add experiment, delete experimet, purge it from database', function () {
    it('should return a positive ID of newly inserted experiment', async function () {
    //   assert.equal([1, 2, 3].indexOf(4), -1);
        newId = await  Service.addExperiment( {title: "New experiment" })
        assert.notStrictEqual( newId , false, Service.error ) ;
        console.log( "New ID:", newId )
    });

    describe('Work with created experiment', function () {
        
        before( () => newId )

        
            it('should mark experiment deleted and return true', async function () {
            //   assert.equal([1, 2, 3].indexOf(4), -1);
                const deleted = await  Service.deleteExperiment( newId)
                assert.strictEqual( deleted, true ) ;
                expDeleted = true    
                
                
                
            });
            // });
    
            // remove course from DB
            describe('Delete experiment from DB', function () {
                before( () => expDeleted )

                it('should delete the course and return true', async function () {
                    const deleted = await Service.purge( newId )
                    assert.notStrictEqual( deleted, false, Service.error ) ;
                    
                });
            });
            
    
                
        // }
    });

    // close DB connection
    after(() => { Service.DB.end() })
});