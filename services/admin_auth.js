const baseService = require("./baseService")
const UserService = require("./users")
const AuthService = require("./auth")
const UserAuth = require("@skng/auth/user-auth")


class AdminAuthService extends baseService{


    static async login( login, password ){
        const result = await UserService.loginAdmin(login, password)
        if( !result )
            this.Error(UserService.error)
            
        return result
        
    }    

    static async renewToken(token){
        return await  AuthService.model.renewToken(token)
    }
   
    static async logout( token ){        
        return await AuthService.logout(token)        
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
    static async adminTokenMiddleware(req, res, next){

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

                    // check if user is admin
                    if( Array.isArray(user.credentials) && user.credentials.includes("admin") ){
                        req.user = user
                        next();
                    } else {
                        res.status(403).send( "You don't have credentials for this" )    
                    }

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


    
}

baseService.extend(AdminAuthService)


module.exports = AdminAuthService