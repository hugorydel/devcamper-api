// The fs is used to bring in certain files
const fs = require('fs');
const colors = require('colors');
//Loads environment variables from a .env file
const dotenv = require('dotenv');
const connectDB = require('./config/db');

//Load env vars
dotenv.config({path: './config/config.env'});

//Loading models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');

//Connect to DB
//You need to do that because earlier on we set what server we connect and disconnect from: some Mongo URI in the .env section. So, to transfer data to our specified database we have to actually connect to it.
connectDB();

// Read JSON files
// Reads all of the JSON's and blocks other things until it is processed and parsed
const bootcamps = JSON.parse(
  fs.readFileSync(
    `${__dirname}/_data/bootcamps.json`,
    'utf-8' /*Gives current directory name */
  )
);
const courses = JSON.parse(
  fs.readFileSync(
    `${__dirname}/_data/courses.json`,
    'utf-8' /*Gives current directory name */
  )
);
const users = JSON.parse(
  fs.readFileSync(
    `${__dirname}/_data/users.json`,
    'utf-8' /*Gives current directory name */
  )
);
const reviews = JSON.parse(
  fs.readFileSync(
    `${__dirname}/_data/reviews.json`,
    'utf-8' /*Gives current directory name */
  )
);

//Import data into DB

const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    await Review.create(reviews);
    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

//Delete data from DB
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data Destroyed...'.red.inverse);
    //When you click in the terminal to try to turn off the server then clicking yes/no you're doing the same thing as the below -exiting out of server/process
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
//You have to do "node seeder -i/d" because if you use nodemon, nodemon will be confused as to what to do.
