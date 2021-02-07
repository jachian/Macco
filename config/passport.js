////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// config/passport.js
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User = require('../app/model');

// expose this function to our app using module.exports
module.exports = function(passport) 
{

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // This method is used to specify what information about the user should actually be stored in a session, "session cookie data".
    // For now it will be the _id parameter
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    passport.serializeUser(function(user, done) 
    {
        done(null, user._id);
    });

    // used to deserialize the user

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // This method is used to take the stored session data and turn it back into a rich object for use by the application
    //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    passport.deserializeUser(function(id, done) 
    {
        User.findById(_id, function(err, user) 
                          {
                             done(err, user);
                          });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy( {passReqTocallback : true},
                                                    function(req, email, password, done)
                                                    {
                                                        createUser(email, password);
                             
                                                        // delay the execution of createUser and execute the method in the next tick of the event loop
                                                        // process.nextTick(createUser);
                                                    } )); 
                                                        
};

var createUser = function(email, password)
{
    User.findOne({'local.email' : email}, function(err, user)
                                          {
                                              // if an error occurs return
                                              if(err)
                                              {
                                                  console.log('Signup error occured: ' +err);
                                                  return done(err);
                                              }
                                              // if the user already exists
                                              if(user)
                                              {
                                                  console.log('This user already exists : ' +email);
                                                  return done(null, false, {message : 'user already exists'}); // they use done(null, false); here
                                              }
                                              else // if we reach here then there is no user with this email address
                                              {
                                                  // create the user
                                                  var newUser = new User();
                                                  // seting the local credentials
                                                  newUser.local.email = email;
                                                  newUser.local.password = password;

                                                  // saving the user
                                                  newUser.save(function(err)
                                                               {
                                                                   if(err)
                                                                   {
                                                                      console.log('Error in saving created user: ' +err);
                                                                      throw err;
                                                                   }
                                                               
                                                                   console.log('User registration successful');
                                                                   return done(null, newUser);
                                                               });
                                              }
                                           });

};

