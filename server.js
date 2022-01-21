// Define Constants
const mongoose = require("mongoose");
const express = require('express');
const Question = require("./QuestionModel");
const User = require("./UserModel");
const session = require('express-session');
const app = express();
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
	uri: 'mongodb://localhost:27017/tokens',
	collection: 'sessions'
});

// Define session secret and store
app.use(session({ secret: 'bens secret', store: store }));

app.set("view engine", "pug");
app.use(express.static("public"));
app.use(express.json());


// Handle requests with corresponding functions
app.get("/users", getUsers);
app.post("/login", login);
app.post("/quiz", postQuiz);
app.post("/privacy", changePrivacy);
app.get("/quiz", getQuiz);
app.get("/logout", logout);
app.get('/users/:id', getUser);
app.get('/', getHome);


/* If the id parameter exists, try to load a user
*  that matches that ID. Respond with a 404 error
*  if an invalid object ID is found, or and ID is not found.
*/
app.param("id", function (req, res, next, value) {
	console.log("Finding user by ID: " + value);

	// See if the requested id matches a user in the database
	User.find()
		.where({ _id: value })
		.then(users => {
			if (users[0]._id) {
				req.user = users[0];
				next();
			} else {
				res.status(404).send("Sorry, " + req.query.username + " does not exist");
			}
		});
});

// Used to change a users privacy settings
async function changePrivacy(req, res) {
	console.log(req.body.privacy);

	// If the value trying to be saved is not the current setting
	if (req.session.privacy != req.body.privacy) {

		// Change the current setting on the page and in the database
		req.session.privacy = req.body.privacy;
		await User.updateOne({ username: req.session.username }, { privacy: req.body.privacy });

		res.status(200).json({ url: "/users/" + req.session._id });
	}
}

// Function that handles logout GET request
function logout(req, res, next) {
	req.session.loggedin = false;
	req.session.username = null;
	req.session.user = null;
	req.session.total_quizzes = null;
	req.session.total_score = null;
	req.session._id = null;
	req.session.privacy = null;

	// Redirect the user to the home page
	res.status(200).json({ url: "/" });
}

// Function that handles login GET request
function login(req, res) {

	// Check if the user is already logged it
	if (req.session.loggedin) {
		res.status(200).send("Already logged in.");
		return;
	}

	let username = req.body.username;
	let password = req.body.password;

	// Find user in the database
	db.collection("users").findOne({ username: username }, function (err, result) {
		if (err) throw err;

		// If the user exists
		if (result) {

			//Make sure password matches too
			if (result.password === password) {
				req.session.loggedin = true;
				req.session.username = username;
				req.session.user = result;
				req.session.total_quizzes = result.total_quizzes;
				req.session.total_score = result.total_score;
				req.session._id = result._id;
				req.session.privacy = result.privacy;
				res.json({ url: "/users/" + result._id, user: result });
			} else {
				res.json({ url: "/" });
			}
		} else {
			res.json({ url: "/" });
		}
	});
}

// Function that displays the home page
function getHome(req, res, next) {

	// Render different pages depending on if a user is logged in
	if (!req.session.loggedin) {
		res.render("pages/index");
	} else {
		res.render("pages/loggedIndex", { user: req.session.user });
	}

}

// Function for retrieving a users page
function getUser(req, res) {

	// When trying to access a user with privacy turned on
	if (req.session.username !== req.user.username && req.user.privacy === true) {
		res.status(403).send("You do not have access to this profile");
		return;
	}

	// JSON object to hold the user's average score
	let avg = {};
	if (req.user.total_score === 0) {
		avg.avg = 0;
	} else {
		avg.avg = req.user.total_score / req.user.total_quizzes;
	}

	// If it's the current user's page being requested
	if (req.user.username === req.session.username) {
		res.render("pages/user", { user: req.user, average: avg });
	} else {

		// Check if they are requesting their own page or someone elses
		if (!req.session.loggedin) {
			res.render("pages/userStats", { user: req.user, average: avg });
		}
		else {
			res.render("pages/loggedUserStats", { viewUser: req.user, user: req.session.user, average: avg });
		}
	}

}

// Function for getting the page of users
function getUsers(req, res, next) {

	// Find all users that are not private
	User.find()
		.where({ privacy: false })
		.then(users => {

			// If user is not logged in
			if (!req.session.loggedin) {
				res.status(200).render("pages/users", { pUsers: users });
			} else {
				res.status(200).render("pages/loggedUsers", { pUsers: users, user: req.session.user });
			}
		})
}


// Function that creates a page with a new quiz of 10 random questions
function getQuiz(req, res, next) {
	Question.getRandomQuestions(function (err, results) {
		if (err) throw err;

		// Render different pages depending if a user is logged in
		if (!req.session.loggedin) {
			res.status(200).render("pages/quiz", { questions: results });
		} else {
			res.status(200).render("pages/loggedQuiz", { questions: results, user: req.session.user });
		}
	});
}

/* The quiz page posts the results here
*  Extracts the JSON containing quiz IDs/answers
*  Calculates the correct answers
*/
function postQuiz(req, res, next) {
	let ids = [];
	try {
		//Try to build an array of ObjectIds
		for (id in req.body) {
			ids.push(new mongoose.Types.ObjectId(id));
		}

		//Find all questions with Ids in the array
		Question.findIDArray(ids, async function (err, results) {
			if (err) throw err;

			//Count up the correct answers
			let correct = 0;
			for (let i = 0; i < results.length; i++) {
				if (req.body[results[i]._id] === results[i].correct_answer) {
					correct++;
				}
			}

			// If a user is not logged in send to home page
			if (!req.session.loggedin) {
				res.json({ url: "/", correct: correct });
			}
			// If a user is logged in make calculations, update database, send response
			else {
				req.session.total_quizzes++;
				req.session.total_score += correct;
				await User.updateOne({ username: req.session.username }, { total_quizzes: req.session.total_quizzes, total_score: req.session.total_score });
				res.json({ url: "/users/" + req.session._id, correct: correct });
			}
		});
	} catch (err) {
		// If any error is thrown (casting Ids or reading database), send 500 status
		console.log(err);
		res.status(500).send("Error processing quiz data.");
	}

}

// Try to connect to the database
mongoose.connect('mongodb://localhost/quiztracker', { useNewUrlParser: true });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// Open the database
db.once('open', function () {
	app.listen(3000);
	console.log("Server listening on port 3000");
});




