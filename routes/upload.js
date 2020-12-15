const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const s3 = new aws.S3({ region: "us-east-2" });

const fileFilter = (req, file, cb) => {
	console.log(file);


	if (!file) {
		cb(null, false)
	} else if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
		cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
	} else {
		cb(null, true);
	}
};

const upload = multer({
	limits: { fileSize: 99999 },
	fileFilter,
	storage: multerS3({
		s3: s3,
		bucket: process.env.BUCKET_NAME,
		acl: "public-read",
		// contentType: multerS3.AUTO_CONTENT_TYPE,
		contentType: function (req, file, cb) {
			cb(null, file.mimetype);
		},
		key: function (req, file, cb) {
			console.log(req.body.obj)

			if (req.body.obj) {
				const key = req.body.obj.match(/(\/[\w\.]+)/g);
				const realKey = key[key.length - 1].slice(1);
				cb(null, realKey)
			} else {
				cb(null, Date.now().toString());

			}


		},
	}),
});

module.exports = upload;
