const Item = require("../models/item");
const Category = require("../models/category");

const { body, validationResult } = require("express-validator");
const async = require("async");

exports.index = (req, res, next) => {
	Category.find()
		.sort([["name", "descending"]])
		.exec((err, list_categories) => {
			console.log(list_categories);
			if (err) {
				return next(err);
			}
			res.render("category_list", { title: "Index", category_list: list_categories });
		});
};

exports.category_detail = (req, res, next) => {
	console.log(req.params.id);
	async.parallel(
		{
			category: (callback) => {
				Category.findById(req.params.id).exec(callback);
			},
			category_items: (callback) => {
				Item.find({ category: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.category == null) {
				console.log("category not found");
				const err = new Error("Category not found");
				err.status = 404;
				return next(err);
			}
			res.render("category_detail", {
				title: "Category Detail",
				category: results.category,
				category_items: results.category_items,
			});
		}
	);
};

exports.category_create_get = (req, res, next) => {
	Category.find({}, "name").exec((err, categories) => {
		if (err) {
			return next(err);
		}
		res.render("category_form", { title: "Add a category", category_list: categories });
	});
};

exports.category_create_post = [
	body("name", "Name must be specified").trim().isLength({ min: 3 }).escape(),
	body("description", "Describe it!").trim().isLength({ min: 3 }).escape(),
	(req, res, next) => {
		const errors = validationResult(req);

		const category = new Category({
			name: req.body.name,
			description: req.body.description,
		});

		if (!errors.isEmpty()) {
			console.log(errors);
			Category.find({}, "name").exec((err, categories) => {
				if (err) {
					return next(err);
				}
				res.render("category_form", {
					title: "Add category to inventory",
					category_list: categories,
					errors: errors.array(),
				});
			});
		} else {
			category.save(function (err) {
				if (err) {
					return next(err);
				}
				res.redirect(category.url);
			});
		}
	},
];

exports.category_delete_post = function (req, res, next) {
	async.parallel(
		{
			category: function (callback) {
				Category.findById(req.body.id).exec(callback);
			},
			category_items: function (callback) {
				Item.find({ category: req.body.id }).exec(callback);
			},
		},
		function (err, results) {
			if (err) {
				return next(err);
			}

			if (results.category_items.length > 0) {
				res.render("category_detail", {
					title: "Category Detail",
					category: results.category,
					category_items: results.category_items,
				});
				return;
			} else {
				Category.findByIdAndRemove(req.body.id, function deleteCategory(err) {
					if (err) {
						return next(err);
					}

					res.redirect("/catalog");
				});
			}
		}
	);
};

exports.category_update_get = function (req, res, next) {
	async.parallel(
		{
			category: function (callback) {
				Category.findById(req.params.id).exec(callback);
			},
			category_items: function (callback) {
				Item.find({ category: req.params.id }).exec(callback);
			},
		},
		function (err, results) {
			if (err) {
				return next(err);
			}

			if (results.category == null) {
				res.redirect("/catalog");
			}

			res.render("category_form", {
				title: "Update Category",
				category: results.category,
				category_list: results.category_items,
			});
		}
	);
};

exports.category_update_post = [
	body("name", "Name must be specified").trim().isLength({ min: 3 }).escape(),
	body("description", "Describe it!").trim().isLength({ min: 3 }).escape(),
	(req, res, next) => {
		const errors = validationResult(req);

		const category = new Category({
			name: req.body.name,
			description: req.body.description,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			console.log(errors);
			Category.find({}, "name").exec((err, categories) => {
				if (err) {
					return next(err);
				}
				res.render("category_form", {
					title: "Add category to inventory",
					category_list: categories,
					category: category,
					errors: errors.array(),
				});
			});
			return;
		} else {
			Category.findByIdAndUpdate(req.params.id, category, {}, function (err, thecategory) {
				if (err) {
					return next(err);
				}

				res.redirect(thecategory.url);
			});
		}
	},
];
