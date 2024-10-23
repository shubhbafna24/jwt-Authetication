const express = require('express');
const router = express.Router(); // use Router() instead of express()

router.use(express.json());

const path = require('path');
const multer = require('multer');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){  // Removed extra space
            cb(null, path.join(__dirname, '../public/images'));
        } else {
            cb(new Error('File type not supported'), false);
        }        
    },
    filename : function(req, file, cb){
        const name = Date.now() + '-' + file.originalname;
        cb(null, name); 
    }
});

// Multer file filter
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){ // Removed extra space
        cb(null, true);
    } else {
        cb(null, false);
    }
}

// Multer upload middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

const userController = require("../controllers/userController");
const { registerValidator ,sendMailVerificationValidator } = require('../helpers/validation');

router.post('/register', upload.single('image'), registerValidator, userController.userRegister);

router.post('/send-mail-verification',sendMailVerificationValidator, userController.sendMailVerification)

module.exports = router;
