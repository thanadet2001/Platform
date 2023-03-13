//reqiure express & path modules
const express= require('express');
const path = require('path');
const cors=require('cors');
//auth modules
let cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
let csrf = require('csrf');
let session = require('express-session');
var passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
var database = require('./Config/Database');

//instance express to app and using constructor to called middleware routes and errors
class App{
    constructor() {
        this.app=express();
        this.middleware();
        this.routes();
        this.errors();
    }
    middleware(){
        //Set ur Views, Engine & static directory
        this.app.use(express.static(path.join(__dirname, 'Public')));
        this.app.set('Views',path.join(__dirname,'Views'));
        this.app.set('view engine','pug');

        //Set ur application
        this.app.use(morgan('dev')); //log all request to the console.
        this.app.use(cors());
        var csrfProtection = csrf({ cookie: true }); //Cross-site Request Forgery token init
        this.app.use(bodyParser.json());// get info from html forms
        this.app.use(bodyParser.urlencoded({extended: false}));
        this.app.use(cookieParser()); // read cookies
        this.app.use(session({ 
            secret: 'ThisIsMyPlatform', //random unique string key
            saveUninitialized: true,
            resave: false,
            }));
        this.app.use(passport.initialize()); //init passport
        this.app.use(passport.session());    // persistent login sessions
        this.app.use(flash());       //connect-flash for flash messages stored in session
        this.app.locals.pretty=true; //Refornmat html after rendered
        // Session-persisted message middleware
        this.app.use((req, res, next)=>{
            var err = req.session.error,
                msg = req.session.notice,
            success = req.session.success;

            delete req.session.error;
            delete req.session.success;
            delete req.session.notice;

            if (err) res.locals.error = err;
            if (msg) res.locals.notice = msg;
            if (success) res.locals.success = success; 
            
            next();
        });

    }
    routes(){
        //Set ur routes
        const routes = require('./Routes/Routes');
        var cart = require('./Routes/Cart');
        require('./Config/Passport')(passport);
        require('./Routes/AthuSign')(this.app, passport);
        const profile = require('./Routes/AccUser');
        const Admin = require('./Routes/Admin');
        const CheckedOut=require('./Routes/Checked')
        //Using ur routes
        this.app.use('/', routes);
        this.app.use('/Cart',cart)
        this.app.use('/AccUser', profile);
        this.app.use('/SellerCenter',Admin);
        this.app.use('/Checked',CheckedOut);
    }
    errors(){

        // catch 404 and forward to error handler
        this.app.use((req, res, next)=>{
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });
        // dev error handler will be print stacktrace
        if (this.app.get('env') === 'development') {
            this.app.use(function (err, req, res, next) {
                res.status(err.status || 500);
                res.render('Errors', {
                    message: err.message,
                    error: err
                });
            });
        }

        // App error handler no stacktraces leaked to user
        this.app.use((err, req, res, next)=>{
            res.status(err.status || 500);
            res.render('Errors', {
                message: err.message,
                error: {}
            });
        });
        this.app.listen(80);
    }
    
}


module.exports = new App().app;

