Ben Herron

In order to run my program you must first "npm install" within the directory you saved all of my files contents within. This should install: 
"connect-mongodb-session": "^2.2.0",
"express": "^4.17.1",
"express-session": "^1.17.0",
"mongoose": "^5.7.12",
"pug": "^2.0.4"

Download and install the Community Edition of Mongo
https://docs.mongodb.com/manual/administration/install-community/

To start the Mongo daemon:
1. Open a command line terminal
2. Navigate to the directory you want your database to be contained in (e.g., directory of your server)
3. Create a directory to store the database
4. Run: mongod --dbpath=dirName
(dirName is the directory you created in #2)

After doing so, run database-initializer.js with Node, then run server.js with Node. Then begin testing it by opening http://localhost:3000/
in a browser.
