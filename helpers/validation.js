const {check} = require('express-validator');

exports.registerValidator =[
    check('name','Name is required').not().isEmpty(),
    check('email','Please include a valid email').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('mobile','Mobile No. should contain 10 digits').isLength({
        min:10,
        max:10
    }),
    check('password','Password should contain atleast 6 characters, and contains at least one upperCase letter , one lowerCase letter , one number and one special character').isStrongPassword({
        minLength:6,
        minUppercase:1,
        minLowercase:1,
        minNumbers:1,
        minSymbols:1
    }),
    check('image').custom((value, {req}) => {
        if(req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png'){

            return true;
        }
        else{
            return false;
        }
    }).withMessage("Please upload an image with JPEG or PNG")

];


exports.sendMailVerificationValidator =[
    check('email','Please include a valid email').isEmail().normalizeEmail({gmail_remove_dots:true})
]