var express = require("express");
var router = express.Router();

const multer = require("multer");
const aws = require("aws-sdk");

const multerS3 = require("multer-s3");
const s3 = new aws.S3({ region: "us-east-2" });

const fileFilter = (req, file, cb) => {
    console.log(file);
    console.log(file.mimetype)
	if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
		cb(null, true);
	} else {
		cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
	}
};

const upload = multer({
	fileFilter,
	storage: multerS3({
		s3: s3,
		bucket: process.env.BUCKET_NAME,
		contentType: multerS3.AUTO_CONTENT_TYPE,
		// contentType: function (req, file, cb) {
		// 	cb(null, "image/png");
		// },
		key: function (req, file, cb) {
			cb(null, Date.now().toString());
		},
	}),
});
// Require controller modules

const item_controller = require("../controllers/itemController");
const category_controller = require("../controllers/categoryController");

/* Routes */

// items

router.get("/item/create", item_controller.item_create_get);

router.post("/item/create", upload.single("image"), item_controller.item_create_post);

// router.get("/item/:id/delete", item_controller.item_delete_get);

// router.post("/item/:id/delete", item_controller.item_delete_post);

// router.get("/item/:id/update", item_controller.item_update_get);

// router.post("/item/:id/update", item_controller.item_update_post);

router.get("/item/:id", item_controller.item_detail);

router.get("/items", item_controller.item_list);

// categories

router.get("/", category_controller.index);

// router.get("/category/create", category_controller.category_create_get);

// router.post("/category/create", category_controller.category_create_post);

// router.get("/category/:id/delete", category_controller.category_delete_get);

// router.post("/category/:id/delete", category_controller.category_delete_post);

// router.get("/category/:id/update", category_controller.category_update_get);

// router.post("/category/:id/update", category_controller.category_update_post);

router.get("/category/:id", category_controller.category_detail);

module.exports = router;
