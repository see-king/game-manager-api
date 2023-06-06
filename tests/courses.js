// MOCHA TEST
const Service = require("../services/courses")

var assert = require('assert');
var uniqid = require( 'uniqid');
let newId, expID1, expID2, courseDeleted = false, expRetrieved = false

describe('Add course, delete course, purge it from database', function ( allDone ) {
    it('should return a positive ID of newly inserted course', async function () {
    //   assert.equal([1, 2, 3].indexOf(4), -1);
        newId = await  Service.addCourse({title: "New course", course_code: uniqid() })
        assert.notStrictEqual( newId , false, "Error deleting?" ) ;
        console.log( "New ID:", newId )
    });

    describe('Check course functions', function () {
        before( () => newId )


        // if( newId ){
    
            // describe('Add experiments', function () {
            //     // Add experiments to the course
            it( "shoud add a new experiment to the course and return its id", async () => {

                expID1 = await Service.addCourseExperiment( newId, {title: "Some experiment 1"} )
                expID2 = await Service.addCourseExperiment( newId, {title: "Some experiment 2"} )
                assert.notStrictEqual( expID1, false )
                assert.notStrictEqual( expID2, false )
            })
    
            describe('Retrieve created experiments as course-related', function () {
                before( () => expID1 && expID2 )

                it("Should return an array of objects", async function(){

                    const items = await Service.getCourseExperiments( newId )
                    console.log( " Retrieved courses:" , items )
                    const res = Array.isArray(items) && items.length === 2
                    assert.strictEqual( res  , true )
                    expRetrieved = true
                });

            });
    
            // mark course as deleted
            describe('Mark course as deleted', function () {
                before( () => expID1 && expID2 && expRetrieved )

                it('should delete and purge experiments' , async function () {
                    console.debug("Exp ids:", expID1, expID2, "course ID: ", newId)
                    const deleted1 = await Service.deleteExperiment( expID1 )
                    const deleted2 = await Service.deleteExperiment( expID2 )
                    assert.strictEqual( deleted1, true, Service.error ) ;
                    assert.strictEqual( deleted2, true, Service.error ) ;
                    
                    const purged = await Service.purgeExperiments ( expID1, expID2 )
                    assert.notStrictEqual( purged, false, Service.error ) ;                   
                    
                });

                it('should mark course deleted and return true', async function () {
                //   assert.equal([1, 2, 3].indexOf(4), -1);
                    const deleted = await  Service.deleteCourse( newId)
                    assert.strictEqual( deleted, true ) ;
                    courseDeleted = true    
                    
                });
            });

            // remove course from DB
            describe('Purge course from DB', function () {
                before( () => courseDeleted )

                it('should delete the course and return true', async function () {
                    console.log("deleting course from DB...")
                    const deleted = await Service.purgeCourse( newId)
                    assert.strictEqual( deleted, true ) ;
                    
                });
            });
            // });
    
            
    
                
        // }
    });
    
    // after(() => console.log("End"))
    // close DB connection
    after( () => Service.DB.end()  )
    

});