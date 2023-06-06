const baseService = require("./baseService")
const _f = require("fetsch")

const joi = require("@hapi/joi")

const AUTH = require("@skng/auth")
const Auth = new AUTH({
    verification: {
        user: joi.object({
            email: joi.string().email().required(),
            password: joi.string().min(6).required(),
            name: joi.string().min(1).required(),
            fb_id: joi.string(),
            google_id: joi.string()
        })
    }
})


const qUsers = 
"SELECT %fields% \
FROM `users` as u \
LEFT JOIN \
(SELECT ucx.user_id, cc.* FROM `user_credential_xref` as ucx \
INNER JOIN `user_credentials` as cc ON cc.credential_id=ucx.credential_id \
    ) as c ON u.id=c.user_id \
%join% \
WHERE %where% \
%groupby% \
%orderby% \
%limit%";

const defaultFields = "u.id, u.name, u.email, u.fb_id, u.google_id, JSON_ARRAYAGG(c.credential_id) as credentials, JSON_ARRAYAGG(c.title) as credential_titles "

const qAddCredentials = 'INSERT INTO user_credential_xref (user_id, credential_id) VALUES(?, ?)' 
const qRemoveCredentials = 'DELETE FROM user_credential_xref WHERE user_id=? AND credential_id=?' 

const qDeleteUser = "DELETE FROM users WHERE id=?"

class UsersService extends baseService{

    static async registerStudent( userData ){
        const newUserId = await Auth.register(userData)
        if( newUserId ){
            // add student credentials
            const credentialsAdded = await this.addCredentials( newUserId, "student" )
            if( credentialsAdded ){
                return newUserId
            } else {
                // delete the created user and return error
                const deleted = await this.delete(newUserId)
                if( deleted ){
                    this.Error("Error assigning credentials, please try registering again")
                    return false
                } else {
                    this.Error("User was created but hasn't received the right credentials, please contact site administration")
                    return false
                }
            }

        } else {
            this.Error( Auth.error )
            return false
        }
    }

    /**
     * Get single user by id
     * @param {*} id 
     */
    static async get( id ){
        const userid = `user_${id}`

        if( !this.cacheExists(userid)){

            try{
                const q = _f.strFormat(
                    qUsers, 
                    {
                        "%fields%" :  defaultFields,
                        "%where%": "u.id=? AND u.id IS NOT NULL AND active='1'",
                        "%limit%": "LIMIT 1",
                        "%groupby%": "GROUP BY u.id"
                    }
                )
    
                // console.debug(q)
                const [users] = await this.DB.query(
                    q,
                    [id]
                )
    
                if( Array.isArray(users) && users.length > 0){
                    // array is received, fetch first element and cache it
                    this.cache(userid, users[0] )
                    // return cached
                    return this.getCached(userid) 

                } else {
                    // no array or empty array is received
                    this.Error("User not found")
                    return false
                }
            } catch(e){
                console.error("Error fetching single user: ", e.message )
                this.Error("Database error")
                return false;
            }
        } else {
            return this.getCached(userid)
        }
    }

    static async addCredentials( user_id, credentials_id ){
        try{            
            const [result] = await this.DB.query( qAddCredentials, [user_id, credentials_id] )
            if( result && result.affectedRows === 1 ){
                return true
            } else {
                this.Error("Unknown DB error while adding credentials")
                console.error(`Error adding credentials ${credentials_id} to user ${user_id}. Expected 1 affected rows, received: `,  result)
                return false    
            }
        } catch(e){
            this.Error("Error adding credentials")
            console.error(`Error adding credentials ${credentials_id} to user ${user_id}: `, e.message)
            return false
        }
    }

    static async removeCredentials( user_id, credentials_id ){
        try{            
            const [result] = await this.DB.query( qRemoveCredentials, [user_id, credentials_id] )
            if( result && result.affectedRows === 1 ){
                return true
            } else {
                this.Error("Unknown DB error while removing credentials")
                console.error(`Error removing credentials ${credentials_id} from user ${user_id}. Expected 1 affected rows, received: `,  result)
                return false    
            }
        } catch(e){
            this.Error("Error removing credentials")
            console.error(`Error removing credentials ${credentials_id} from user ${user_id}: `, e.message)
            return false
        }
    }

    static async delete(id){        
        try{            
            const [result] = await this.DB.query( qDeleteUser, [id] )
            if( result && result.affectedRows === 1 ){
                return true
            } else {
                console.error("Error deleting user. Expected 1 affected row in result, received: ",  result)
                this.Error("Unknown DB error while deleting user")
                return false    
            }
        } catch(e){
            console.error("Error deleting user: ", e.message)
            this.Error("Error deleting user")
            return false
        }
    }

    // /**
    //  * 
    //  * @param {*} login 
    //  * @param {*} password 
    //  * @returns {object|false} object like {token, user}
    //  */
    // static async loginStudent(login, password){
            
    //     // console.debug("loginStudent")
    //     // callback for login function. 
    //     // Should check whether the user has 'student' credentials and if not, return false
    //     const verifyCredentials = function(user){
    //         return new Promise( 
    //             (resolve, reject) => {

    //                 console.log( "UserId:", user.id)
                    
    //                 UsersService.get(user.id).then(
    //                     userData => {
    //                         // console.log( "User data:", userData)
    //                         if( userData && Array.isArray(userData.credentials) ){     
    //                             const isStudent = userData.credentials.includes("student")
    //                             // console.log( "checking...", isStudent)        
    //                             resolve( isStudent )
    //                         } else {
    //                             // console.log( "oops!..")                                                                           
    //                             reject( "Credentials verification failed" );
    //                         }
    //                     }
    //                 ).catch( e => {
    //                     console.error( "Error while verifying credentials: ", e.message )
    //                     this.error = "Unknown error"
    //                     // return false
    //                     reject("Unknown error")
    //                 })     
    //             })
    //     }

    //     const token = await Auth.login(login, password , verifyCredentials )        
    //     if( token  ){
    //         // have to decode token and fetch the user from it again, due to async process.
    //         const decoded = await Auth.verifyToken(token)
    //         if( decoded ){
    //             // console.log("Decoded:", decoded)
    //             const {userId} = decoded
    //             const user = await UsersService.get(userId)
    //             // console.log("Found user here:", user)
    //             return {token, user }            
    //         } else {
    //             console.error("Could not decode newly created token! Received: ", decoded)
    //             this.Error("Unknown token error")
    //             return false
    //         }
    //     } else {
    //         this.Error(Auth.error)
    //         return false
    //     } 
    // }

    /**
     * 
     * @param {*} login 
     * @param {*} password 
     * @returns {object|false} object like {token, user}
     */
    static async loginStudent(login, password){            
        return await this.loginUserWithCredentials(login, password, "student")
    }
    /**
     * 
     * @param {*} login 
     * @param {*} password 
     * @returns {object|false} object like {token, user}
     */
    static async loginAdmin(login, password){            
        return await this.loginUserWithCredentials(login, password, "admin")
    }
    /**
     * 
     * @param {*} login 
     * @param {*} password 
     * @returns {object|false} object like {token, user}
     */
    static async loginOrganization(login, password){            
        return await this.loginUserWithCredentials(login, password, "organization")
    }
    
    /**
     * 
     * @param {*} login 
     * @param {*} password 
     * @param {string} credentials - admin|student|organization
     * @returns {object|false} object like {token, user}
     */
    static async loginUserWithCredentials(login, password, credentials ){            
        
        // Should check whether the user has 'admin' credentials and if not, return false
        const verifyCredentials = function(user){
            return new Promise( 
                (resolve, reject) => {

                    console.log( "UserId:", user.id)
                    
                    UsersService.get(user.id).then(
                        userData => {
                            // console.log( "User data:", userData)
                            if( userData && Array.isArray(userData.credentials) ){                                     
                                resolve( userData.credentials.includes( credentials ) )
                            } else {
                                // console.log( "oops!..")                                                                           
                                reject( "Credentials verification failed" );
                            }
                        }
                    ).catch( e => {
                        console.error( "Error while verifying credentials: ", e.message )
                        this.error = "Unknown error"
                        // return false
                        reject("Unknown error")
                    })     
                })
        }

        const token = await Auth.login(login, password , verifyCredentials )        
        if( token  ){
            // have to decode token and fetch the user from it again, due to async process.
            const decoded = await Auth.verifyToken(token)
            if( decoded ){
                // console.log("Decoded:", decoded)
                const {userId} = decoded
                const user = await UsersService.get(userId)
                // console.log("Found user here:", user)
                return {token, user }            
            } else {
                console.error("Could not decode newly created token! Received: ", decoded)
                this.Error("Unknown token error")
                return false
            }
        } else {
            this.Error(Auth.error)
            return false
        } 
    }

    static async logout(token){
        try{
            await Auth.logout( token )
            return true
        } catch(e){
            console.error("Error logging out student: ", e.message )
            return false
        }
    }
}

baseService.extend(UsersService)


module.exports = UsersService