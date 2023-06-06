require("dotenv").config()
const baseService = require("./baseService")

const _f = require("fetsch")

const experiment_fields = ["course_experiment_id", "title", "description", "html", "active"]

const qCourseExperients = "";
const qDelete = "UPDATE course_experiments SET deleted='1', active='0' WHERE course_experiment_id=?"
const qPurge = "DELETE FROM course_experiments WHERE deleted='1' AND course_experiment_id IN(%ids%)"
const qGetAll = "SELECT e.* from course_experiments as e %join% %where% %orderby% %limit%"
const qGetOne = "SELECT e.* from course_experiments as e WHERE deleted='0' AND course_experiment_id=?"

class ExperimentsService extends baseService {
    static async getCourseExperiments(course_id) {
        try {
            const items = await this.DB.query(qCourseExperients, [course_id])
            if (Array.isArray(items)) {
                return items;
            } else {
                console.error("Error on fetching course experiments. Expected array, got:", items)
                this.Error("Unknown database error")
            }
        } catch (e) {
            this.Error("Error fetching course experiments")
            return false
        }
    }


    static async addExperiment(data) {
        // fetch only existing fields from passed data
        data = _f.only(experiment_fields, data)
        console.log("Data:", data)

        const prepared_query = _f.prepareStatement(data, "insert", "course_experiment_id", "course_experiments")
        if (prepared_query) {
            console.log("query:", prepared_query)
            try {
                const [result] = await this.DB.query(prepared_query.statement, prepared_query.values)
                if (result.affectedRows === 1 && result.insertId) {
                    // return true
                    return result.insertId
                } else {
                    console.error("Unexpected error, affectedRows not equals 1:", result)
                    this.Error("Unknown DB error while adding experiment")
                    return false
                }
            } catch (e) {
                console.error("Error inserting experiment. Data:", data, "query: ", prepared_query, ", error: ", e.message)
                this.Error("DB error while inserting record")
                return false
            }
        } else {
            console.error("Data binding error in addCourse. Data:", data, ", obtained result:", prepared_query)
            this.Error("Data binding error")
            return false
        }
    }

    static async getExperiment(id){
        try{
            const q = _f.strFormat(
                qGetAll,
                {
                    "%where%" : "WHERE e.course_experiment_id=? AND e.active=1 AND e.deleted='0'",
                    "%limit%" : "LIMIT 1"
                }
            )
            const [items] = await this.DB.query( q, [ id ] )
            if( Array.isArray(items) && items[0] ){
                return items[0] ;
            } else {
                console.error("Experiment not found. ID:", id)
                this.Error("Experiment not found")
                return false
            }
        } catch(e){
            console.error("Error fetching Experiment: ", e.message )
            this.Error("Error fetching Experiment")
            return false
        }
    }

    static async purge(){
        let ids = Array.from( arguments )
        if( ids.length > 0 ){
            // 
            ids = ids.reduce( (r, id ) => Array.isArray(id) ? [...r, ...id] : [...r, id] , [] )
            const q = _f.strFormat(
                qPurge, 
                { "%ids%": ids } 
            )
            console.debug(q)
            try{
                const [result] = await this.DB.query( 
                    q
                    )
                if( result.affectedRows > 0){
                    return result.affectedRows
                } else {
                    console.error("Unexpected error while purging experiments, affectedRows not greater than 0", result )
                    this.Error("Unknown DB error while purging experiments")
                    return false
                }
            } catch(e){
                console.error("Error purging experiments. IDs:", ids, ", error: ", e.message)
                this.Error("DB error while purging records")
                return false
            }
        } else {
            console.error("No id passed to purge()")
            this.Error("No ID passed")
            return false
        }

    }

    static async deleteExperiment( id ){
         // check if experiment exists 
         const course = this.getExperiment( id )
         if( ! course ) return false 
 
 
         try{
             const [result] = await this.DB.query( qDelete, [id] )
             if( result.affectedRows === 1){
                 return true
             } else {
                 console.error("Unexpected error while deleting, affectedRows not equals 1:", result )
                 this.Error("Unknown DB error while deleting course")
                 return false
             }
         } catch(e){
             console.error("Error deleting course. ID:", id, ", error: ", e.message)
             this.Error("DB error while deleting record")
             return false
         }
    }
}

baseService.extend(ExperimentsService)


module.exports = ExperimentsService