
// Validate Registrstion

const validateRegistration = async (req, res, next) =>{
    const { username, email, password, role } = req.body

    const errors = []

    if(!username){
        errors.push("Please add your username")
    }

    if(!role){
        errors.push("Please add your role")
    }

    if(!email){
        errors.push("Please add email")
    }

    if(password.length < 8){
        errors.push("Minimum of eight characters required for password.")
    }
    
    if(errors.length > 0){
        return res.status(400).json({message: errors})
    }

    next()
}

// Validate Login
const validateLogin = async (req, res, next) =>{
    const { email, password } = req.body

    const errors = []

    if(!email){
        errors.push("Please add your email")
    } else if(!validEmail(email)){
        errors.push("Email format is incorrect")
    }

    if(!password){
        errors.push("Incorrect email or password")
    }

    if(errors.length > 0){
        return res.status(400).json({message: errors})
    }

    next()
}

// Validate Email With Regex
const validEmail = (email) =>{
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase()); 
}

module.exports = {
    validateRegistration,
    validateLogin,
    validEmail
    
}