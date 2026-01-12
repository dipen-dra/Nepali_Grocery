import multer from 'multer';
import path from 'path';
import fs from 'fs';


const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        const dir = 'public/images/profile-pictures';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});


const fileFilter = (req, file, cb) => {
    // 1. Prevent Null Byte Injection
    if (file.originalname.indexOf('\0') !== -1) {
        const error = new Error('Malicious filename detected');
        error.statusCode = 400;
        return cb(error, false);
    }

    // 2. Allowed Extensions & Mime Types
    const allowedFileTypes = /jpeg|jpg|png/;
    const allowedMimeTypes = /image\/(jpeg|png|jpg)/;

    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.test(file.mimetype);

    // 3. Double Extension Prevention (e.g., image.php.png)
    // Reject if the filename contains executable extensions before the final extension
    const doubleExtensionRegex = /\.(php|exe|sh|bat|js|html|py)\./i;
    if (doubleExtensionRegex.test(file.originalname)) {
        const error = new Error('Double extension file upload attempt detected');
        error.statusCode = 400;
        return cb(error, false);
    }

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        const error = new Error('Only .jpeg, .jpg and .png format allowed!');
        error.statusCode = 400;
        cb(error, false);
    }
};

const multerUpload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: fileFilter
});

export default multerUpload;