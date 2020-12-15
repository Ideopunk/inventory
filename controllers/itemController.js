const Item = require("../models/item");
const Category = require("../models/category");

const { body, validationResult } = require("express-validator");
const async = require("async");

exports.item_list = (req, res, next) => {
	Item.find()
		.sort([["name", "descending"]])
		.exec((err, list_items) => {
			if (err) {
				return next(err);
			}
			res.render("item_list", { title: "Index", item_list: list_items });
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
	Item.findByIdAndRemove(req.body.id, function deleteItem(err) {
		if (err) {return next(err);}
		res.redirect("/")
	})
}

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
