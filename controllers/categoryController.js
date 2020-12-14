const Item = require("../models/item");
const Category = require("../models/category");

const { body, validationResult } = require("express-validator");
const async = require("async");

exports.index = (req, res, next) => {
	Category.find()
		.sort([["name", "descending"]])
		.exec((err, list_categories) => {
            console.log(list_categories)
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
