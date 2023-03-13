// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// Generate Hash
var bcrypt = require('bcrypt-nodejs');
const { Sequelize } = require('sequelize');
// database module
var database = require('../Config/Database');
// expose this function to our app using module.exports
module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.UserId);
    });

    // used to deserialize the user
    passport.deserializeUser(function (userId, done) {
        var sqlStr = '\
        SELECT *\
        FROM Users\
        where UserId = \'' + userId + '\'';
        database.RunQuery(sqlStr,Sequelize.QueryTypes.SELECT,(rows)=>{
            done(null, rows[0]);
        });
    });


    passport.use('SignIn', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true // allows to pass back the entire request to the callback
        },
        function (req, username, password, done) { // callback with username and password from form
            // check to see if the user exists or not
            var sqlStr = 'SELECT * FROM users WHERE Username = \'' + username + '\'';
            database.RunQuery(sqlStr,Sequelize.QueryTypes.SELECT, function (rows) {
                // if no user is found, return the message
                if (rows.length < 1)
                    return done(null, false, req.flash('signInError', 'ไม่พบบัญชีผู้ใช้งาน')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].Password))
                    return done(null, false, req.flash('signInError', 'ขออภัย! รหัสผ่านของท่านไม่ถูกต้อง')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, rows[0]);
            });

        })
    );


    passport.use('SignUp', new LocalStrategy({
            // by default, local strategy uses username and password
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        (req, username, password, done)=> {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            var email = req.body.email;
            if (password != req.body.rePassword) {
                return done(null, false, req.flash('signUpError', 'รหัสผ่านของท่านไม่ถูกต้อง'));
            }
            else {
                var selectQuery = 'SELECT *\
                    FROM Users\
                    WHERE Email = \'' + email + '\'';
                    database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (emailRows) {
                    if (emailRows.length > 0) {
                        return done(null, false, req.flash('signUpError', 'อีเมลนี้ถูกใช้ไปแล้วไม่สามารถใช้ซ้ำได้'));
                    }
                    else {
                        selectQuery = '\
                        SELECT *\
                        FROM Users\
                        WHERE Username = \'' + username + '\'';
                        database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (usernameRows) {
                            if (usernameRows.length > 0) {
                                return done(null, false, req.flash('signUpError', 'บัญชีผู้ใช้งานนี้ถูกใช้ไปแล้วไม่สามารถใช้ซ้ำได้'));
                            }
                            else {
                                // if there is no user with that user and email
                                var passwordHash = bcrypt.hashSync(password, null, null);
                                
                                var insertQuery = 'INSERT INTO Users\
                                    VALUES(null,\
                                    \'' + username + '\', \
                                    \'' + passwordHash + '\', \
                                    \'' + email + '\', 0)';
                                database.RunQuery(insertQuery,Sequelize.QueryTypes.INSERT, function (insertResult) { 
                                    console.log(insertResult[0].insertId);
                                        var user = { UserId: insertResult[0].insertId};
                                        console.log(user);
                                        return done(null, user);
                                    });
                            }
                        });
                    }
                });
            }
        })
    );
};
