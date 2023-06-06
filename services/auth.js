const baseService = require("./baseService")
const UserService = require("./users")
const joi = require("@hapi/joi")

const AUTH = require("@skng/auth")
const Auth = new AUTH({
    verification: {
        user: joi.object({
            email: joi.string().email().required(),
            password: joi.string().min(6).required(),
            name: joi.string().min(1).required()
        })
    }
})

class AuthService extends baseService{
    
    static async verify( token ){
        const result = await Auth.verifyToken(token)
        if( !result){
            console.error("Token verification failed: ", Auth.error)
            this.Error(Auth.error)
        }
        return result
    }

    /**
     * Router middleware to validate authorization token and store its data in request object.
     * Stores token as req.token
     * Stores 
     * Usage: router.use( AuthService.tokenMiddleware ); 
     * -- all routes after this will only be available if valid token was sent within the request.
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static async tokenMiddleware(req, res, next){

        // const token = req.body.token || req.query.token
        const authHeader = req.headers.authorization
        const token =  authHeader && authHeader.split(" ")[0] === "Bearer" ? authHeader.split(" ")[1] : false

        
        // if( auth. ){}
        console.log( "using token", token )
        if( token ){
            try{
                // validate token
                const decoded = await AuthService.verify(token)
                console.debug("Decoded token: ", decoded)
                if( decoded ){
                    // store token and user in request
                    req.token = token                
                    // fetch user
                    const user = await UserService.get(decoded.userId)
                    req.user = user
                    // console.debug("User is:", user)
        
                    next();
                } else {
                    res.status(401).send(AuthService.error || UserService.error )
                }
            } catch(e){
                console.error(e.message)
                res.status(500).send("Unknown authorization error")
            }
    
        } else {
            res.status(403).send("Access denied")
        }
    }

    static async logout(token){
        try{
            await Auth.logout(token)
            return true
        } catch(e){
            console.error("Error logging out:", e.message )
            return false
        }
    }
    
}

baseService.extend(AuthService)


module.exports = AuthService

module.exports.model = Auth