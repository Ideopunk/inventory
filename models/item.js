const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
	name: { type: String, required: true, maxlength: 100 },
	year: { type: Number, required: true, min: 1864, max: 1899 },
	category: { type: Schema.Types.ObjectId, ref: "Category" },
	image: {type: String, required: true},
	stockCount: { type: Number, required: true },
	price: { type: Number, required: true },
});

ItemSchema.virtual("url").get(function () {
	return "/catalog/item" + this._id;
});

module.exports = mongoose.model("Item", ItemSchema);
