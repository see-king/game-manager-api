const router = require("express").Router()
const Service = require("../../services/admin_auth")
// const UserService = require("../../services/users")
const AuthService = require("../../services/auth")




router.post("/login", async (req, res) => {

    const {login, password} = req.body

    const userdata = await Service.login(login, password)
    console.log( "Received token:", userdata)
    if( userdata ){
        res.json(userdata)
    } else {    
        res.status(401).send(Service.error)
    }
}
)


router.post("/register", async (req, res) => {

    const {name, email, password} = req.body

    const result = await Service.register({name, email, password})
    console.log("Received result:", result)
    if( result ){
        res.send( "OK" )
    } else {
        res.status(400).send(Service.error)
    }
})

router.post("/logout", async (req, res) => {
    const result = await Service.logout(req.token)
    if( result ){
        res.send("User logged out")
    } else {
        res.status(500).send("Error logging out")
    }    
})

// router.use( AuthService.tokenMiddleware)


module.exports = router