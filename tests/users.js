require("dotenv").config()


const Service = require("../services/users")


const testStudent = {
    "name": "Test Student",
    "email": "teststudent@test.com",
    "password": "123456"
}

/**
 * An object to store the results
 */
let _results = {

}

const storeResult = (result, index ) => { 
    // console.debug("Result stored: ", result, index );  
    _results[index] = result
}
const getResult = index => { 
    // console.debug("Getting value ", index, "from", _results, "getting: ", _results[index] ); 
    return _results[index]
}

const tests = [
    {
        title: "Empty id",
        method: "get",
        args: [""],
        should: "Return false and store User not found error",
    },
    {
        title: "NULL id",
        method: "get",
        args: [null],
        should: "Return false and store User not found error",
    },
    {
        title: "Non-existant ID",
        method: "get",
        args: [ 10000000 ],
        should: "Return false and store User not found error",
    },
    {
        title: "Garbled ID with quote",
        method: "get",
        args: [ 'aSDsdfS##!%^&"F4gfg' ],
        should: "Return false and store User not found error",
    },
    {
        title: "Existing ID",
        method: "get",
        args: [ 1 ],
        should: "Return user data",
    },
    {
        title: "Register new student with null password",
        method: "registerStudent",
        args: [ {...testStudent, password: null}  ],
        should: "Return error",
    },
    {
        title: "Register new student with null email",
        method: "registerStudent",
        args: [ {...testStudent, email: null}  ],
        should: "Return error",
    },
    {
        title: "Register new student with correct data",
        method: "registerStudent",
        args: [ testStudent ],
        should: "Create new user and return its id",
        storeAs: "id" // stores the result as 'id'     
    },    
    {
        title: "Add admin credentials to the new user",
        method: "addCredentials",
        args: [ "_res_id", "admin" ],
        should: "Add the admin credentials and return true",
        // keepPreviousResult: true // keep the user id
    },
    {
        title: "Remove admin credentials from the new user",
        method: "removeCredentials",
        args: [ "_res_id", "admin" ],
        should: "Remove the admin credentials and return true",
        // keepPreviousResult: true // keep the user id
    },

    {
        title: "Login created user",
        method: "loginStudent",
        args: [ testStudent.email, testStudent.password ],
        should: "Login the student and return the token",     
        storeAs: "token"   
    },

    {
        title: "Logout logged-in user",
        method: "logoutStudent",
        args: [ "_res_token" ],
        should: "Log the student out and return true"        
    },

    {
        title: "Delete",
        method: "delete",
        args: [ "_res_id" ],
        should: "Delete the test user and return true",        
    },

    
]

// const parseRes = (res, args )=> {
//     return args.map ( arg => arg === "_res_" ? res : arg )
// }

const parseRes = ( args )=> {
    return args.map ( arg => ( typeof arg === "string" && arg.indexOf("_res_") === 0 ) ? getResult( arg.slice("5") ) : arg )
}


let i = 0
const maxItem = tests.length;

(
    async () => {

        console.log("\n\n\n\n >>> Testing users service <<<< ")

        let lastResult

        while (i < maxItem) {
            let { method, args, title, should, keepPreviousResult = false, storeAs = false } = tests[i]

            try {
                console.log("\n\n >>> >>> Testing:", title, ", method:", method, ", args:", args )
                console.log(" >>> >>> Should:", should)

                // parse args with previous result
                // args = parseRes(lastResult, args )
                args = parseRes( args )

                const res = await Service[method].apply(Service, args)

                // store last result if not told to keep the previous
                if( !keepPreviousResult )
                    lastResult = res
                
                if( storeAs ){
                    storeResult( res, storeAs )
                }

                console.log(" >>> >>> Result:", res, (!res ? "\n Error: " + Service.error : "") )
                i++;
            } catch (e) {

                console.log(" !!! Fail: ", e.message)
                i++;
            }

        }
        process.exit()
    }
)()