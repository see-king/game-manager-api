const router = require("express").Router()
const AuthService = require("../../services/auth")

// after this point only authorized users are allowed
router.use( AuthService.tokenMiddleware )

router.post("/renew", async (req, res) => {
    
    const {token} = req
    console.debug( "Renewing token:", token)
    const newToken = await AuthService.model.renewToken( token )
    if( newToken ){
        res.json( {token: newToken} )
    } else {    
        res.status(401).send(Service.error)
    }
})


module.exports = router