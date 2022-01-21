const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create question schema
let questionSchema = Schema({
	question: { type: String, required: true },
	correct_answer: { type: String, required: true },
	incorrect_answers: [{ type: String, required: true }]
});

// Function to find an array with question ids
questionSchema.statics.findIDArray = function (arr, callback) {
	this.find({ '_id': { $in: arr } }, function (err, results) {
		if (err) {
			callback(err);
			return;
		}
		callback(null, results);
	});
}

// Function to get an aggregate of 10 questions
questionSchema.statics.getRandomQuestions = function (callback) {
	this.aggregate([{ "$sample": { size: 10 } }]).exec(callback);
}

module.exports = mongoose.model("Question", questionSchema);