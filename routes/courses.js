const router = require("express").Router()
const AuthService = require("../services/auth")
const Service = require("../services/courses")


router.use( AuthService.tokenMiddleware )


router.get("/student-courses", async (req, res) => {

    const {user} = req 
    // res.json({user})
    
    if( typeof user ==="object" && user.id ){
        const [result] = await Service.getStudentCourses( user.id )
        if( result ){
            res.json(result)
        } else {
            res.status(400).send(Service.error )
        }
    } else {
        res.sendStatus(404)
    }
})

router.get("/course/:id", async (req, res) => {

    const {user} = req 
    const {id} = req.params
    // res.json({user})
    
    if( typeof user ==="object" && user.id ){
        const [result] = await Service.getStudentCourse( id, user.id )
        if( result ){
            res.json(result)
        } else {
            console.log( Service.error )
            res.status(403).send( Service.error )
        }
    } else {
        res.sendStatus(404)
    }
})



// router.post("/login", async (req, res) => {
//     res.send("login")
// })

// router.post("/logout", async (req, res) => {
//     res.send("logout")
// })


module.exports = router