require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const passport = require('passport');

const routes = require('./routes/main');
const passwordRoutes = require('./routes/password');
// const { request } = require('express');
const secureRoutes = require('./routes/secure');

// Setup mongo connection
const uri = process.env.MONGO_CONNECTION_URL;
const mongoConfig = {
    useNewUrlParser: true,
    useCreateIndex: true,
    // useUnifiedTopology: true,
};
if(process.env.MONGO_USER_NAME && process.env.MONGO_PASSWORD){
    mongoConfig.auth = { authSource: 'admin' };
    mongoConfig.user = process.env.MONGO_USER_NAME;
    mongoConfig.pass = process.env.MONGO_PASSWORD;
}
mongoose.connect(uri, mongoConfig);

mongoose.connection.on('error', (error)=>{
    console.log(error);
    process.exit(1);
});

mongoose.set('useFindAndModify', false);

const app = express();
const port = process.env.PORT || 3000;

// update express settings
app.use(bodyParser.urlencoded({extended: false})); // parse application/x-www-form-urlendcoded
app.use(bodyParser.json()); // parse application/json
app.use(cors({credentials: true, origin: process.env.CORS_ORIGIN }));
app.use(cookieParser());

// require passport auth
require('./auth/auth.js');

// setup routes
app.use('/', routes);
app.use('/', passwordRoutes);
app.use('/', passport.authenticate('jwt', { session: false }), secureRoutes);

// handle all other routes
app.use((request, response) => {
    response.status(404).json({message: '404 - Not Found', status: 404});
});

// handle errors
app.use((error, request, response, next) => {
    console.log(error);
    response.status(error.status || 500).json({error: error.message, status: 500});
});

mongoose.connection.on('connected', ()=>{
    console.log('Connected to mongo');
    app.listen(port, () => {
        console.log(`server is running on port: ${port}`);
    });
});

