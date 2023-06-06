require("dotenv").config()
const baseService = require("./baseService")
const expService = require("./experiments")

const _f = require("fetsch")
const { cache } = require("./baseService")

const course_fields = ["course_id", "course_code", "title", "description", "image", "active", "html"]

const qStudentCourses = "SELECT c.* FROM  \
student_course_xref as scx \
INNER JOIN courses c ON c.course_id=scx.course_id \
WHERE scx.student_id=? ;"

const qStudentCourse = "SELECT c.* FROM  \
student_course_xref as scx \
INNER JOIN courses c ON c.course_id=scx.course_id \
WHERE scx.student_id=? AND scx.course_id=? ;"

const qAllCourses = "SELECT c.* FROM courses c \
%join% \
%where% \
%groupby% \
%limit% \
;"

const qCourseRel = "INSERT INTO course_experiment_xref (course_id, experiment_id) VALUES(?,?);"
const qCourseExperiments = 
"SELECT e.* FROM  \
course_experiment_xref x INNER JOIN \
sescom_courses_dev.course_experiments e ON e.course_experiment_id = x.experiment_id \
%join% \
WHERE x.course_id = ? \
AND e.active='1' AND e.deleted='0' \
%where% \
%orderby% \
%limit% \
;"

const qDeleteCourse = "UPDATE courses SET deleted='1', active='0' WHERE course_id=?"
const qPurgeDeletedCourses = "DELETE FROM courses WHERE deleted='1' AND course_id IN(?)"

class CoursesService extends baseService{
    static async getStudentCourses( user_id){
        try{
            const items = await this.DB.query( qStudentCourses, [user_id] )
            if( Array.isArray(items) ){
                return items;
            } else {
                console.error("Error on fetching student courses. Expected array, got:", items)
                this.Error("Unknown database error")
            }
        } catch(e){
            this.Error("Error fetching user courses")
            return false
        }
    }

    /**
     * 
     * @param {integer} page 
     * @param {integer} perpage
     * @param {string} orderby field name to order by, e.g 'title'. TODO: allow multiple fields
     * @param {string} ordering ASC|DESC 
     * @param {string} filter  string for WHERE clause, e.g. 'c.title LIKE "%1314%"'
     */
    static async getAllCourses( page = 1, perpage = 10, orderby = "title", ordering = "ASC", filter ){
        try{

            // prepare filters
            const where = filter ? `WHERE active=1 AND ${filter}` : `WHERE active=1` // this is potential security hole, watch out!

            // prepare orderby
            ordering = ["ASC", "DESC", "asc", "desc"].includes(ordering) ? ordering : "ASC"
            // TODO: sanitize orderby value?
            const _orderby = `ORDER BY \`${orderby}\` ${ordering}`

            // prepare limit
            page = parseInt(page) || 1
            perpage = parseInt(perpage) || 10
            const limit = `LIMIT ${ (page - 1) * perpage }, ${perpage}`

            const [items] = await this.DB.query( 
                _f.strFormat(
                    qAllCourses,
                    {
                        "%where%" : where,
                        "%orderby%": _orderby,
                        "%limit%" : limit
                    }
                ))
            if( Array.isArray(items) ){
                return items;
            } else {
                console.error("Error fetching all courses. Expected array, got:", items)
                this.Error("Unknown database error")
            }
        } catch(e){
            console.error("Error fetching course list: ", e.message)
            this.Error("Error fetching course list")
            return false
        }
    }
    static async getStudentCourse( course_id, user_id ){
        try{
            const items = await this.DB.query( qStudentCourse, [user_id, course_id] )
            if( Array.isArray(items) && items[0] ){
                console.debug("Fetched course:", items )
                return items[0] ;
            } else {
                console.error("Course not purchased" )
                this.Error("You have not purchased this course")
                return false
            }
        } catch(e){
            console.error("Error fetching user's course: ", e.message )
            this.Error("Error fetching user's course")
            return false
        }
    }
    
    /**
     * Return single course by its id
     * @param {*} course_id 
     */
    static async getCourse( course_id ){
        try{
            const q = _f.strFormat(
                qAllCourses,
                {
                    "%where%" : "WHERE c.course_id=? AND c.active=1",
                    "%limit%" : "LIMIT 1"
                }
            )
            const [items] = await this.DB.query( q, [ course_id ] )
            if( Array.isArray(items) && items[0] ){
                return items[0] ;
            } else {
                console.error("Course not found. ID:", course_id)
                this.Error("Course not found")
                return false
            }
        } catch(e){
            console.error("Error fetching user's course: ", e.message )
            this.Error("Error fetching user's course")
            return false
        }
    }

    /**
     * Creates a new course and returns its id
     * @param {*} data 
     */
    static async addCourse( data ){

        // fetch only existing fields from passed data
        data = _f.only(course_fields, data )

    
    
        const prepared_query = _f.prepareStatement(data, "insert", "course_id", "courses" )
        if( prepared_query ){
            console.log("query:", prepared_query )
            try{
                const [result] = await this.DB.query(prepared_query.statement, prepared_query.values )
                if( result.affectedRows === 1 && result.insertId ){
                    // return true
                    return result.insertId
                } else {
                    console.error("Unexpected error, affectedRows not equals 1:", result )
                    this.Error("Unknown DB error while updating record")
                    return false
                }
            } catch(e){
                console.error("Error updating course. Data:", data, "query: ", prepared_query, ", error: ", e.message)
                this.Error("DB error while updating record")
                return false
            }
        } else {
            console.error("Data binding error in updateCourse. Data:", data, ", obtained result:", prepared_query)
            this.Error("Data binding error")
            return false
        }
    
    }

    /**
     * Marks the course with passed id as deleted. If course does not exist or error occured, returns false.
     * Use purgeCourse( id1, id2... ) to remove the courses that are marked as deleted from database.
     * @param {*} course_id 
     */
    static async deleteCourse( course_id ){
        // check if course exists 
        const course = this.getCourse( course_id )
        if( ! course ) return false 


        try{
            const [result] = await this.DB.query( qDeleteCourse, [course_id] )
            if( result.affectedRows === 1){
                return true
            } else {
                console.error("Unexpected error while deleting, affectedRows not equals 1:", result )
                this.Error("Unknown DB error while deleting course")
                return false
            }
        } catch(e){
            console.error("Error deleting course. ID:", course_id, ", error: ", e.message)
            this.Error("DB error while deleting record")
            return false
        }
    }

    /**
     * Deletes courses with passed IDs that are marked as deleted, from database.
     * Usage: purgeCourse( id1, [id2, id3,... ], id20... )
     * @param { string?|string[]? } args any number of arguments - strings or arrays of string - IDs of courses to purge.
     */
    static async purgeCourse(){
        let ids = Array.from( arguments )
        if( ids.length > 0 ){
            // 
            ids = ids.reduce( (r, id ) => Array.isArray(id) ? [...r, ...id] : [...r, id] , [] )

            try{
                const [result] = await this.DB.query( qPurgeDeletedCourses, ids )
                if( result.affectedRows > 0){
                    return true
                } else {
                    console.error("Unexpected error while deleting, affectedRows not greater than 0", result )
                    this.Error("Unknown DB error while purging courses")
                    return false
                }
            } catch(e){
                console.error("Error deleting courses. IDs:", ids, ", error: ", e.message)
                this.Error("DB error while purging records")
                return false
            }
        } else {
            console.error("No id passed to purgeCourse()")
            this.Error("No ID passed")
            return false
        }

    }


    /**
     * Updates course with passed data. course_id must be part of the data.
     * @param {object} data 
     */
    static async updateCourse( data ){

        // fetch only existing fields from passed data
        data = _f.only(course_fields, data )

        const {course_id} = data
        if( course_id ){
            const prepared_query = _f.prepareStatement(data, "upd", "course_id", "courses" )
            if( prepared_query ){
                console.log("query:", prepared_query )
                try{
                    const [result] = await this.DB.query(prepared_query.statement, prepared_query.values )
                    if( result.affectedRows === 1){
                        return true
                    } else {
                        console.error("Unexpected error, affectedRows not equals 1:", result )
                        this.Error("Unknown DB error while updating record")
                        return false
                    }
                } catch(e){
                    console.error("Error updating course. Data:", data, "query: ", prepared_query, ", error: ", e.message)
                    this.Error("DB error while updating record")
                    return false
                }
            } else {
                console.error("Data binding error in updateCourse. Data:", data, ", obtained result:", prepared_query)
                this.Error("Data binding error")
                return false
            }
        } else {
            console.error("Course ID was not specified. Received data:", data )
            this.Error("Course ID not specified in received data")
            return false
        }
    }

    static async addCourseExperiment( course_id, data ){
        try{
            const exp_id = await expService.addExperiment( data )
            if( exp_id ){
                // add course relation
                const [result] = await this.DB.query( qCourseRel, [course_id, exp_id ] )
                if( result.affectedRows === 1 ){
                    return exp_id
                } else {
                    // roll back experiment
                    // TODO: check if this actually happened... oh well.
                    await expService.deleteExperiment(exp_id) 
                    await expService.purge(exp_id)
                    console.error("Error adding course-experiment relation. Expected 1 affected row, got:", result ,". Experiment was not added")
                    this.Error("Error adding experimet to course")
                    return false
                }
            } else {
                this.Error(expService.error )
                return false
            }

        } catch(e){
            console.error("Error adding experiment", e.message)
            this.Error("Error adding experiment")
        }
    }

    /**
     * Wrapper for ExperimentService.deleteExperiment()
     * @param {*} id 
     */
    static async deleteExperiment( id ){
        const result = await expService.deleteExperiment(id)
        if( !result )
            this.Error(expService.error )
        return result
    }
    
    /**
     * Wrapper for ExperimentService.purge()
     * @param {*} id 
     */
    static async purgeExperiments(){
        const result = await expService.purge( Array.from(arguments) )
        if( !result )
            this.Error(expService.error )
        return result
    }

    static async getCourseExperiments( id ){
        return await this.getRecords( qCourseExperiments, [id] , "Course experiments" )
    }
}

baseService.extend(CoursesService)


module.exports = CoursesService