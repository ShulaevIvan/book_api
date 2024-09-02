const multer = require('multer');

const storage = multer.diskStorage({
    destination(request, file, callbackFunc){
        callbackFunc(null, 'public/uploads/')
    },
    filename(request, file, callbackFunc) {
        callbackFunc(null, `${Date.now()}-${file.originalname}`)
    }
})
const uploadMiddleware = multer({storage});

module.exports = uploadMiddleware;