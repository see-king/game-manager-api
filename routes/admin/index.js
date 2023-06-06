const router = require("express").Router()
const Service = require("../../services/admin_auth");
const DbService = require("../../services/db-service");
const { executeAsyncRoute } = require("../../utils/functions");


// store db

router.post("/db", (req, res) => {
    const {db} = req.body;

    executeAsyncRoute( res, async () => {
        if( typeof db !== "object") throw new Error("Wrong type of data passed. Expected object, got " + typeof db );

        return json( await DbService.update(db) )
    })

})

router.get("/db", (req, res) => {
    
    executeAsyncRoute( res, async () => {
        return res.json( await DbService.getAll())
    })

})


// after this point, only user with admin credentials is allowed
router.use( Service.adminTokenMiddleware )


module.exports = router