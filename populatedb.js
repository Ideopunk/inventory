#! /usr/bin/env node

console.log(
	"This script populates the database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Item = require("./models/item");
var Category = require("./models/category");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var items = [];
var categories = [];

function categoryCreate(name, description, cb) {
	var category = new Category({ name: name, description: description });

	category.save(function (err) {
		if (err) {
			cb(err, null);
			return;
		}
		console.log("New Category: " + category);
		categories.push(category);
		cb(null, category);
	});
}

function itemCreate(name, year, category, stockCount, price, image, cb) {
	const itemDetail = {
		name: name,
		year: year,
		category: category,
		stockCount: stockCount,
		image: image,
		price: price,
	};

	const item = new Item(itemDetail);
	item.save(function (err) {
		if (err) {
			cb(err, null);
			return;
		}
		console.log("New Item: " + item);
		items.push(item);
		cb(null, item);
	});
}

function createCategories(cb) {
	async.series(
		[
			function (callback) {
				categoryCreate(
					"1880s",
					"William Morris wallpaper designs from the 1880s.",
					callback
				);
			},
			function (callback) {
				categoryCreate(
					"1890s",
					"William Morris wallpaper designs from the 1890s.",
					callback
				);
			},
		],
		// optional callback
		cb
	);
}

function createItems(cb) {
	async.parallel(
		[
			function (callback) {
				itemCreate("Pink and Poppy", 1881, categories[0], 3, 49.99, "image", callback);
			},
			function (callback) {
				itemCreate("Grafton", 1883, categories[0], 5, 69.99, "image", callback);
			},
			function (callback) {
				itemCreate("Wild Tulip", 1884, categories[0], 6, 59.99, "image", callback);
			},
			function (callback) {
				itemCreate("Pink and Rose", 1890, categories[1], 8, 54.99, "image", callback);
			},
			function (callback) {
				itemCreate("Blackthorn", 1892, categories[1], 7, 74.99, "image", callback);
			},
		],
		// optional callback
		cb
	);
}

async.series(
	[createCategories, createItems],
	// Optional callback
	function (err, results) {
		if (err) {
			console.log("FINAL ERR: " + err);
		}
		// All done, disconnect from database
		mongoose.connection.close();
	}
);
