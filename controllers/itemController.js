const Item = require("../models/item");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");
const async = require("async");
const aws = require("aws-sdk");

const s3 = new aws.S3({ region: "us-east-2" });

exports.item_list = (req, res, next) => {
	Item.find()
		.sort([["name", "descending"]])
		.exec((err, list_items) => {
			if (err) {
				return next(err);
			}
			res.render("item_list", { title: "Item Index", item_list: list_items });
		});
};

exports.item_detail = (req, res, next) => {
	Item.findById(req.params.id)
		.populate("category")
		.exec((err, item) => {
			if (err) {
				return next(err);
			}
			if (item == null) {
				const err = new Error("Item not found");
				err.status = 404;
				return next(err);
			}
			res.render("item_detail", {
				title: item.modelName,
				item: item,
			});
		});
};

exports.item_delete_post = function (req, res, next) {
	if (req.body.password === process.env.ADMIN_PASSWORD) {
		const key = req.body.obj.match(/(\/[\w\.]+)/g);
		const realKey = key[key.length - 1].slice(1);
		console.log("realkey: " + realKey);
		const params = { Bucket: process.env.BUCKET_NAME, Key: realKey };

		s3.deleteObject(params, function (err, data) {
			if (err) console.log(err, err.stack);
			// an error occurred
			else console.log(data); // successful response
		});

		Item.findByIdAndRemove(req.body.id, function deleteItem(err) {
			if (err) {
				return next(err);
			}
			res.redirect("/");
		});
	}
};

exports.item_create_get = (req, res, next) => {
	Category.find({}, "name").exec((err, categories) => {
		if (err) {
			return next(err);
		}
		res.render("item_form", { title: "Add item to inventory", category_list: categories });
	});
};

exports.item_create_post = [
	body("name", "Name must be specified").trim().isLength({ min: 3 }).escape(),
	body("year", "Year must be specified").isNumeric(),
	body("stockCount", "Stock must be specified").isNumeric(),
	body("price", "Price must be specified").isNumeric(),
	body("category", "Category must be specified").trim().isLength({ min: 1 }).escape(),
	(req, res, next) => {
		const errors = validationResult(req);

		const item = new Item({
			name: req.body.name,
			price: req.body.price,
			stockCount: req.body.stockCount,
			year: req.body.year,
			image: req.file.location,
			category: req.body.category,
		});

		if (!errors.isEmpty()) {
			console.log(errors);
			Category.find({}, "name").exec((err, categories) => {
				if (err) {
					return next(err);
				}
				res.render("item_form", {
					title: "Add item to inventory",
					category_list: categories,
					errors: errors.array(),
				});
			});
		} else {
			item.save(function (err) {
				if (err) {
					return next(err);
				}
				res.redirect(item.url);
			});
		}
	},
];

exports.item_update_get = (req, res, next) => {
	async.parallel(
		{
			item: function (callback) {
				Item.findById(req.params.id).populate("category").exec(callback);
			},
			categories: function (callback) {
				Category.find({}).exec(callback);
			},
		},
		function (err, results) {
			if (err) {
				return next(err);
			}
			res.render("item_form", {
				title: "Update item",
				item: results.item,
				category_list: results.categories,
			});
		}
	);
};

exports.item_update_post = [
	body("name", "Name must be specified").trim().isLength({ min: 3 }).escape(),
	body("year", "Year must be specified").isNumeric(),
	body("stockCount", "Stock must be specified").isNumeric(),
	body("price", "Price must be specified").isNumeric(),
	body("category", "Category must be specified").trim().isLength({ min: 1 }).escape(),
	(req, res, next) => {
		const errors = validationResult(req);

		let location = "";

		if (req.file) {
			location = req.file.location;
		} else {
			location = req.body.obj;
		}

		const item = new Item({
			name: req.body.name,
			price: req.body.price,
			stockCount: req.body.stockCount,
			year: req.body.year,
			image: location,
			category: req.body.category,
			_id: req.params.id,
		});

		if (!errors.isEmpty() || req.body.password !== process.env.ADMIN_PASSWORD) {
			async.parallel(
				{
					item: function (callback) {
						Item.findById(req.params.id).populate("category").exec(callback);
					},
					categories: function (callback) {
						Category.find({}).exec(callback);
					},
				},
				function (err, results) {
					if (err) {
						return next(err);
					}
					res.render("item_form", {
						title: "Update item",
						item: results.item,
						category_list: results.categories,
						errors: errors.array(),
					});
					return;
				}
			);
		} else {
			Item.findByIdAndUpdate(req.params.id, item, {}, function (err, theitem) {
				if (err) {
					return next(err);
				}

				res.redirect(theitem.url);
			});
		}
	},
];
