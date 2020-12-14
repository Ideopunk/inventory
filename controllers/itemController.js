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
