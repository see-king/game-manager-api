const baseService = require("./baseService")
const UserService = require("./users")
const AuthService = require("./auth")


class StudentAuthService extends baseService{


    static async login( login, password ){
        const result = await UserService.loginStudent(login, password)
        if( !result )
            this.Error(UserService.error)
            
        return result
        
    }    

    static async register( data ){
        const result = await UserService.registerStudent( data )
        if( !result )
            this.Error(UserService.error)
            
        return result
        
    }   
    
    static async logout( token ){        
        return await AuthService.logout(token)        
    }
    
}

baseService.extend(StudentAuthService)


module.exports = StudentAuthService