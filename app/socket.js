//////////////////////////////////////////////////////////////////////////////////////////AAAOAOA/////////////////////////////////////////////////////
//
// app/socket.js - This is used to process all incoming socket messages from the clients
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const maxmind = require('maxmind');

const uuid = require('node-uuid');    // used for generating random uuid numbers
const redis = require('redis');
const moment = require('moment');
moment().format();

const User = require('./model').user;   // User schema
const Veri = require('./model').veri;   // verification schema
const Event = require('./model').event;  // event Schema
const Locations = require('./model').locations; // location schema
const Profile = require('./model').profile;   // profile schema
const Tag = require('./model').tag;             // tag schema
const Log = require('./model').log;
//const sessionStore = require('./sessionDB');     // This is the redis session store

// initialising requires //////////////////////////
const liveSessions = redis.createClient(6379);    // this database will be used to store sessions that have not expired

liveSessions.on('error', function(err)
                         {
                             console.log('LiveSessions Error: ' +err);
                         });

liveSessions.on('connect', function()
                           {
                               console.log('Redis liveSession is ready');
                           });


// global variables
var sock = null;
var profileCount = 100;
var setProfileCount;



module.exports = function(io, passport, jwt, ip)
{

// Begin Passport Setup ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // passport setup
    var LocalStrategy   = require('passport-local').Strategy;

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


    passport.use('local-signup', new LocalStrategy( {passReqTocallback : true},
                                                    function(req, email, password, done)
                                                    {
                                                        signup(email, password);

                                                        // delay the execution of createUser and execute the method in the next tick of the event loop
                                                        // process.nextTick(createUser);
                                                    } ));

// End passport setup ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

     
    io.on('connection', function(socket)
                    {
                        sock = socket;
                        console.log('a user has connected');

                        sock.emit('browser_load', {status : 'server_online'});

                        // maxmind.init(__dirname + '/GeoLiteCity.dat');
                        // var city = maxmind.getLocation(ip);

                        // maxmind.init(__dirname + '/GeoIP.dat');
                        // var country = maxmind.getCountry(ip);

                        // sock.emit('your_location', {city : city, state : country.code});

                        // socket.on('message', function(msg)
                                                //{
                                                  //  console.log( msg.email +' '+ msg.password);
                                                //});
                        socket.on('post_event', function(msg)
                                                {
                                                      console.log(" just recieved an event for posting");
                                                      postEvent(jwt, msg);     // try to post the event tot the database

                                                });

                        socket.on('edit_event', function(msg)
                                                {
                                                      console.log(" just recieved an event for editing");
                                                      editEvent(jwt, msg);   // try to update the event

                                                });
												
                        socket.on('share_event_via_email', function(msg)
                                                           {
                                                               console.log(" just recieved an event for editing");
                                                               shareEventViaEmail(jwt, msg);   // try to update the event
                                                           });
												
                        socket.on('delete_event', function(msg)
                                                {
                                                     console.log(" just recieved a message for deleting an event");
                                                     deleteEvent(jwt, msg);

                                                });

                        socket.on('change_profile_events', function(msg)
                                                {
                                                     // console.log(" just recieved a message for deleting an event");
                                                     changeProfileEvents(jwt, msg);

                                                });


                        socket.on('get_profiles', function(msg)   // msg - {token}
                                                {
                                                      console.log("just recieved a profile list request");

                                                      getProfiles(jwt, msg.token);

                                                });

                        socket.on('get_current_profile', function(msg)   // msg - {token}
                                                {
                                                      console.log("just recieved a profile list request");

                                                      getCurrentProfile(jwt, msg.token, msg.id);

                                                });


                        socket.on('get_my_profiles_list', function(msg)   // msg - {token}
                                                {
                                                      console.log("just recieved a profile list request");

                                                      getProfiles(jwt, msg.token);

                                                });


                        socket.on('save_profile', function(msg)   // msg - {token, profileId, pro}
                                                  {
                                                      console.log("just recieved a profile update");

                                                      // check to see if the token is valid
                                                      var id = decodeToken(jwt, msg.token);
                                                      if(id === null)
                                                      {
                                                           // the token is expired
                                                           sock.emit('save_profile', {status : 'token_expired'});
                                                      }
                                                      else
                                                      {
                                                           // saving the profile
                                                           saveProfile(msg.profileId, msg.pro);
                                                      }

                                                  });

                        socket.on('new_profile', function(msg)     //- msg - {token, pro}
                                                 {
                                                      console.log("just recieved a request to create a new profile");
                                                      
                                                      newProfile(jwt, msg.token, msg.profile);
                                                 });

                        socket.on('update_profile', function(msg)     //- msg - {token, pro}
                                                    {
                                                         console.log("just recieved a request to update a profile");

                                                         updateProfile(jwt, msg);
                                                    });

                        socket.on('change_password', function(msg)     //- msg - {token, pro}
                                                    {
                                                         console.log("just received a request to change the password");

                                                         changePassword(jwt, msg);
                                                    });													

                        socket.on('is_profile_handle_taken', function(msg)     //- msg - {token, pro}
                                                             {
                                                                 // console.log("just recieved a request to create a new profile");
                                                                 isProfileHandleTaken(msg);

                                                             });


                        socket.on('delete_profile', function(msg)
                                                    {
                                                        console.log("just recieved a profile to delete");

                                                        deleteProfile(jwt, msg);

                                                    });

                        socket.on('get_profile_other', function(msg)
                                                       {
                                                           console.log("just recieved a request for info about another profile");

                                                           getProfileOther(msg);
                                                       });


                        socket.on('get_events', function(msg)
                                                {
                                                      console.log(" just recieved an event request");
                                                      getEvents(jwt, msg);     // try to post the event tot the database

                                                });

                        
                        socket.on('get_events_by_account', function(msg)
                                                           {
                                                               console.log(" get_events_by-account");
                                                               getEventsByAccount(jwt, msg);     

                                                            });


                        socket.on('get_events_by_profile', function(msg)
                                                           {
                                                               console.log(" get_events_by-account");
															   if((msg.profile_id === undefined) || (msg.profile_id === null))
																   getEventsByUser(jwt, msg);
															   else
                                                                   getEventsByProfile(jwt, msg);     

                                                            });

                        socket.on('get_events_my_location', function(msg)
                                                            {
                                                                console.log(" just recieved an event request - get events by my location");
                                                                getEventsMyLocation(jwt, msg);     // try to post the event tot the database
                                                            });

                        socket.on('get_events_all', function(msg)
                                                            {
                                                                console.log(" just recieved an event request - get all events");
                                                                getEventsAll(jwt, msg);     // try to post the event tot the database
                                                            });															

                        socket.on('get_events_on', function(msg)
                                                {
                                                      console.log(" just recieved an event request");
                                                      getEventsOn(jwt, msg);     // try to post the event tot the database

                                                });

                        socket.on('search_events', function(msg)
                                                   {
                                                      console.log(" just recieved an event search request");
                                                      var query = searchEvents(jwt, msg);     // get the filtered events query													  
                                                   });
												
                        socket.on('get_events_by', function(msg)
                                                {
                                                      console.log(" just recieved an event request");
                                                      getEventsBy(jwt, msg);     // try to post the event tot the database

                                                });


                        socket.on('get_locations', function(msg)
                                                {
                                                      console.log(" just recieved a request for the locations array");
                                                      getLocations();     // try to post the event tot the database

                                                });




                        socket.on('signup', function(msg)    // used for processing signup requests(email, password)
                                                {
                                                    console.log('email = ' +msg.email+ ' password = ' +msg.password);
                                                    // passport.authenticate('local-signup', {successRedirect: '/',
                                                                                           // failureRedirect: '/'});
                                                    // console.log('DONE.....');

                                                    signup(msg.email, msg.password, msg.verification);
                                                                                                 
                                                });

                        socket.on('get_verification_code', function(msg)    // used for processing signup requests(email, password)
                                                {
                                                    console.log(' get validation code email = ' +msg.email);

                                                    getVerificationCode(msg.email);

                                                });

                        socket.on('validate', function(msg)    // used for processing account validation codes
                                                {
                                                    console.log('code = ' +msg.code);
                                                    validate(msg.code);

                                                });

                        socket.on('current_user', function(msg) // used for processing login requests
                                                  {
                                                      // get user information
                                                      // console.log("server gets token " +msg.token);
                                                      getCurrentUser(jwt, msg.token);
                                                  });
                        socket.on('forgot_password', function(msg) // used for processing login requests
                                                  {
                                                      forgotPassword(msg.email);
                                                  });

                        socket.on('login', function(msg) // used for processing login requests
                                           {
                                               console.log(msg.email + ' ' + msg.password);
                                               
                                               login(jwt, msg.email, msg.password, msg);
                                           });

                        socket.on('login_facebook', function(msg) // used for processing login requests using facebook credentials
                                                    {
                                                        console.log("facebook token = " + msg.token + ' facebook user = ' + msg.user);
                                               
                                                        login_facebook(jwt, msg);
                                                    });

                        socket.on('login_google', function(msg) // used for processing login requests using facebook credentials
                                                    {
                                                        console.log("a google login has been sought");
                                               
                                                        login_google(jwt, msg);
                                                    });	

                        socket.on('login_twitter', function(msg) // used for processing login requests using facebook credentials
                                                    {
                                                        console.log("a google login has been sought");
                                               
                                                        login_twitter(jwt, msg);
                                                    });														
										   
                        socket.on('logout', function(msg)  // used for processing logout requests
                                                {
                                                    console.log( msg.email +' '+ msg.password);
                                                });
                        socket.on('where', function(msg)     // used to process where requests - getting events from a given location (location, city, state)
                                                {
                                                    console.log( msg.email +' '+ msg.password);
                                                });
                        socket.on('when', function(msg)     // used to process when requests - getting events happening at a certain time (Date)
                                                {
                                                    console.log( msg.email +' '+ msg.password);
                                                });
                        socket.on('search', function(msg)     // used to process and return search results
                                                {
                                                    console.log( msg.email +' '+ msg.password);
                                                });


                    });
};



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  Name: isLoggedIn
//
//  Arguments : - jwt - json web token
//              - token - an encrypted token
//
//  Return Type: - null or a user id
//
// This function is used to decode a user token. If the token is valid the function return the id of the user who owns the token. If the token is invalid then the function returns null
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var isLoggedIn = function(jwt, token)
{
    console.log("executing is logged in");

    if(token === null)
    {
       console.log("the token is null");
       return null;
    }

    var decoded_user = null;
    // check the sessionStore to see ife token is stored here
    liveSessions.get(token, function(err, reply)
                            {
                                if(err)
                                {
                                   console.log("error trying to get token");
                                   return null;
                                }
                                if(reply)  // we found the token
                                {
                                   // the token is in the store. now check to see if it is still valid
                                   jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                       {
                                                                           // console.log("executing post event nullllllllll....44444444");
                                                                           if(decoded)   // if decoded then get the id and find the user's information
                                                                           {
                                                                               console.log("logged in Token = " +decoded);
                                                                               decoded_user = JSON.stringify(decoded.macco); // get the decoded id
                                                                               return;
                                                                           }
                                                                       });

                                }
                            });

     console.log("we are outside and the decoded token is: = " +decoded_user);
     return decoded_user;
};

                                                                               



var signup = function(email, password, verification)
{
    console.log("verification = " +verification);
														

    User.findOne({'local.email' : email}, function(err, user)
                                          {
                                              // if an error occurs return
                                              if(err)
                                              {
                                                  console.log('Signup error occured: ' +err);
                                                  sock.emit('signup', {email : email, password : password, status : "error"});

                                                  return false; // done(err);
                                              }
                                              // if the user already exists
                                              if(user)
                                              {
                                                  console.log('This user already exists : ' +email);
                                                  sock.emit('signup', {email : email, password : password, status : "userExists"});

                                                  return; // done(null, false, {message : 'user already exists'}); // they use done(null, false); here
                                              }
                                              else // if we reach here then there is no user with this email address
                                              {
                                                  // create the user
                                                  var newUser = new User();
                                                  // seting the local credentials for the user /////////////////////////////////////////////////////////////////////////
                                                  newUser.local.email = email;
                                                  newUser.local.password = newUser.generateHash(password);
                                                  newUser.verified = false;
                                                  newUser.signup = new Date();
                                                  newUser.deletedOn = null;
												  
                                                  // we also need to set up the Anonymous profile for the use to post events /////////////////////////////////////////////
                                                  
                                                  // saving the user
                                                  newUser.save(function(err)
                                                               {
                                                                   if(err)
                                                                   {
                                                                      console.log('Error in saving created user: ' +err);
                                                                      sock.emit('signup', {email : email, password : password, status : "error"});
                                                                      return;
                                                                   }

                                                                   console.log('User registration successful');

                                                                   // we also need to set up the Anonyous profile for the user to start posting events ////////////////////////////////////////
                                                                   

                                                                   // arrange verification email ///////////////////////////////////////////////////////////////////////////////////////////////////
                                  

                                                                   // generating entry and code for storage and sending
                                                                   var veriCode = new Veri();
                                                                   veriCode.code = veriCode.generateHash(email + uuid.v4);
                                                                   veriCode.email = email;
                                                                   veriCode.createDate = new Date();
                                                                   veriCode.verified = false;
                                                                   veriCode.VerifiedOn = null;
                                                                   var code = veriCode.code;

                                                                   //saving the verification Code into the database
                                                                   veriCode.save(function(err, veri)
                                                                                 {
                                                                                     if(err)
                                                                                     {
                                                                                         console.log('Error in saving the verification code ' +err);
                                                                                         throw err;
                                                                                         // perhaps we should send a message
                                                                                         return;
                                                                                     }
                                                  
                                                                                          if(verification === 'email')
                                                                                          {
                                                                                              // the email section /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                              var nodemailer = require('nodemailer');  // get nodemailer object

                                                                                              // create reusable transporter object using SMTP transport
                                                                                              var transporter = nodemailer.createTransport({ service: 'Mailgun',
                                                                                                                                              auth: { user: 'postmaster@noreply.xivents.co',
                                                                                                                                                      pass: '8b3c956c2423d7850eb95ac29f11c97e' }
                                                                                                                                           });

                                                                                              // NB! No need to recreate the transporter object. You can use
                                                                                              // the same transporter object for all e-mails

                                                                                              // setup e-mail data with unicode symbols
                                                                                              var mailOptions = { from: '<postmaster@noreply.xivents.co>', // sender address
                                                                                                                  to: email + ', jachian@gmail.com', // list of receivers
                                                                                                                  subject: '(xivents.co)- Signup Account Response', // Subject line
                                                                                                                  text: ' ', // plaintext body
                                                                                                                  html: verification_email(code)  // html body
                                                                                                                };

                                                                                              // send mail with defined transport object
                                                                                              transporter.sendMail(mailOptions, function(error, info)
                                                                                              {
                                                                                                  if(error)
                                                                                                  {
                                                                                                      sock.emit('signup', {status : "error_could_not_send_code"});
                                                                                                      return console.log(error);
                                                                                                  }
                                                                                       
                                                                                                  sock.emit('signup', {status : "success"});   // send success to application
                                                                                                  console.log("Email sent to user %%%%%%%");
                                                                                                  return;
                                                                                              });
                                                                                           }
                                                                                           if(verification === 'sms')
                                                                                           {
                                                                                                // send the sms
                                                                                                sock.emit('signup', {status : "success"});
                                                                                           }

                                                                                     console.log("verification code saved");
                                                                              
                                                                                 }); 


                                                               });
                                                   
                                              }
                                           });

};




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name: getVerificationCode
//
// Arguments: email - the email address of the user we wish to get the code for
//
// Return Type: none
//
// This function is used to when we want to have a user's verification code sent to them.
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var getVerificationCode = function(email)
{
	
    Veri.findOne({'email' : email}, function(err, code)
                                          {
                                              // if an error occurs return
                                              if(err)
                                              {
                                                  console.log('getting verification email error occured: ' +err);
                                                  sock.emit('get_verification_code', { status : "error"});

                                                  return false; // done(err);
                                              }
                                              // if the email is found in the list.
                                              if(code)
                                              {
                                                  console.log('email found in verifiaction list');
                                                  // check to see if the account has already been verified
                                                  if(code.verified === true)
                                                  {
                                                      sock.emit('get_verification_code', {status : "email_not_found"});     // the account has already been verified
                                                      return;
                                                  }
 
                                                  // the email section /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                  var nodemailer = require('nodemailer');  // get nodemailer object

                                                  // create reusable transporter object using SMTP transport
                                                  var transporter = nodemailer.createTransport( { service: 'Mailgun',
                                                                                                  auth: { user: 'postmaster@noreply.xivents.co',
                                                                                                          pass: '8b3c956c2423d7850eb95ac29f11c97e' }
                                                                                                });

                                                  // NB! No need to recreate the transporter object. You can use
                                                  // the same transporter object for all e-mails

                                                  // setup e-mail data with unicode symbols
                                                  var mailOptions = { from: '<postmaster@noreply.xivents.co>', // sender address
                                                                      to: email + ', jachian@gmail.com', // list of receivers
                                                                      subject: '(xivents.co)- Verification Code', // Subject line
                                                                      text: ' ', // plaintext body
                                                                      html: retrieve_verification_email(code.code) // html body
                                                                    };

                                                 // send mail with defined transport object
                                                 transporter.sendMail(mailOptions, function(error, info)
                                                                                   {
                                                                                       if(error)
                                                                                       {
                                                                                           sock.emit('get_verification_code', {status : "could_not_send_code"});
                                                                                           return console.log(error);
                                                                                       }
                                                                                       // console.log('Message sent: ' + info.response);
                                                                                       sock.emit('get_verification_code', {status : "success"});   // send success to application
                                                                                       console.log("mail sent to : " +email);

                                                                                   });
                                                 return;

                                              }
                                              else // if we reach here if code is invalid
                                              {
                                                  // send the appropriate message
                                                  console.log('there is no user with that email');

                                                  sock.emit('get_verification_code', {status : "email_not_found"});

                                                  return;
                                              }
                                           });


};


var forgotPassword = function(email)
{	
    User.findOne({'local.email' : email}, function(err, user)
                                          {
                                              if(err)
                                              {
                                                  sock.emit('forgot_password', {status : "error"});
                                                  return;
                                              }
                                              if(user)
                                              {
												  // change the password
												  var pass = randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
												  
												  user.local.password = user.generateHash(pass);
												  
												  // saving the user
                                                  user.save(function(err)
                                                            {
                                                                 if(err)
                                                                 {
                                                                    console.log('Error in saving created user: ' +err);
                                                                    sock.emit('forgot_password', {status : "error"});
                                                                    return;
                                                                 }

												  
												  
                                                                 // the email section /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                 var nodemailer = require('nodemailer');  // get nodemailer object

                                                                 // create reusable transporter object using SMTP transport
                                                                  var transporter = nodemailer.createTransport( { service: 'Mailgun',
                                                                                                  auth: { user: 'postmaster@noreply.xivents.co',
                                                                                                          pass: '8b3c956c2423d7850eb95ac29f11c97e' }
                                                                                                });

                                                                 // NB! No need to recreate the transporter object. You can use
                                                                 // the same transporter object for all e-mails
                                                                 // setup e-mail data with unicode symbols
                                                                 var mailOptions = { from: '<postmaster@noreply.xivents.co>', // sender address
                                                                      to: email + ', jachian@gmail.com', // list of receivers
                                                                      subject: '(xivents.co)-- Forgot Password Response', // Subject line
                                                                      text: ' ', // plaintext body
                                                                      html: forgot_password_email(pass)  // html body
                                                                    };

                                                                 // send mail with defined transport object
                                                                 transporter.sendMail(mailOptions, function(error, info)
                                                                                   {
                                                                                       if(error)
                                                                                       {
                                                                                           sock.emit('forgot_password', {status : "error"});
                                                                                           return console.log(error);
                                                                                       }
                                                                                       // console.log('Message sent: ' + info.response);
                                                                                       sock.emit('forgot_password', {status : "success"});   // send success to application
                                                                                       console.log("mail sent to : " +email+ " password : " +pass);

                                                                                   });
  
                                                                 return;
                                                            });
                                                    // sock.emit('forgot_password', {status : "wrong_email"});

                                                    return;
                                               }
											   
											   //email not found
											   sock.emit('forgot_password', {status : "wrong_email"});
											   return;
										    });
};



var validate = function(code)
{
    Veri.findOne({'code' : code}, function(err, code)
                                          {
                                              // if an error occurs return
                                              if(err)
                                              {
                                                  console.log('Code verification occured: ' +err);
                                                  sock.emit('codeVerify', { status : "error"});

                                                  return false; // done(err);
                                              }
                                              // code is valid
                                              if(code)
                                              {
                                                  console.log('code confirmed');
												  
	                                              //var Cipher = require('easy-encryption');     //create the easy-encryption interface
	
	                                              //var email_cipher = new Cypher({secret: 'm@cco-xx872xx-occ@m-XiVents!!-2016-1.0-sufferer-&-m@cco-xx872xx-occ@m-XiVents!!-2016-1.0'});
	                                              //var password_cipher = new Cypher({secret: 'pass-445m*d544-@ssap-XiVents!!-2016-1.0-sufferer-&-pass-445m*d544-@ssap-XiVents!!-2016-1.0$$%^^^-Today'});

                                                  //var en_email = email_cipher. encrypt(email);
	                                              //var en_password = email_cipher.encrypt(password);  // store encrypted password

                                                  // check to see if the account has already been verified.                          

                                                  // now verify the account
                                                  User.findOne({'local.email': code.email}, function(err, user)
                                                                                          {
                                                                                              if(user)
                                                                                              {
                                                                                                  user.verified = true;    // this indicates verified

                                                                                                  user.save(function(err)
                                                                                                  {
                                                                                                      if(err)
                                                                                                      {
                                                                                                          sock.emit('codeVerify', {status : "error"});
                                                                                                          return;
                                                                                                      }
                                                                                                      // sock.emit('codeVerify', {status : "success"});

                                                                                                  });
                                                                                                  return;
                                                                                              } 

                                                                                              if(err)
                                                                                              {
                                                                                                 sock.emit('codeVerify', {status : "error"});
                                                                                                 return;
                                                                                              }
                                                                                          });
																						   
                                                  if(code.verified === true) // if the account has already been validated
                                                  {
                                                      sock.emit('codeVerify', {status : "invalid_code"});
                                                      return;
                                                  }
 
                                                  // if the account has not already been validated    
                                                  code.verified = true;
                                                  code.verifiedOn = new Date();
                                                  // code._id = code._id;
                                                  // code.createDate = code.createDate;
                                                  // code.password = code.password;
                                                  // code.email = code.email;
                                                  // code.code = code.code;

                                                  code.save(function(err)
                                                            {
                                                                if(err)
                                                                {
                                                                    sock.emit('codeVerify', {status : "error"});
                                                                    return;
                                                                }
                                                                // if success
                                                                sock.emit('codeVerify', {status : "success"});
                                                            });

                                                  return; // done(null, false, {message : 'user already exists'}); // they use done(null, false); here
                                              }
                                              else // if we reach here if code is invalid
                                              {
                                                  // send the appropriate message
                                                  console.log('invalide code');
                                                  sock.emit('codeVerify', {status : "invalidCode"});

                                                  return;
                                              }
                                           });

};



var login = function(jwt, email, password, msg)
{								 	
    User.findOne({'local.email' : email}, function(err, user)
                                          {
                                              if(err)
                                              {
                                                  console.log('login error : ' +err);
                                                  sock.emit('login', {status : "error"});
                                                  return;
                                              }
                                              if(user) // user with this email address found
                                              {
                                                  // check for valid password
                                                  if(user.validPassword(password))
                                                  {
                                                      console.log('valide username and password');

                                                      // check to see if the account is verified
                                                      if(user.verified === false)
                                                      {
                                                          sock.emit('login', {status : "account_not_verified"});

                                                          return;
                                                      }

                                                      var token = jwt.sign({macco : user._id, time : new Date()}, '721@achian@127', { expiresInMinutes: 60*5 }, {algorithm: 'RS256'});

                                                      liveSessions.set(token, token);   //store token in redis
                                                      // test to see what happens

                                                      // get profiles of this user
                                                      Profile.find({uid : user.id, deletedOn : null}, function(err, profiles)
                                                                                     {
                                                                                         if(profiles)
                                                                                         {
                                                                                             sock.emit('login', {macco : token, myProfiles : JSON.stringify(profiles), status : "success"});
																							 console.log('login profiles : ' +profiles);
                                                                                             return;
                                                                                         }
                                                                                         sock.emit('login', {macco : token, myProfiles : null, status : "success"});
																						 console.log('login profiles null : ');
                                                                                     });

                                                      // new we can set log information here
                                                      var log = new Log();
                                                      log.user = user._id;
                                                      log.city = msg.location.city;
                                                      log.country = msg.location.country;
                                                      log.hostname = msg.location.hostname;
                                                      log.ip = msg.location.ip;
                                                      log.latlong = msg.location.latlong;
                                                      log.org = msg.location.org;
                                                      log.date = new Date();

                                                      log.save(function(err)
                                                               {
                                                                    if(err)
                                                                    {
                                                                        console.log("error saving log in Login() function");
                                                                    }
                                                               });



                                                  }
                                                  else
                                                  {
                                                      console.log('invalid password for logging in');
                                                      sock.emit('login', {status : "incorrectPassword"});
                                                  }
                                                  return;
                                              }
                                              else
                                              {
                                                  console.log('invalide email for logging on');
                                                  sock.emit('login', {status : "incorrectEmail"});
                                              }   
                                          });


};

var login_facebook = function(jwt, msg)
{								 	
    User.findOne({'facebook.id' : msg.user, 'service' : 'facebook'}, function(err, f_user)
                                          {
                                              if(err)
                                              {
                                                  console.log('login_facebook error : ' +err);
                                                  sock.emit('login_facebook', {status : "error"});
                                                  return;
                                              }
											  
                                              if(f_user) // user with this id can be found
                                              {
                                                      var token = jwt.sign({macco : f_user._id, time : new Date()}, '721@achian@127', { expiresInMinutes: 60*5 }, {algorithm: 'RS256'});

                                                      liveSessions.set(token, token);   //store token in redis
                                                      // test to see what happens

                                                      // get profiles of this user
                                                      Profile.find({uid : f_user.id, deletedOn : null}, function(err, profiles)
                                                                                                        {
                                                                                                           if(profiles)
                                                                                                           {
                                                                                                              sock.emit('login', {macco : token, myProfiles : JSON.stringify(profiles), status : "success"});
                                                                                                              return;
                                                                                                           }
                                                                                                           sock.emit('login', {macco : token, myProfiles : null, status : "success"});
                                                                                                        });

                                                      // new we can set log information here
                                                      var log = new Log();
                                                      log.user = f_user._id;
                                                      log.city = msg.location.city;
                                                      log.country = msg.location.country;
                                                      log.hostname = msg.location.hostname;
                                                      log.ip = msg.location.ip;
                                                      log.latlong = msg.location.latlong;
                                                      log.org = msg.location.org;
                                                      log.date = new Date();

                                                      log.save(function(err)
                                                               {
                                                                    if(err)
                                                                    {
                                                                        console.log("error saving log in Login() function");
                                                                    }
                                                               });



                                               }
                                               else  // we need to create a  new user record in our database
                                               {
                                                      console.log('first time login with facebook so we need to create a user');
													  
                                                      // create the user
                                                      var new_user = new User();
													  
                                                      // seting the facebook credentials for the user /////////////////////////////////////////////////////////////////////////
                                                      new_user.facebook.id = msg.user;
                                                      new_user.facebook.token = new_user.token;
													  new_user.service = "facebook";
                                                      new_user.verified = true;
                                                      new_user.signup = new Date();
                                                      new_user.deletedOn = null;
												  
                                                      // we also need to set up the Anonymous profile for the use to post events /////////////////////////////////////////////
                                                  
                                                      // saving the user
                                                      new_user.save(function(err, usr)
                                                                   {
                                                                       if(err)
                                                                       {
                                                                           console.log('Error in saving created user from facebook: ' +err);
                                                                           sock.emit('login', {status : "error"});
                                                                       }
                                                                       console.log('User registration successful from facebook');

                                                                       var token = jwt.sign({macco : usr._id, time : new Date()}, '721@achian@127', { expiresInMinutes: 60*5 }, {algorithm: 'RS256'});

                                                                       liveSessions.set(token, token);   //store token in redis
                                                                       // test to see what happens
																	   
																	   sock.emit('login', {macco : token, myProfiles : null, status : "success"});
																	   
																	   // new we can set log information here
                                                                       var log = new Log();
                                                                       log.user = usr._id;
                                                                       log.city = msg.location.city;
                                                                       log.country = msg.location.country;
                                                                       log.hostname = msg.location.hostname;
                                                                       log.ip = msg.location.ip;
                                                                       log.latlong = msg.location.latlong;
                                                                       log.org = msg.location.org;
                                                                       log.date = new Date();

                                                                       log.save(function(err)
                                                                       {
                                                                           if(err)
                                                                           {
                                                                               console.log("error saving log in Login() function");
                                                                           }
                                                                       });
																   });




                                               }
 
                                          });
};


var login_google = function(jwt, msg)
{								 	
    User.findOne({'google.id' : msg.user_id, 'service' : "google"}, function(err, google_user)
                                          {
                                              if(err)
                                              {
                                                  console.log('login_google error : ' +err);
                                                  sock.emit('login', {status : "error"});
                                                  return;
                                              }
											  
                                              if(google_user) // user with this id can be found
                                              {
												  
												  console.log("google id = " +google_user+ "********  login info = " +msg);
                                                      var token = jwt.sign({macco : google_user._id, time : new Date()}, '721@achian@127', { expiresInMinutes: 60*5 }, {algorithm: 'RS256'});

                                                      liveSessions.set(token, token);   //store token in redis
                                                      // test to see what happens

                                                      // get profiles of this user
                                                      Profile.find({uid : google_user.id, deletedOn : null}, function(err, profiles)
                                                                                                        {
                                                                                                           if(profiles)
                                                                                                           {
                                                                                                              sock.emit('login', {macco : token, myProfiles : JSON.stringify(profiles), status : "success"});
                                                                                                              return;
                                                                                                           }
                                                                                                           sock.emit('login', {macco : token, myProfiles : null, status : "success"});
                                                                                                        });

                                                      // new we can set log information here
                                                      var log = new Log();
                                                      log.user = google_user._id;
                                                      log.city = msg.location.city;
                                                      log.country = msg.location.country;
                                                      log.hostname = msg.location.hostname;
                                                      log.ip = msg.location.ip;
                                                      log.latlong = msg.location.latlong;
                                                      log.org = msg.location.org;
                                                      log.date = new Date();

                                                      log.save(function(err)
                                                               {
                                                                    if(err)
                                                                    {
                                                                        console.log("error saving log in Login() function");
                                                                    }
                                                               });



                                               }
                                               else  // we need to create a  new user record in our database
                                               {
                                                      console.log('first time login with facebook so we need to create a user');
													  
                                                      // create the user
                                                      var new_user = new User();
													  
                                                      // seting the facebook credentials for the user /////////////////////////////////////////////////////////////////////////

                                                      new_user.google.token = msg.token;
													  new_user.google.email = msg.email;
													  new_user.google.name = msg.name;
													  new_user.google.id = msg.user_id;
													  new_user.service = "google";
                                                      new_user.verified = true;
                                                      new_user.signup = new Date();
                                                      new_user.deletedOn = null;
												  
                                                      // we also need to set up the Anonymous profile for the use to post events /////////////////////////////////////////////
                                                  
                                                      // saving the user
                                                      new_user.save(function(err, usr)
                                                                   {
                                                                       if(err)
                                                                       {
                                                                           console.log('Error in saving created user from facebook: ' +err);
                                                                           sock.emit('login', {status : "error"});
                                                                       }
                                                                       console.log('User registration successful from facebook');

                                                                       var token = jwt.sign({macco : usr._id, time : new Date()}, '721@achian@127', { expiresInMinutes: 60*5 }, {algorithm: 'RS256'});

                                                                       liveSessions.set(token, token);   //store token in redis
                                                                       // test to see what happens
																	   																	   																	   
																	   sock.emit('login', {macco : token, myProfiles : null, status : "success"});  // we could do something here and automatically generate a profile
																	   
																	   // new we can set log information here
                                                                       var log = new Log();
                                                                       log.user = usr._id;
                                                                       log.city = msg.location.city;
                                                                       log.country = msg.location.country;
                                                                       log.hostname = msg.location.hostname;
                                                                       log.ip = msg.location.ip;
                                                                       log.latlong = msg.location.latlong;
                                                                       log.org = msg.location.org;
                                                                       log.date = new Date();

                                                                       log.save(function(err)
                                                                       {
                                                                           if(err)
                                                                           {
                                                                               console.log("error saving log in Login() function");
                                                                           }
                                                                       });
																   });




                                               }
 
                                          });
};


var login_twitter = function(jwt, msg)
{								 	
    User.findOne({'twitter.id' : msg.user_id, 'service' : "twitter"}, function(err, twitter_user)
                                          {
                                              if(err)
                                              {
                                                  console.log('login_google error : ' +err);
                                                  sock.emit('google', {status : "error"});
                                                  return;
                                              }
											  
                                              if(twitter_user) // user with this id can be found
                                              {												  
												  console.log("twitter id = " +twitter_user+ "********  login info = " +msg);
                                                  var token = jwt.sign({macco : twitter_user._id, time : new Date()}, '721@achian@127', { expiresInMinutes: 60*5 }, {algorithm: 'RS256'});

                                                      liveSessions.set(token, token);   //store token in redis
                                                      // test to see what happens

                                                      // get profiles of this user
                                                      Profile.find({uid : twitter_user.id, deletedOn : null}, function(err, profiles)
                                                                                                        {
                                                                                                           if(profiles)
                                                                                                           {
                                                                                                              sock.emit('login', {macco : token, myProfiles : JSON.stringify(profiles), status : "success"});
                                                                                                              return;
                                                                                                           }
                                                                                                           sock.emit('login', {macco : token, myProfiles : null, status : "success"});
                                                                                                        });

                                                      // new we can set log information here
                                                      var log = new Log();
                                                      log.user = twitter_user._id;
                                                      log.city = msg.location.city;
                                                      log.country = msg.location.country;
                                                      log.hostname = msg.location.hostname;
                                                      log.ip = msg.location.ip;
                                                      log.latlong = msg.location.latlong;
                                                      log.org = msg.location.org;
                                                      log.date = new Date();

                                                      log.save(function(err)
                                                               {
                                                                    if(err)
                                                                    {
                                                                        console.log("error saving log in Login() function");
                                                                    }
                                                               });

                                               }
                                               else  // we need to create a  new user record in our database
                                               {
                                                      console.log('first time login with facebook so we need to create a user');
													  
                                                      // create the user
                                                      var new_user = new User();
													  
                                                      // seting the facebook credentials for the user /////////////////////////////////////////////////////////////////////////
                                                      new_user.twitter.token = msg.token;
													  new_user.twitter.name = msg.name;
													  new_user.twitter.screen_name = msg.screen_name;
													  new_user.twitter.id = msg.user_id;
													  new_user.service = "twitter";
                                                      new_user.verified = true;
                                                      new_user.signup = new Date();
                                                      new_user.deletedOn = null;
												  
                                                      // we also need to set up the Anonymous profile for the use to post events /////////////////////////////////////////////
                                                  
                                                      // saving the user
                                                      new_user.save(function(err, usr)
                                                                   {
                                                                       if(err)
                                                                       {
                                                                           console.log('Error in saving created user from facebook: ' +err);
                                                                           sock.emit('login', {status : "error"});
                                                                       }
                                                                       console.log('User registration successful from facebook');

                                                                       var token = jwt.sign({macco : usr._id, time : new Date()}, '721@achian@127', { expiresInMinutes: 60*5 }, {algorithm: 'RS256'});

                                                                       liveSessions.set(token, token);   //store token in redis
                                                                       // test to see what happens
																	   																	   																	   
																	   sock.emit('login', {macco : token, myProfiles : null, status : "success"});  // we could do something here and automatically generate a profile
																	   
																	   // new we can set log information here
                                                                       var log = new Log();
                                                                       log.user = usr._id;
                                                                       log.city = msg.location.city;
                                                                       log.country = msg.location.country;
                                                                       log.hostname = msg.location.hostname;
                                                                       log.ip = msg.location.ip;
                                                                       log.latlong = msg.location.latlong;
                                                                       log.org = msg.location.org;
                                                                       log.date = new Date();

                                                                       log.save(function(err)
                                                                       {
                                                                           if(err)
                                                                           {
                                                                               console.log("error saving log in Login() function");
                                                                           }
                                                                       });
																   });




                                               }
 
                                          });
};


var getCurrentUser = function(jwt, token)
{
    if(token === null)
    {
       sock.emit('current_user', {status : 'no_token_given'})    // if no token or null token was passed as the message
       return;
    }
    
    // check the sessionStore to see ife token is stored here
    liveSessions.get(token, function(err, reply)
                            {
                                if(err)
                                {
                                   console.log("error trying to get token " +err);
                                   sock.emit('current_user', {status : 'error_getting_token : ' +err.message});
                                }
                                if(reply)  // we found the token
                                {
                                   // the token is in the store. now check to see if it is still valid
                                   jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                       {
                                                                           if(err) // most likely token is expired
                                                                           {
                                                                               sock.emit('current_user', {status : 'token_expired : ' +err.message});
                                                                               // delete the current token
                                                                               liveSessions.del(reply, function(err)
                                                                                                       {
                                                                                                           console.log("could not destroy the token : " +err);
                                                                                                       });

                                                                           }
                                                                           if(decoded)   // if decoded then get the id and find the user's information
                                                                           {
                                                                               var id = decoded.macco; // get the decoded id

                                                                               User.findOne({'_id' : id}, function(err, user)
                                                                               {
                                                                                   if(err)
                                                                                   {
                                                                                      sock.emit('current_user', {status : "error_getting_user_info"});
                                                                                      return;
                                                                                   }
                                                                                   if(user) // user with this id found - gather user data
                                                                                   {
                                                                                      sock.emit('current_user', {status : "success", currentUser : user.local.email, profiles : user.profiles});
                                                                                      return;
                                                                                   }
                                                                               });
                                                                           }
                                                                       });
                                   
                                }
                            });

    return;
};



var postEvent = function(jwt, msg)
{
    console.log("executing post event");

    if(msg.token === null)
    {
       sock.emit('post_event', {status : 'no_token_given'});    // if no token or null token was passed as the message
       return;
    }

    // check the sessionStore to see ife token is stored here
    liveSessions.get(msg.token, function(err, reply)
                               {
                                    console.log("executing post event nullllllllll...2222222");
                                if(err)
                                {
                                   console.log("error trying to get token for posting an event ");
                                   sock.emit('post_event', {status : 'error_getting_token'});
                                }
                                if(reply)  // we found the token
                                {
                                   // the token is in the store. now check to see if it is still valid
                                   jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                       {
                                                                           // console.log("executing post event nullllllllll....44444444");
                                                                           if(decoded)   // if decoded then get the id and find the user's information
                                                                           {
                                                                               var id = decoded.macco; // get the decoded id

                                                                               User.findOne({'_id' : id}, function(err, user)
                                                                               {
                                                                                   
                                                                                   if(err)
                                                                                   {
                                                                                      sock.emit('post_event', {status : "error_getting_user_info"});
                                                                                      return;
                                                                                   }
                                                                                   if(user) // user with this id found - gather user data
                                                                                   {
                                                                                      var event = new Event();

                                                                                      event.hash = "";
                                                                                      event.userId = id;
                                                                                      event.profileId = msg.profileId;
                                                                                      event.profileName = msg.profileName;
                                                                                      event.handle = msg.handle;
                                                                                      event.postedOn = new Date();
                                                                                      event.title = msg.eve.title;                          //
                                                                                      event.details = msg.eve.details;
                                                                                      event.link = msg.eve.link;                            //
                                                                                      event.startDate = msg.eve.sdate;                      //
                                                                                      event.endDate = msg.eve.edate;                        //
                                                                                      event.startTime = msg.eve.stime;                      //
                                                                                      event.endTime = msg.eve.etime;                        //
                                                                                      event.location = msg.eve.location;                    //
                                                                                      event.street = msg.eve.street;                        //
                                                                                      event.city = msg.eve.city;                            //
                                                                                      event.state = msg.eve.state;                          //
                                                                                      event.lat = msg.eve.lat;                      //
                                                                                      event.lng = msg.eve.lng;
                                                                                      event.tags = msg.eve.tags;                            //
                                                                                      event.status = "scheduled";                           
                                                                                      event.comments = null;           // this is initially null because as we create an even there are initially no comments
                                                                                      event.pins = null;               // no pins either when we first create the event
                                                                                      event.image = msg.eve.image;             // no image either
                                                                                      event.deleted = false;           // the event has not been deleted
                                                                                      event.deletedOn = null;          // the even has not been deleted
                                                                                      event.lastEdited = null;         // this even has never been edited
                 
                                                                                      //saving the event
                                                                                      event.save(function(err)
                                                                                      {
                                                                                          if(err)
                                                                                          {
                                                                                               console.log('Error in saving the event ' +err);
                                                                                               sock.emit('post_event', {status : "error_saving_event"});

                                                                                               return;
                                                                                          }

                                                                                          //get the updated list of events
                                                                                          Event.find({'profileId' : msg.profileId}, function(err, list)
                                                                                                                                    {
                                                                                                                                        if(list)
                                                                                                                                        {
                                                                                                                                            sock.emit('post_event', {status : "success", myEvents : list});
                                                                                                                                            return;
                                                                                                                                        }
                                                                                                                                        sock.emit('post_event', {status : "success_no_list"});
                                                                                                                                    });
          
                                                                                          console.log("event saved");

                                                                                          // update external tag list
                                                                                          var tag = new Tag();
                                                                                          tag.eventId = event._id;
																						  tag.userId = id ; // the user idea that posted event
																						  tag.profileId = msg.profileId;   // the id of the profile that posted the event.
                                                                                          tag.tag = event.title;
                                                                                          tag.tag1 = null;
                                                                                          tag.save(function(err)
                                                                                                   {
                                                                                                       if(err)
                                                                                                         console.log("could not save a tag");
                                                                                                   });

                                                                                          tag = new Tag();
                                                                                          tag.eventId = event._id;
																						  tag.userId = id ; // the user idea that posted event
																						  tag.profileId = msg.profileId;   // the id of the profile that poste
                                                                                          tag.tag = event.location;
                                                                                          tag.tag1 = null;
                                                                                          tag.save(function(err)
                                                                                                   {
                                                                                                       if(err)
                                                                                                         console.log("could not save a tag");
                                                                                                   });

                                                                                          tag = new Tag();
                                                                                          tag.eventId = event._id;
																						  tag.userId = id ; // the user idea that posted event
																						  tag.profileId = msg.profileId;   // the id of the profile that poste
                                                                                          tag.tag = event.city;
                                                                                          tag.tag1 = null;
                                                                                          tag.save(function(err)
                                                                                                   {
                                                                                                       if(err)
                                                                                                         console.log("could not save a tag");
                                                                                                   });

                                                                                          tag = new Tag();
                                                                                          tag.eventId = event._id;
																						  tag.userId = id ; // the user idea that posted event
																						  tag.profileId = msg.profileId;   // the id of the profile that poste
                                                                                          tag.tag = event.street;
                                                                                          tag.tag1 = null;
                                                                                          tag.save(function(err)
                                                                                                   {
                                                                                                       if(err)
                                                                                                         console.log("could not save a tag");
                                                                                                   });

                                                                                          tag = new Tag();
                                                                                          tag.eventId = event._id;
																						  tag.userId = id ; // the user idea that posted event
																						  tag.profileId = msg.profileId;   // the id of the profile that poste
                                                                                          tag.tag = event.state;
                                                                                          tag.tag1 = null;
                                                                                          tag.save(function(err)
                                                                                                   {
                                                                                                       if(err)
                                                                                                         console.log("could not save a tag");
                                                                                                   });
                                                                                          
                                                                                          // setting user defined tags
                                                                                          for(var i = 0; i < msg.eve.tags.length; i++)
                                                                                          {
                                                                                              tag = new Tag();
                                                                                              tag.eventId = event._id;
																							  tag.userId = id ; // the user idea that posted event
																						      tag.profileId = msg.profileId;   // the id of the profile that poste
                                                                                              tag.tag = event.tags[i];
                                                                                              tag.tag1 = null;
                                                                                              tag.save(function(err)
                                                                                                       {
                                                                                                          if(err)
                                                                                                             console.log("could not save user defined tags");
                                                                                                       });
                                                                                          }


                                                                                          // location information - from where the event was created
                                                                                          tag = new Tag();
                                                                                          tag.eventId = event._id;
																						  tag.userId = id ; // the user idea that posted event
																						  tag.profileId = msg.profileId;   // the id of the profile that poste
                                                                                          tag.tag = msg.location.ip;
                                                                                          tag.tag1 = null;
                                                                                          tag.save(function(err)
                                                                                                   {
                                                                                                       if(err)
                                                                                                         console.log("could not save a tag");
                                                                                                   });

                                                                                          tag = new Tag();
                                                                                          tag.eventId = event._id;
																						  tag.userId = id ; // the user idea that posted event
																						  tag.profileId = msg.profileId;   // the id of the profile that poste
                                                                                          tag.tag = msg.location.hostname;
                                                                                          tag.tag1 = null;
                                                                                          tag.save(function(err)
                                                                                                   {
                                                                                                       if(err)
                                                                                                         console.log("could not save a tag");
                                                                                                   });

                                                                                          tag = new Tag();
                                                                                          tag.eventId = event._id;
																						  tag.userId = id ; // the user idea that posted event
																						  tag.profileId = msg.profileId;   // the id of the profile that poste
                                                                                          tag.tag = msg.location.city;
                                                                                          tag.tag1 = null;
                                                                                          tag.save(function(err)
                                                                                                   {
                                                                                                       if(err)
                                                                                                         console.log("could not save a tag");
                                                                                                   });

                                                                                          tag = new Tag();
                                                                                          tag.eventId = event._id;
																						  tag.userId = id ; // the user idea that posted event
																						  tag.profileId = msg.profileId;   // the id of the profile that poste
                                                                                          tag.tag = msg.location.country;
                                                                                          tag.tag1 = null;
                                                                                          tag.save(function(err)
                                                                                                   {
                                                                                                       if(err)
                                                                                                         console.log("could not save a tag");
                                                                                                   });

                                                                                          tag = new Tag();
                                                                                          tag.eventId = event._id;
																						  tag.userId = id ; // the user idea that posted event
																						  tag.profileId = msg.profileId;   // the id of the profile that poste
                                                                                          tag.tag = msg.location.lat;
                                                                                          tag.tag1 = msg.location.lng;
                                                                                          tag.save(function(err)
                                                                                                   {
                                                                                                       if(err)
                                                                                                         console.log("could not save a tag");
                                                                                                   });

                                                                                          tag = new Tag();
                                                                                          tag.eventId = event._id;
																						  tag.userId = id ; // the user idea that posted event
																						  tag.profileId = msg.profileId;   // the id of the profile that poste
                                                                                          tag.tag = msg.location.org;
                                                                                          tag.tag = null;
                                                                                          tag.save(function(err)
                                                                                                   {
                                                                                                       if(err)
                                                                                                         console.log("could not save a tag");
                                                                                                   });


                                                                                          return;
                                                                                      });
                                                                                   }
                                                                                   else
                                                                                      sock.emit('post_event', {status : "user_account_inactive"});
                                                                               });
                                                                           }
                                                                           else 
                                                                           {
                                                                               console.log("executing post event dddssss - errrr");

                                                                               sock.emit('post_event', {status : 'token_expired'});
                                                                               // delete the current token
                                                                               liveSessions.del(reply, function(err)
                                                                                                       {
                                                                                                           console.log("could not destroy the token : " +err);
                                                                                                       });
                                                                           }

                                                                       });

                                }
                        
                        });
    return;
};



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name : editEvent
//
// Arguments : jwt - Java web token
//             msg - message from the client
//
//
// Return Type : None
//
// This function is used to edit events that are already in the store
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
var editEvent = function(jwt, msg)
{
    console.log("executing edit event");

    if((msg.token === undefined) || (msg.token === null))
    {
       sock.emit('edit_event', {status : 'edit_event_no_token_given'});    // if no token or null token was passed as the message
       return;
    }


    // check the sessionStore to see ife token is stored here
    liveSessions.get(msg.token, function(err, reply)
                                {
                                   if(err)
                                   {
                                      console.log("error trying to get token for editing an event ");
                                      sock.emit('post_event', {status : 'error_getting_token'});
                                      return;
                                   }
                                   if(reply)  // we found the token
                                   {
                                        // the token is in the store. now check to see if it is still valid
                                        jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                            {
                                                                                if(decoded)   // if decoded then get the id and find the user's information
                                                                                {
                                                                                    var id = decoded.macco; // get the decoded id
                                                                                    Event.findOne({_id : msg.eventId}, function(err, event)      // look for the event in question
                                                                                                                   {
                                                                                                                        if(err)
                                                                                                                        {
                                                                                                                            sock.emit('edit_event', {status : 'edit_event_error_finding_event'});
                                                                                                                            return;
                                                                                                                        }
                          
                                                                                                                        // no error means we must have got the documnt. now update it
                                                                                                                        event.title = msg.eve.title;                          //
                                                                                                                        event.details = msg.eve.details;                      //
                                                                                                                        event.link = msg.eve.link;                            //
                                                                                                                        event.startDate = msg.eve.sdate;                      //
                                                                                                                        event.endDate = msg.eve.edate;                        //
                                                                                                                        event.startTime = msg.eve.stime;                      //
                                                                                                                        event.endTime = msg.eve.etime;                        //
                                                                                                                        event.location = msg.eve.location;                    //
                                                                                                                        event.street = msg.eve.street;                        //
                                                                                                                        event.city = msg.eve.city;                            //
                                                                                                                        event.state = msg.eve.state;                          //
                                                                                                                        event.lat = msg.eve.lat;                      //
                                                                                                                        event.lng = msg.eve.lng;
                                                                                                                        event.tags = msg.eve.tags;                            //
                                                                                                                        event.lastEdited = new Date();                        // stamp with the date it was edited

                                                                                                                        if((msg.eve.image !== undefined) && (msg.eve.image !== null) && (msg.eve.image !== ""))
                                                                                                                           event.image = msg.eve.image;        

                                                                                                                        event.save(function(err)     // saving the changes
                                                                                                                                   {
                                                                                                                                       if(err)
                                                                                                                                       {
                                                                                                                                           sock.emit('edit_event', {status : 'edit_event_error_saving_event'});
                                                                                                                                           return;
                                                                                                                                       }
																																	   
                                                                                                                                       // if no error means we were successful
																																	   //get the updated list of events
                                                                                                                                       Event.find({'profileId' : event.profileId}, function(err, list)
                                                                                                                                       {
                                                                                                                                           if(list)
                                                                                                                                           {
                                                                                                                                               sock.emit('edit_event', {status : "success", myEvents : list});
                                                                                                                                               return;
                                                                                                                                           }
                                                                                                                                           sock.emit('edit_event', {status : "success_no_list"});
                                                                                                                                       });
																																	   
																																	   
																																	   
                                                                                                                                         //  [[[[ sock.emit('edit_event', {status : 'edit_event_success', eventId : msg.eve.eventId});


                                                                                                                                       // find and delete all the tags for this event
                                                                                                                                       Tag.find({eventId : msg.eventId}, function(err, list)
                                                                                                                                                                         {
                                                                                                                                                                            if(list)
                                                                                                                                                                            {
                                                                                                                                                                               console.log("tags to be deleted: " +list);

                                                                                                                                                                               for(var i = 0; i < list.length; i++)
                                                                                                                                                                               {
                                                                                                                                                                                  list[i].remove(function(err)
                                                                                                                                                                                                 {
                                                                                                                                                                                                   if(err)
                                                                                                                                                                                                     console.log("could not delete tags");
                                                                                                                                                                                                 });
                                                                                                                                                                               }
                                                                                                                                                                            }
                                                                                                                                                                         });


                                                                                                                                       // update external tag list
                                                                                                                                       var tag = new Tag();
                                                                                                                                       tag.eventId = msg.eventId;
																																	   tag.userId = id ; // the user idea that posted event
																						                                               tag.profileId = event.profileId;   // the id of the profile that poste
                                                                                                                                       tag.tag = event.title;
                                                                                                                                       tag.tag1 = null;
                                                                                                                                       tag.save(function(err)
                                                                                                                                       {
                                                                                                                                          if(err)
                                                                                                                                            console.log("could not save a tag");
                                                                                                                                       });

                                                                                                                                       tag = new Tag();
                                                                                                                                       tag.eventId = msg.eventId;
																																	   tag.userId = id ; // the user idea that posted event
																						                                               tag.profileId = event.profileId;   // the id of the profile that poste
                                                                                                                                       tag.tag = event.location;
                                                                                                                                       tag.tag1 = null;
                                                                                                                                       tag.save(function(err)
                                                                                                                                       {
                                                                                                                                          if(err)
                                                                                                                                             console.log("could not save a tag");
                                                                                                                                       });

                                                                                                                                       tag = new Tag();
                                                                                                                                       tag.eventId = msg.eventId;
																																	   tag.userId = id ; // the user idea that posted event
																						                                               tag.profileId = event.profileId;   // the id of the profile that poste
                                                                                                                                       tag.tag = event.city;
                                                                                                                                       tag.tag1 = null;
                                                                                                                                       tag.save(function(err)
                                                                                                                                                {
                                                                                                                                                    if(err)
                                                                                                                                                      console.log("could not save a tag");
                                                                                                                                                });

                                                                                                                                       tag = new Tag();
                                                                                                                                       tag.eventId = msg.eventId;
																																	   tag.userId = id ; // the user idea that posted event
																						                                               tag.profileId = event.profileId;   // the id of the profile that poste
                                                                                                                                       tag.tag = event.street;
                                                                                                                                       tag.tag1 = null;
                                                                                                                                       tag.save(function(err)
                                                                                                                                       {
                                                                                                                                          if(err)
                                                                                                                                            console.log("could not save a tag");
                                                                                                                                       });

                                                                                                                                       tag = new Tag();
                                                                                                                                       tag.eventId = msg.eventId;
																																	   tag.userId = id ; // the user idea that posted event
																						                                               tag.profileId = event.profileId;   // the id of the profile that poste
                                                                                                                                       tag.tag = event.state;
                                                                                                                                       tag.tag1 = null;
                                                                                                                                       tag.save(function(err)
                                                                                                                                                {
                                                                                                                                                   if(err)
                                                                                                                                                     console.log("could not save a tag");
                                                                                                                                                });


                                                                                                                                       // setting user defined tags
                                                                                                                                       for(var i = 0; i < msg.eve.tags.length; i++)
                                                                                                                                       {
                                                                                                                                           tag = new Tag();
                                                                                                                                           tag.eventId = event._id;
																																		   tag.userId = id ; // the user idea that posted event
																						                                                   tag.profileId = event.profileId;   // the id of the profile that poste
                                                                                                                                           tag.tag = event.tags[i];
                                                                                                                                           tag.save(function(err)
                                                                                                                                                    {
                                                                                                                                                        if(err)
                                                                                                                                                           console.log("could not save user defined tags");
                                                                                                                                                    });
                                                                                                                                       }

                                                                                                                                       // location information - from where the event was created
                                                                                                                                       tag = new Tag();
                                                                                                                                       tag.eventId = event._id;
																																	   tag.userId = id ; // the user idea that posted event
																						                                               tag.profileId = event.profileId;   // the id of the profile that poste
                                                                                                                                       tag.tag = msg.location.ip;
                                                                                                                                       tag.tag1 = null;
                                                                                                                                       tag.save(function(err)
                                                                                                                                                {
                                                                                                                                                    if(err)
                                                                                                                                                      console.log("could not save a tag");
                                                                                                                                                });

                                                                                                                                       tag = new Tag();
                                                                                                                                       tag.eventId = event._id;
																																	   tag.userId = id ; // the user idea that posted event
																						                                               tag.profileId = event.profileId;   // the id of the profile that poste
                                                                                                                                       tag.tag = msg.location.hostname;
                                                                                                                                       tag.tag1 = null;
                                                                                                                                       tag.save(function(err)
                                                                                                                                                {
                                                                                                                                                   if(err)
                                                                                                                                                     console.log("could not save a tag");
                                                                                                                                                });

                                                                                                                                       tag = new Tag();
                                                                                                                                       tag.eventId = event._id;
																																	   tag.userId = id ; // the user idea that posted event
																						                                               tag.profileId = event.profileId;   // the id of the profile that poste
                                                                                                                                       tag.tag = msg.location.city;
                                                                                                                                       tag.tag1 = null;
                                                                                                                                       tag.save(function(err)
                                                                                                                                                {
                                                                                                                                                    if(err)
                                                                                                                                                      console.log("could not save a tag");
                                                                                                                                                });
                                                                                          

                                                                                                                                       tag = new Tag();
                                                                                                                                       tag.eventId = event._id;
																																	   tag.userId = id ; // the user idea that posted event
																						                                               tag.profileId = event.profileId;   // the id of the profile that poste
                                                                                                                                       tag.tag = msg.location.country;
                                                                                                                                       tag.tag1 = null;
                                                                                                                                       tag.save(function(err)
                                                                                                                                                {
                                                                                                                                                   if(err)
                                                                                                                                                      console.log("could not save a tag");
                                                                                                                                                });

                                                                                                                                       tag = new Tag();
                                                                                                                                       tag.eventId = event._id;
																																	   tag.userId = id ; // the user idea that posted event
																						                                               tag.profileId = event.profileId;   // the id of the profile that poste
                                                                                                                                       tag.tag = msg.location.lat;
                                                                                                                                       tag.tag1 = msg.location.lng;
                                                                                                                                       tag.save(function(err)
                                                                                                                                                {
                                                                                                                                                    if(err)
                                                                                                                                                      console.log("could not save a tag");
                                                                                                                                                });

                                                                                                                                       tag = new Tag();
                                                                                                                                       tag.eventId = event._id;
																																	   tag.userId = id ; // the user idea that posted event
																						                                               tag.profileId = event.profileId;   // the id of the profile that poste
                                                                                                                                       tag.tag = msg.location.org;
                                                                                                                                       tag.tag1 = null;
                                                                                                                                       tag.save(function(err)
                                                                                                                                                {
                                                                                                                                                   if(err)
                                                                                                                                                      console.log("could not save a tag");
                                                                                                                                                });





                                                                                                                                   });
                                                                                                                   });
       

                                                                                 }
                                                                            });
                                   }
                                });

};


var shareEventViaEmail = function(jwt, msg)
{
    console.log("executing share event via email");

    if((msg.token === undefined) || (msg.token === null))
    {
       sock.emit('share_event_via_email', {status : 'share_event_via_email_no_token_given', details : msg.details});    // if no token or null token was passed as the message
       return;
    }


    // check the sessionStore to see ife token is stored here
    liveSessions.get(msg.token, function(err, reply)
                                {
                                   if(err)
                                   {
                                      console.log("error trying to get token for sharing event via email");
                                      sock.emit('share_event_via_email', {status : 'share_event_via_email_error_getting_token', details : msg.details});
                                      return;
                                   }
                                   if(reply)  // we found the token
                                   {
                                        // the token is in the store. now check to see if it is still valid
                                        jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                            {
                                                                                if(decoded)   // if decoded then make sure the event is in the store and try to share it
                                                                                {
                                                                                    var id = decoded.macco; // get the decoded id
                                                                                    
                                                                                    Event.findOne({_id : msg.details.event_id}, function(err, ev)
                                                                                                                       {
                                                                                                                           if(err)
                                                                                                                           {
                                                                                                                               sock.emit('share_event_via_email', {status : 'share_event_via_email_event_not_found', details : msg.details});
                                                                                                                               return;
                                                                                                                           }
                                                                                                                           console.log("found event successfully .....");
																														   // we found the event so now let us try to email it to the targets
																														   
																														   // the email section //////////////////////////////////////////////////////////////
                                                                                                                           var nodemailer = require('nodemailer');  // get nodemailer object

                                                                                                                           // create reusable transporter object using SMTP transport
                                                                                                                           var transporter = nodemailer.createTransport( { service: 'Mailgun',
                                                                                                                                                                              auth: { user: 'postmaster@noreply.xivents.co',
                                                                                                                                                                              pass: '8b3c956c2423d7850eb95ac29f11c97e' }
                                                                                                                                                                         });

                                                                                                                           // NB! No need to recreate the transporter object. You can use
                                                                                                                           // the same transporter object for all e-mails
                                                                                                                           // setup e-mail data with unicode symbols
                                                                                                                           var mailOptions = { from: '<postmaster@noreply.xivents.co>', // sender address
                                                                                                                                                 to: String(msg.details.email), // list of receivers
                                                                                                                                            subject: '(xivents.co)- ' +msg.details.sender+ ' Thought you might be interested in this event.', // Subject line
                                                                                                                                               text: ' ', // plaintext body
                                                                                                                                               html: msg.details.sharing // html body
                                                                                                                                             };

                                                                                                                          // send mail with defined transport object
                                                                                                                          transporter.sendMail(mailOptions, function(error, info)
                                                                                                                                                            {
                                                                                                                                                                if(error)
                                                                                                                                                                {
                                                                                                                                                                    sock.emit('share_event_via_email', {status : "error_sending_event"});
                                                                                                                                                                    return console.log(error);
                                                                                                                                                                }
                                                                                                                                                                // console.log('Message sent: ' + info.response);
                                                                                                                                                                sock.emit('share_event_via_email', {status : "success"});   // send success to application
                                                                                                                                                                console.log("mail sent to : " +msg.details.email);

                                                                                                                                                            });

                                                                                                                       });
                                                                                  
                                                                                }

                                                                                sock.emit('share_event_via_email', {status : 'share_event_via_email_invalid_token', return_messge : msg});
                                                                            });
                                   }
                                });

};




var deleteEvent = function(jwt, msg)
{
    console.log("executing delete event");

    if((msg.token === undefined) || (msg.token === null))
    {
       sock.emit('delete_event', {status : 'delete_event_no_token_given', index : msg.eventIndex});    // if no token or null token was passed as the message
       return;
    }


    // check the sessionStore to see ife token is stored here
    liveSessions.get(msg.token, function(err, reply)
                                {
                                   if(err)
                                   {
                                      console.log("error trying to get token for deleting an event ");
                                      sock.emit('delete_event', {status : 'delete_event_error_getting_token', index : msg.eventIndex});
                                      return;
                                   }
                                   if(reply)  // we found the token
                                   {
                                        // the token is in the store. now check to see if it is still valid
                                        jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                            {
                                                                                if(decoded)   // if decoded then get the id and find the user's information
                                                                                {
                                                                                    var id = decoded.macco; // get the decoded id
                                                                                    
                                                                                    Event.findOne({_id : msg.eventId}, function(err, event)
                                                                                                                       {
                                                                                                                           if(err)
                                                                                                                           {
                                                                                                                               sock.emit('delete_event', {status : 'delete_event_not_found', index : msg.eventIndex});
                                                                                                                               return;
                                                                                                                            }
                                                                                                                            console.log("found event successfully .....");
                                                                                                                            var current_date = new Date();

                                                                                                                            if(event.endDate > current_date)
                                                                                                                            {
                                                                                                                                 event.remove(function(err)
                                                                                                                                              {
                                                                                                                                                   if(err)
                                                                                                                                                   {
                                                                                                                                                        sock.emit('delete_event', {status : 'delete_event_error_deleting', event : event, index : msg.eventIndex});
                                                                                                                                                        return;
                                                                                                                                                   }
                                                                                                                                                   console.log("event successfully deleted");
                                                                                                                                                   sock.emit('delete_event', {status : 'delete_event_success', event : event, index : msg.eventIndex});
                                                                                                                                              });
                                                                                                                                 
                                                                                                                                 // find and delete all the tags for this event
                                                                                                                                 Tag.find({eventId : msg.eventId}, function(err, list)
                                                                                                                                                                      {
                                                                                                                                                                           if(list)
                                                                                                                                                                           {
                                                                                                                                                                               console.log("tags to be deleted: " +list);

                                                                                                                                                                               for(var i = 0; i < list.length; i++)
                                                                                                                                                                               {
                                                                                                                                                                                  list[i].remove(function(err)
                                                                                                                                                                                                 {
                                                                                                                                                                                                   if(err)
                                                                                                                                                                                                     console.log("could not delete tags");
                                                                                                                                                                                                 });
                                                                                                                                                                               }
                                                                                                                                                                           }
                                                                                                                                                                      });


                                                                                                                                 return;
                                                                                                                            }
                                                                                                                            console.log("no event deleted.......");

                                                                                                                            sock.emit('delete_event', {status : 'delete_event_past_event', index : msg.eventIndex});
                                                                                                                       });
                                                                                  
                                                                                }

                                                                                sock.emit('delete_event', {status : 'delete_event_invalid_token', returnMessage : msg, index : msg.eventIndex});
                                                                            });
                                   }
                                });

};



var changeProfileEvents = function(jwt, msg)
{
    console.log("executing change profile events event");

    if((msg.token === undefined) || (msg.token === null))
    {
       sock.emit('change_profile_events', {status : 'no_token_given'});    // if no token or null token was passed as the message
       return;
    }


    // check the sessionStore to see ife token is stored here
    liveSessions.get(msg.token, function(err, reply)
                                {
                                   if(err)
                                   {
                                      sock.emit('change_profile_events', {status : 'error_getting_token', index : msg.eventIndex});
                                      return;
                                   }
                                   if(reply)  // we found the token
                                   {
                                        // the token is in the store. now check to see if it is still valid
                                        jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                            {
                                                                                if(decoded)   // if decoded then get the id and find the user's information
                                                                                {
                                                                                    Event.find({userId : decoded.macco, profileId : msg.profile_id}, function(err, list)
                                                                                                                                                     {
                                                                                                                                                         if(list)
                                                                                                                                                         {
                                                                                                                                                             sock.emit('change_profile_events', {status : 'success', events_list : list});
                                                                                                                                                             return;
                                                                                                                                                         }
                                                                                                                                                         
                                                                                                                                                         sock.emit('change_profile_events', {status : 'change_profile_events_error'});
                                                                                                                                                     });
                                                                                    return;
                                                                                }

                                                                                socket.emit('change_profile_events', {status : 'invalid_token'});
                                                                            });

                                   }
                                });
};





var postLocation = function(state, city, lat, lng)
{
    // if(loc === null)
      // return;

    // look to see if the state is already there
    Locations.findOne({state : state}, function(err, loc)
                                   {
                                       if(loc) // if present search for the city
                                       {
                                           Locations.findOne({state : state, 'cities.city' : city}, function(err, found)
                                                                                                 {
                                                                                                     if(found)  // we have found the state and city we are looking for // we update the values
                                                                                                     {
                                                                                                        found.lat = found.lat + lat;
                                                                                                        found.lng = found.lng + lng;
                                                                                                        found.num = found.num + 1;

                                                                                                        found.save(function(err)
                                                                                                                   {
                                                                                                                      if(err)
                                                                                                                         console.log("could not successfully updated coordinates 000");

                                                                                                                      console.log("location successfully updated coordinates");
                                                                                                                   });
                      
                                                                                                        console.log("location found and coordinates updated");
                                                                                                        return;
                                                                                                     }
                                                                                                     if(err) // error just return
                                                                                                     {
                                                                                                        console.log("error trying to find location in database");
                                                                                                        return;
                                                                                                     }
                                                                                                  
                                                                                                     // have not found the city so we put it in
                                                                                                     loc.cities.push({city : city,
                                                                                                                      lat : lat,
                                                                                                                      lng : lng,
                                                                                                                      num : 1});

                                                                                                     loc.save(function(err)
                                                                                                              {
                                                                                                                  if(err)
                                                                                                                    console.log("could not successfully post location 111");

                                                                                                                  console.log("location successfully posted 1111");
                                                                                                               });
                                                                                                 });
                                            return;
                                        }

                                        if(err)
                                        {
                                            console.log("error finding the state in the database");
                                            return;
                                        }
                                        // we reach here if there is no state or city we are searching for - we create a new entry and save it
                                        var newLoc = new Locations();

                                        newLoc.state = state;
                                        newLoc.cities.push({city : city,
                                                            lat : lat,
                                                            lng : lng,
                                                            num : 1});

                                        newLoc.save(function(err)
                                                    {
                                                       if(err)
                                                          console.log("could not successfully post location 112");

                                                       console.log("location successfully posted 112");
                                                    });
                                                                                                          
                                  });
    
};
                                                                               
                             
                                           
var getEvents = function(jwt, msg)
{
   
   var eventsList = null;

   if((msg.city === null) && (msg.state === null))
   {
        sock.emit('get_events', {status : 'null_cities_states'});
        return;
   }

   if(msg.city === null)
   {
        Event.find({state : msg.state}, function(err, list)
                                        {
                                             if(list)
                                             {

                                                  sock.emit('get_events', {status : 'success', events : list});
                                                  return;
                                             }


                                             if(error)
                                             {
                                                  console.log("error getting events");
                                                  sock.emit('get_events', {status : 'error_finding_events'});
                                                  return;
                                             }

                                        }).sort({"startDate" : -1});

         return;
    }

   if(msg.state === null)
   {
        Event.find({city : msg.city}, function(err, list)
                                        {
                                             if(list)
                                             {


                                                  sock.emit('get_events', {status : 'success', events : list});
                                                  return;
                                             }


                                             if(error)
                                             {
                                                  console.log("error getting events");
                                                  sock.emit('get_events', {status : 'error_finding_events'});
                                                  return;
                                             }

                                        }).sort({"startDate" : -1});

         return;
    }

    // if we reach here then we have not been given nulls in the message
    Event.find({state : msg.state, city : msg.city}, function(err, list)
                                                     {
                                                         if(list)
                                                         {
                                                             sock.emit('get_events', {status : 'success', events : list});
                                                             return;
                                                         }

                                                         if(error)
                                                         {
                                                             console.log("error getting events");
                                                             sock.emit('get_events', {status : 'error_finding_events'});
                                                             return;
                                                         }

                                                      }).sort({"startDate" : -1});

    return;
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// In Use
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var getEventsMyLocation = function(jwt, msg)
{
    var latitude = parseFloat(msg.my_location.lat);
    var longitude = parseFloat(msg.my_location.lng);
	

    var query = Event.find({lat : {$gt : latitude - 2.0, $lt : latitude + 2.0}, lng : {$gt : longitude - 2.0, $lt : longitude + 2.0}, endDate : {$gt : new Date()}}).sort({startDate : 1});
	
    query.exec(function(err, near)
               {
                    if(near)
                    {
                        sock.emit('get_events_my_location', {status : 'success', list : near, board : msg.board});
                        return;
                    }
                    sock.emit('get_events_my_location', {status : 'error_finding_evets', board : msg.board});
                    return;

               });   
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// In Use -used to get all upcoming events on the platform
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var getEventsAll = function(jwt, msg)
{
    var query = Event.find({endDate : {$gt : new Date()}}).sort({startDate : 1});
	
    query.exec(function(err, near)
               {
                    if(near)
                    {
                        sock.emit('get_events_all', {status : 'success', list : near, board : msg.board});
                        return;
                    }
                    sock.emit('get_events_all', {status : 'error_finding_events', board : msg.board});
                    return;

               });   
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name: searchEvents
//
// Arguments : jwt - java web token
//             msg - message from the client
//
// Return Type : None
//
// This function is used to generate search results from text input or tags
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var searchEvents = function(jwt, msg)
{
	console.log("in the search events function");
	
	if((msg.search_list === undefined) || (msg.search_list === null))
	{
		sock.emit('search_events', {status : 'empty_search_list'});
		return;
	}
	
	var query = Tag.find({tag : {$in : msg.search_list}}).select('eventId -_id');
	
	//executing the query
	query.exec(function(err, list)
	           {
				   if(err)
				   {
					    console.log("in the search events function - error finding events");
						sock.emit('search_events', {status : 'error_finding_events_tags', search_list : msg.search_list});
                        return;					   
				   }
				   
				   console.log("tag list = " +list+ " type of = " +typeof(list));
                   // now we try to get the list of event that satisfy this
				   var events_list = [];
				   for(var i = 0; i < list.length; i++)
				   {
					   events_list.push(list[i].eventId);
				   }	

                   console.log("events-list = " +events_list);				   
				   
				   
                   var query1 = Event.find({_id : {$in : events_list}, endDate : {$gt : new Date()}}).sort({startDate : 1});

                   query1.exec(function(err, results)
				               {
									if(err)
									{
									    sock.emit('search_events', {status : 'error_finding_events', search_list : msg.search_list});
										return;
                                    }
									
				                    // console.log("tag list = " +list+ " type of = " +typeof(list));	
						            sock.emit('search_events', {status : 'search_events_success', search_list : msg.search_list, results : results});
									return;									
				               });				   
	           });
	
	/*
	Tag.find({tag : {$in : msg.search_list},{"eventId": 1, "_id" : 0}}, function(err, list)
		                                      {
												  if(err)
												  {
													 console.log("in the search events function");
													 sock.emit('search_events', {status : 'error_finding_ events_tags', search_list : msg.search_list});
                                                     return;													 
												  }
	                              
								                  console.log("tag list = " +list+ " type of = " +typeof(list));
                                                  // we found a a list
                                                  Event.find({_id : {$in : list}}, function(err, results)
													                               {
																						if(err)
																						{
																							sock.emit('search_events', {status : 'error_finding_events', search_list : msg.search_list});
																						}	return;
														  
														                                sock.emit('search_events', {status : 'search_events_success', search_list : msg.search_list, results : results});
																						return;
													                               });

                                                  sock.emit('search_events', {status : 'error_finding_events', search_list : msg.search_list});
												  
											  });
											 
	return;		*/					 
};



var getEventsByAccount = function(jwt, msg)
{
     if((msg.token === null) || (msg.token === undefined))
     {
         sock.emit('get_events_by_account', {status : 'null_message_sent'});

         return;
     }

     //getting token and login credentials
     liveSessions.get(msg.token, function(err, reply)
                                 {
                                
                                      if(err)
                                      {
                                           console.log("error trying to get token");
                                           sock.emit('get_events_by_account', {status : 'error_getting_token'});
                                      }
                                      if(reply)  // we found the token
                                      {
                                           // console.log("executing post event nullllllllll....3333333");
                                           // the token is in the store. now check to see if it is still valid
                                           jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                               {
                                                                                   // console.log("executing post event nullllllllll....44444444");
                                                                                   if(decoded)   // if decoded then get the id and find the user's information
                                                                                   {
                                                                                       var id = decoded.macco; // get the decoded id
                                   
                                                                                       Event.find({ postedByID : id }, function(err, list)
                                                                                                                       {
                                                                                                                           if(list)
                                                                                                                           {
                                                                                                                                sock.emit('get_events_by_account', {status : 'success', events : JSON.stringify(list)});
                                                                                                                                console.log(list);
                                                                                                                                return;
                                                                                                                            }

                                                                                                                            if(err)
                                                                                                                            {
                                                                                                                                sock.emit('get_events_by_account', {status : 'get_events_by_account_error'});
                                                                                                                                return;
                                                                                                                            }

                                                                                                                            sock.emit('get_events_by_account', {status : 'get_events_by_account_no_list'});
                                                                                   
                                                                                                                        });
                                                                                   } 
                                                                                   else
                                                                                   {
                                                                                       sock.emit('get_events_by_account', {status : 'token_expired'});
                                                                               
                                                                                       // delete the current token
                                                                                       liveSessions.del(reply, function(err)
                                                                                                               {
                                                                                                                  console.log("could not destroy the token : " +err);
                                                                                                               });
                                                                                   }

                                                                               });

                                      }

                                  });

     return;
};



var getEventsByProfile = function(jwt, msg)
{
     if((msg.token === undefined) || (msg.token === null))
     {
         sock.emit('get_events_by_profile', {status : 'null_token_sent'});

         return;
     }

     //getting token and login credentials
     liveSessions.get(msg.token, function(err, reply)
                                 {

                                      if(err)
                                      {
                                           // console.log("error trying to get token");
                                           sock.emit('get_events_by_profile', {status : 'error_getting_token'});
                                      }
                                      if(reply)  // we found the token
                                      {
                                           // console.log("executing post event nullllllllll....3333333");
                                           // the token is in the store. now check to see if it is still valid
                                           jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                               {
                                                                                   if(decoded)   // if decoded then get the id and find the user's information
                                                                                   {
                                                                                       var id = decoded.macco; // get the decoded id

                                                                                       Event.find({ profileId : msg.profile_id }, function(err, list)
                                                                                                                       {
                                                                                                                           if(list)
                                                                                                                           {
                                                                                                                                sock.emit('get_events_by_profile', {status : 'success', events : JSON.stringify(list)});
                                                                                                                                console.log(list);
                                                                                                                                return;
                                                                                                                           }

                                                                                                                           if(err)
                                                                                                                           {
                                                                                                                                sock.emit('get_events_by_profile', {status : 'get_events_by_profile_error'});
                                                                                                                                return;
                                                                                                                           }

                                                                                                                           sock.emit('get_events_by_profile', {status : 'get_events_by_profile_no_list'});

                                                                                                                        });
                                                                                   }
                                                                                   else
                                                                                   {
                                                                                       sock.emit('get_events_by_profile', {status : 'token_expired'});

                                                                                       // delete the current token
                                                                                       liveSessions.del(reply, function(err)
                                                                                                               {
                                                                                                                  console.log("could not destroy the token : " +err);
                                                                                                               });
                                                                                   }

                                                                               });

                                      }

                                  });

     return;
};


var getEventsByUser = function(jwt, msg)
{
     if((msg.token === undefined) || (msg.token === null))
     {
         sock.emit('get_events_by_profile', {status : 'null_token_sent'});

         return;
     }

     //getting token and login credentials
     liveSessions.get(msg.token, function(err, reply)
                                 {

                                      if(err)
                                      {
                                           // console.log("error trying to get token");
                                           sock.emit('get_events_by_profile', {status : 'error_getting_token'});
                                      }
                                      if(reply)  // we found the token
                                      {
                                           // console.log("executing post event nullllllllll....3333333");
                                           // the token is in the store. now check to see if it is still valid
                                           jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                               {
                                                                                   if(decoded)   // if decoded then get the id and find the user's information
                                                                                   {
                                                                                       var id = decoded.macco; // get the decoded id

                                                                                       Event.find({ userId : id }, function(err, list)
                                                                                                                       {
                                                                                                                           if(list)
                                                                                                                           {
                                                                                                                                sock.emit('get_events_by_profile', {status : 'success', events : JSON.stringify(list)});
                                                                                                                                console.log(list);
                                                                                                                                return;
                                                                                                                           }

                                                                                                                           if(err)
                                                                                                                           {
                                                                                                                                sock.emit('get_events_by_profile', {status : 'get_events_by_profile_error'});
                                                                                                                                return;
                                                                                                                           }

                                                                                                                           sock.emit('get_events_by_profile', {status : 'get_events_by_profile_no_list'});

                                                                                                                        });
                                                                                   }
                                                                                   else
                                                                                   {
                                                                                       sock.emit('get_events_by_profile', {status : 'token_expired'});

                                                                                       // delete the current token
                                                                                       liveSessions.del(reply, function(err)
                                                                                                               {
                                                                                                                  console.log("could not destroy the token : " +err);
                                                                                                               });
                                                                                   }

                                                                               });

                                      }

                                  });

     return;
};











/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// This is used to retrieve from the database the events that are to happen on the specified date at the given location coordinates
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var getEventsOn = function(jwt, msg)
{

   var eventsList = null;
   // var event_date = moment(msg.startDate).format("ddd MMM D, YYYY");

   console.log("event date = " +msg.startDateString);


   if((msg.city === null) && (msg.state === null))
   {

       console.log("both are null");

       Event.find({startDateString : msg.startDateString},
                                 function(err, list)
                                 {
                                     if(list)
                                     {
                                        sock.emit('get_events_on', {status : 'success_on', events : list});
                                        return;
                                     }
                                     if(error)
                                     {
                                        console.log("error getting events");
                                        sock.emit('get_events_on', {status : 'error_finding_events'});
                                        return;
                                     }

                                  });

        return;
   }


   if(msg.city === null)
   {

        console.log("city is null");

        Event.find({state : msg.state, startDateString : msg.startDateString},
                                        function(err, list)
                                        {
                                             if(list)
                                             {
                                                  sock.emit('get_events_on', {status : 'success_on', events : list});
                                                  return;
                                             }


                                             if(error)
                                             {
                                                  console.log("error getting events");
                                                  sock.emit('get_events_on', {status : 'error_finding_events'});
                                                  return;
                                             }

                                        });

         return;
    }

   if(msg.state === null)
   {

        console.log("state is null");

        Event.find({city : msg.city, startDateString : msg.startDateString}, 
                                        function(err, list)
                                        {
                                             if(list)
                                             {
                                                  sock.emit('get_events_on', {status : 'success_on', events : list});
                                                  return;
                                             }


                                             if(error)
                                             {
                                                  console.log("error getting events");
                                                  sock.emit('get_events_on', {status : 'error_finding_events'});
                                                  return;
                                             }

                                        });

         return;
    }

    console.log("non are null");

    // if we reach here then we have not been given nulls in the message
    Event.find({state : msg.state, city : msg.city, startDateString : msg.startDateString},
                                                     function(err, list)
                                                     {
                                                         if(list)
                                                         {
                                                             sock.emit('get_events_on', {status : 'success_on', events : list});
                                                             return;
                                                         }

                                                         if(error)
                                                         {
                                                             console.log("error getting events");
                                                             sock.emit('get_events_on', {status : 'error_finding_events'});
                                                             return;
                                                         }

                                                      });

    return;
};


var getEventsBy = function(jwt, msg)
{

   var eventsList = null;

   var event_date = moment(msg.startDate).toDate();


   if((msg.city === null) && (msg.state === null))
   {

        Event.find({postedBy : msg.postedBy, startDate : {"$gte": new Date (event_date.getFullYear(), event_date.getMonth(), event_date.getDay()),
                                                                             "$lt": new Date (event_date.getFullYear(), event_date.getMonth(), event_date.getDay())}},
                                        function(err, list)
                                        {
                                             if(list)
                                             {
                                                  sock.emit('get_events_by', {status : 'success_by', events : list});
                                                  return;
                                             }


                                             if(error)
                                             {
                                                  console.log("error getting events");
                                                  sock.emit('get_events_by', {status : 'error_finding_events'});
                                                  return;
                                             }

                                        });

        return;
   }


   if(msg.city === null)
   {
        Event.find({state : msg.state, postedBy : msg.postedBy, startDate : {"$gte": new Date (event_date.getFullYear(), event_date.getMonth(), event_date.getDay()),
                                                                             "$lt": new Date (event_date.getFullYear(), event_date.getMonth(), event_date.getDay())}}, 
                                        function(err, list)
                                        {
                                             if(list)
                                             {
                                                  sock.emit('get_events_by', {status : 'success_by', events : list});
                                                  return;
                                             }


                                             if(error)
                                             {
                                                  console.log("error getting events");
                                                  sock.emit('get_events_by', {status : 'error_finding_events'});
                                                  return;
                                             }

                                        });

         return;
    }

   if(msg.state === null)
   {
        Event.find({city : msg.city, postedBy : msg.postedBy, startDate : {"$gte": new Date (event_date.getFullYear(), event_date.getMonth(), event_date.getDay()),
                                                                           "$lt": new Date (event_date.getFullYear(), event_date.getMonth(), event_date.getDay())}}, 
                                        function(err, list)
                                        {
                                             if(list)
                                             {
                                                  sock.emit('get_events_by', {status : 'success_by', events : list});
                                                  return;
                                             }


                                             if(error)
                                             {
                                                  console.log("error getting events");
                                                  sock.emit('get_events_by', {status : 'error_finding_events'});
                                                  return;
                                             }

                                        });

         return;
    }

    // if we reach here then we have not been given nulls in the message
    Event.find({state : msg.state, city : msg.city, postedBy : msg.postedBy, startDate : {"$gte": new Date (event_date.getFullYear(), event_date.getMonth(), event_date.getDay()),
                                                                                          "$lt": new Date (event_date.getFullYear(), event_date.getMonth(), event_date.getDay())}}, 
                                                     function(err, list)
                                                     {
                                                         if(list)
                                                         {
                                                             sock.emit('get_events_by', {status : 'success_by', events : list});
                                                             return;
                                                         }

                                                         if(error)
                                                         {
                                                             console.log("error getting events");
                                                             sock.emit('get_events_by', {status : 'error_finding_events'});
                                                             return;
                                                         }

                                                      });

    return;
};

var getLocations = function()
{
    //get the entire array of locations
    Locations.find(function(err,loc)
                   {
                       if(loc)
                       {
                           sock.emit('get_locations', {locations : loc});
                           return;
                       }
                       if(err)
                       {
                           console.log("counld not generate the entire list of location");
                           return;
                       }
                   });

};

var postProfile = function(jwt, message)
{

    if(message.token === null)
    {
       sock.emit('post_profile', {status : 'no_token_given'})    // if no token or null token was passed as the message
       return;
    }

    // check the sessionStore to see ife token is stored here
    liveSessions.get(message.token, function(err, reply)
                            {
                                if(err)
                                {
                                   console.log("error trying to get token " +err);
                                   sock.emit('post_profile', {status : 'error_getting_token : ' +err.message});
                                }
                                if(reply)  // we found the token
                                {
                                   // the token is in the store. now check to see if it is still valid
                                   jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                       {
                                                                           if(err) // most likely token is expired
                                                                           {
                                                                               sock.emit('post_profile', {status : 'token_expired : ' +err.message});
                                                                               // delete the current token
                                                                               liveSessions.del(reply, function(err)
                                                                                                       {
                                                                                                           console.log("could not destroy the token : " +err);
                                                                                                       });

                                                                           }
                                                                           if(decoded)   // if decoded then get the id and find the user's information
                                                                           {
                                                                               var id = decoded.macco; // get the decoded id

                                                                               User.findOne({'_id' : id, 'profile._id' : message.proId}, function(err, found)
                                                                               {
                                                                                   if(err)
                                                                                   {
                                                                                      sock.emit('post_profile', {status : "error_getting_user_profile"});
                                                                                      return;
                                                                                   }
                                                                                   if(found) // user with this id found - gather user data
                                                                                   {
                                                                                       found.pName = message.pro.pName;
                                                                                       found.details = message.pro.details;
                                                                                       found.address = message.pro.address;
                                                                                       found.website = message.pro.website;
                                                                                       found.email = message.pro.email;
                                                                                       found.phone = message.pro.phone;
                                                                                       

                                                                                       found.save(function(err)
                                                                                                  {
                                                                                                     if(err)
                                                                                                     {
                                                                                                        console.log("could not successfully save/update the prrofile");
                                                                                                        sock.emit('post_profile', {status : "error_saving_profile"});
                                                                                                        return;
                                                                                                     }

                                                                                                     console.log("Profiles successfully saved/updated");
                                                                                                     sock.emit('post_profile', {status : "success"});
                                                                                                  });

                                                                                      return;
                                                                                   }
                                                                               });
                                                                           }
                                                                       });

                                }
                            });

};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// This function is used to get all the profiles owned by a given user
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var getProfiles = function(jwt, token)
{

    if(token === null)
    {
         sock.emit('get_my_profiles_list', {status : 'null_token_recieved'});

         return;
    }

    // check the sessionStore to see ife token is stored here
    liveSessions.get(token, function(err, reply)
                            {
                                console.log("executing get profiles");

                                if(err)
                                {
                                   console.log("error trying to get token for accessing profiles list");
                                   sock.emit('get_my_profiles_list', {status : 'error_getting_token'});

                                   return;
                                }
                                if(reply)  // we found the token
                                {
                                   // the token is in the store. now check to see if it is still valid
                                   jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                       {
                                                                           if(decoded)   // if decoded then get the id and find the user's information
                                                                           {
                                                                               var id = decoded.macco; // get the decoded id

                                                                               Profiles.find({'_id' : id}, function(err, profiles)
                                                                                                           {
                                                                                                               if(err)
                                                                                                               {
                                                                                                                  sock.emit('get_profiles_list', {status : "error_getting_profiles"});
                                                                                                                  return;
                                                                                                               }
                                                                                                               if(profiles) // user with this id found - gather user data
                                                                                                               {
                                                                                                                  // send the profiles to caller
                                                                                                                  sock.emit('get_profiles_list', {status : "success", myProfiles : JSON.stringify(profiles)});
                                                                                                                  return;
                                                                                                               }

                                                                                                              // if no erro and no profiles then send appropriate message
                                                                                                              sock.emit('get_my_profiles_list', {status : "no_profiles_found"});
                                                                                                           });
                                                                               return;
                                                                           }

                                                                           if(err)
                                                                           {
                                                                               sock.emit('get_my_profiles_list', {status : "error_decoding_token"});
                                                                               return;
                                                                           }

                                                                           sock.emit('get_my_profiles_list', {status : "no_decoded_token"});
                                                                           return;
                                                                       });
                                 }

                                 sock.emit('get_my_profiles_list', {status : "token_not_found"});
                            });

};

var getCurrentProfile = function(jwt, token, profileId)
{

    if((token === null) || (token === undefined))
    {
         sock.emit('get_current_profile', {status : 'null_token_recieved'});

         return;
    }

    // check the sessionStore to see if the token is stored here
    liveSessions.get(token, function(err, reply)
                            {
                                console.log("executing get profiles");

                                if(err)
                                {
                                   console.log("error trying to get token for accessing profiles list");
                                   sock.emit('get_current_profile', {status : 'error_getting_token'});

                                   return;
                                }
                                if(reply)  // we found the token
                                {
                                   // the token is in the store. now check to see if it is still valid
                                   jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                       {
                                                                           if(decoded)   // if decoded then get the id and find the user's information
                                                                           {
                                                                               var id = decoded.macco; // get the decoded id

                                                                               Profiles.findOne({'_id' : profileId}, function(err, profile)
                                                                                                           {
                                                                                                               if(err)
                                                                                                               {
                                                                                                                  sock.emit('get_current_profile', {status : "error_getting_profile"});
                                                                                                                  return;
                                                                                                               }
                                                                                                               if(profile) // user with this id found - gather user data
                                                                                                               {
                                                                                                                  // send the profiles to caller
                                                                                                                  sock.emit('get_current_profile', {status : "success", pro : JSON.stringify(profile)});
                                                                                                                  return;
                                                                                                               }

                                                                                                              // if no erro and no profiles then send appropriate message
                                                                                                              sock.emit('get_current_profile', {status : "no_profile_found"});
                                                                                                           });
                                                                               return;
                                                                           }

                                                                           if(err)
                                                                           {
                                                                               sock.emit('get_current_profile', {status : "error_decoding_token"});
                                                                               return;
                                                                           }

                                                                           sock.emit('get_current_profile', {status : "no_decoded_token"});
                                                                           return;
                                                                       });
                                 }

                                 sock.emit('get_current_profile', {status : "token_not_found"});
                            });

};


var setProfilecount = function(count)
{
    profileCount = count;
};




// this needs to be finalised ////////////////////////////////////////////////////////////////////////////////////////////////////////
var newProfile = function(jwt, token, profile)
{
    if((token === null) || (token === undefined))
    {
         sock.emit('new_profile', {status : 'new_profile_null_token_recieved'});

         return;
    }

    // check the sessionStore to see if the token is stored here
    liveSessions.get(token, function(err, reply)
                            {

                                if(err)
                                {
                                   sock.emit('new_profile', {status : 'new_profile_error_getting_token'});

                                   return;
                                }
                                if(reply)  // we found the token
                                {
                                   // the token is in the store. now check to see if it is still valid
                                   jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                       {
                                                                           if(decoded)
                                                                           {

                                                                               var userid = decoded.macco; // get the decoded id



                                                                               // check to see if another profile exists with this same name
                                                                               Profile.findOne({handle : profile.handle, deletedOn : null}, function(err, pro)
                                                                                                                          {
                                                                                                                               if(pro) // if we found something
                                                                                                                               {
                                                                                                                                   sock.emit('new_profile', {status : 'new_profile_handle_already_exists'});
                                                                                                                                   return;
                                                                                                                               }
                                                                                                                               if(err)
                                                                                                                               {
                                                                                                                                   sock.emit('new_profile', {status : 'new_profile_error_searching_profiles'});
                                                                                                                                   return;
                                                                                                                               }
                                                                                                                               // if no error and no profile found
                                                                                                                               console.log(" we and not create the new profile");

                                                                                                                               // if no user has a similar handle then let us create the new profile
                                                                                                                               var p = new Profile();

                                                                                                                               p.uid = userid;
                                                                                                                               p.image = profile.image;
                                                                                                                               p.name = profile.name;
                                                                                                                               p.handle = profile.handle;
                                                                                                                               p.about = profile.about;
                                                                                                                               p.address = profile.address;
                                                                                                                               p.website = profile.website;
                                                                                                                               p.email = profile.email;
                                                                                                                               p.phone = profile.phone;
                                                                                                                               p.createdOn = new Date();
                                                                                                                               p.deletedOn = null;

                                                                                                                               var profile_id = null; // this will be used to update the user record

                                                                                                                               p.save(function(err, pro)
                                                                                                                                      {
                                                                                                                                          if(err)
                                                                                                                                          {
                                                                                                                                              sock.emit('new_profile', {status : 'new_profile_error_saving_profile'});

                                                                                                                                              return;
                                                                                                                                          }
                                                                                                                                          
                                                                                                                                          // we will now find our entire profile list for sending back to client
                                                                                                                                          Profile.find({uid : userid}, function(err, list)
                                                                                                                                                                       {
                                                                                                                                                                           if(list)
                                                                                                                                                                           {
                                                                                                                                                                               sock.emit('new_profile', {status : 'new_profile_success', 
                                                                                                                                                                                                         profiles : JSON.stringify(list), current : pro});
                                                                                                                                                                               return;
                                                                                                                                                                           }
                                                                                                                                                                           sock.emit('new_profile', {status : 'new_profile_success_no_list', current : pro});
                                                                                                                                                                       });
                                                                                                                                          
                                                                                                                                          // insert entry into user array
                                                                                                                                          User.findOne({_id : userid}, function(err, user)
                                                                                                                                                                       {
                                                                                                                                                                            if(user)
                                                                                                                                                                            {
                                                                                                                                                                                user.profiles.push(pro._id);
                                                                                                                                                                                user.save(function(err)
                                                                                                                                                                                          {
                                                                                                                                                                                              if(err)
                                                                                                                                                                                                console.log("could not save profile id in User record");
                                                                                                                                                                                          });
                                                                                                                                                                            }
                                                                                                                                                                       });


                                                                                                                                      });
                                                                                                                          });
                                                                           }
                                                                           if(err)
                                                                           {
                                                                               sock.emit('new_profile', {status : 'new_profile_error_decoding_token'});
                                                                               return;
                                                                           }
                                                                       });
                                
	
                }			       
		
              });		        
		    
};



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name : isProfilehandleTaken
//
// Arguments: message - this is a JSON messge requesting the terms {handle : handle}
//
// return Type: None
//
// This function is used to find out whether the handle in the message is already used by some profile in the system already
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var isProfileHandleTaken = function(message)
{

    //check to see if there is already a profile that has the same handle name
    Profile.findOne({handle : message.profile.handle}, function(err, pro)
                                               {
                                                   if(pro)  // there is alread a profile with this handle
                                                   {
                                                       console.log("found handle == " +pro.handle+ " seeking handle = " +message.profile.handle);
                                                       console.log("type of pro._id = " +typeof(pro._id)+ " type of message.id = " +typeof(message.profile_id));

                                                       if(message.profile_id === String(pro._id))
                                                       {
                                                           sock.emit('is_profile_handle_taken', {status : 'handle_not_taken', msg : message});
                                                           return;
                                                       }

                                                       sock.emit('is_profile_handle_taken', {status : 'handle_taken', msg : message});
                                                       return;
                                                   }

                                                   sock.emit('is_profile_handle_taken', {status : 'handle_not_taken', msg : message});
                                               });
};



var updateProfile = function(jwt, message)
{
    if((message.token === null) || (message.token === undefined))
    {
         sock.emit('update_profile', {status : 'update_profile_null_token_recieved'});

         return;
    }

                                                                
    // check the sessionStore to see if the token is stored here
    liveSessions.get(message.token, function(err, reply)
                            {

                                if(err)
                                {
                                   sock.emit('update_profile', {status : 'update_profile_error_getting_token'});

                                   return;
                                }
                                if(reply)  // we found the token
                                {
                                   // the token is in the store. now check to see if it is still valid
                                   jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                       {
                                                                           if(decoded)  // the token is been decoded                                                                           
                                                                           {
                                                                                // find the profile

                                                                                Profile.findOne({_id : message.user_id, deletedOn : null}, function(err, pro)
                                                                                                                          {
                                                                                                                              if(pro)
                                                                                                                              {

                                                                                                                                  //check to see if there is already a profile that has the same handle name
                                                                                                                                  Profile.findOne({handle : message.profile.handle, deletedOn : null}, function(err, oth)
                                                                                                                                                                                     {
                                                                                                                                                                                         if(oth)  // there is alread a profile with this handle
                                                                                                                                                                                         {
                                                                                                                                                                                             console.log("oth id = " +typeof(oth._id)+ " pro id = " +typeof(pro._id));
                                                                                                                                                                                             console.log("oth id = " +String(oth._id)+ " pro id = " +String(pro._id));
                                                                                                                                                                                             if(String(oth._id) === String(pro._id))   // if we are at the same record
                                                                                                                                                                                             {
                                                                                                                                                                                                pro.name = message.profile.name;
                                                                                                                                                                                                pro.handle = message.profile.handle;
                                                                                                                                                                                                pro.about = message.profile.about;
                                                                                                                                                                                                pro.address = message.profile.address;
                                                                                                                                                                                                pro.website = message.profile.website;
                                                                                                                                                                                                pro.email = message.profile.email;
                                                                                                                                                                                                pro.phone = message.profile.phone;
																																																
																																															    if((message.profile.image === undefined) || (message.profile.image === null) || (message.profile.image === ""))
                                                                                                                                                                                                   pro.image = pro.image;
																																																else
																																																   pro.image = message.profile.image;

                                                                                                                                                                                                pro.save(function(err, p)
                                                                                                                                                                                                {
                                                                                                                                                                                                    if(err)
                                                                                                                                                                                                    {
                                                                                                                                                                                                       sock.emit('update_profile', 
                                                                                                                                                                                                                  {status : 'update_profile_error_saving_profile'});
                                                                                                                                                                                                       return;
                                                                                                                                                                                                    }
                                                                                                                                                                                                    sock.emit('update_profile', {status : 'update_profile_success', 
                                                                                                                                                                                                                                 update : p});
                                                                                                                                                                                                });
                                                                                                                                                                                                return;
                                                                                                                                                                                             }
                                                                                                                                                                                             else   // if we are not looking at the same record
                                                                                                                                                                                             {
                                                                                                                                                                                                 sock.emit('update_profile', {status : 'update_profile_handle_taken', 
                                                                                                                                                                                                                              msg : message});
                                                                                                                                                                                               
                                                                                                                                                                                             }
                                                                                                                                                                                             return;
                                                                                                                                                                                         }  // end if(oth)
                                                                                                                                                                                         
                                                                                                                                                                                         if(err)
                                                                                                                                                                                         {
                                                                                                                                                                                             sock.emit('update_profile', {status : 'update_profile_error_finding_handles'});
                                                                                                                                                                                             return;
                                                                                                                                                                                         }
                                                                                                                                                                                         
                                                                                                                                                                                         // if there is nothing else with the same handle then update pro
                                                                                                                                                                                         pro.name = message.profile.name;
                                                                                                                                                                                         pro.handle = message.profile.handle;
                                                                                                                                                                                         pro.about = message.profile.about;
                                                                                                                                                                                         pro.address = message.profile.address;
                                                                                                                                                                                         pro.website = message.profile.website;
                                                                                                                                                                                         pro.email = message.profile.email;
                                                                                                                                                                                         pro.phone = message.profile.phone;
                                                                                                                                                                                         pro.image = message.profile.image;

                                                                                                                                                                                         pro.save(function(err, p)
                                                                                                                                                                                                  {
                                                                                                                                                                                                    if(err)
                                                                                                                                                                                                    {
                                                                                                                                                                                                       sock.emit('update_profile',
                                                                                                                                                                                                                  {status : 'update_profile_error_saving_profile'});
                                                                                                                                                                                                       return;
                                                                                                                                                                                                    }
                                                                                                                                                                                                    sock.emit('update_profile', {status : 'update_profile_success',
                                                                                                                                                                                                                                 update : p});
                                                                                                                                                                                                  });

                                                                                                                                                                                         return;
                                                                                                                                                                                    });
                                                                                                                                             return;
                                                                                                                             }
                                                                                                                             if(err)
                                                                                                                             {
                                                                                                                                sock.emit('update_profile', {status : 'update_profile_error_finding_profile'});
                                                                                                                                return;
                                                                                                                             }
                                                                             
                                                                               })
                                                                               return;
                                                                           }

                                                                           sock.emit('update_profile', {status : 'update_profile_error_decoding_token'});
                                                                     });
                                    return;
                                }
                          });

};
      

var deleteProfile = function(jwt, msg)
{
    console.log("executing delete profile");

    if((msg.token === undefined) || (msg.token === null))
    {
       sock.emit('delete_profile', {status : 'delete_profile_null_token_recieved'});    // if no token or null token was passed as the message
       return;
    }


    // check the sessionStore to see ife token is stored here
    liveSessions.get(msg.token, function(err, reply)
                                {
                                   if(err)
                                   {
                                      sock.emit('delete_profile', {status : 'delete_profile_error_getting_token'});
                                      return;
                                   }
                                   if(reply)  // we found the token
                                   {
                                        // the token is in the store. now check to see if it is still valid
                                        jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                            {
                                                                                if(decoded)   // if decoded then get the id and find the user's information
                                                                                {
                                                                                    var id = decoded.macco; // get the decoded id

                                                                                    Profile.findOne({_id : msg.profile_id, deletedOn : null}, function(err, profile)
                                                                                                                            {
                                                                                                                                 if(err)
                                                                                                                                 {
                                                                                                                                     sock.emit('delete_profile', {status : 'delete_profile_not_found'});
                                                                                                                                     return;
                                                                                                                                 }

                                                                                                                                 profile.deletedOn = new Date();
                                                                                                                                 // profile.isDeleted = true;

                                                                                                                                 profile.save(function(err, saved)
                                                                                                                                              {
                                                                                                                                                   if(saved)
                                                                                                                                                   {
                                                                                                                                                        sock.emit('delete_profile', {status : 'delete_profile_success', profile_id : saved._id});
                                                                                                                                                        return;
                                                                                                                                                   }
                                                                                                                                                   sock.emit('delete_profile', {status : 'delete_profile_could_not_delete'});
                                                                                                                                                   return;
                                                                                                                                              });

                                                                                                                                 return;
                                                                                                                             });
                                                                                    return;
                                                                               }
                                                                                 //if token not decoded
                                                                               sock.emit('delete_profile', {status : 'delete_profile_error_decoding_token'});
                                                                               return;
                                                                           });
                                        return;
                                  }
                       });
                                                                                                                                 
};
                                                                      


// this needs to be finalised ////////////////////////////////////////////////////////////////////////////////////////////////////////
var createProfileInt = function(userId, pro)
{
   // first check to see that the user does not already have 5 profiles

   //check to see whether a profile with the same name exists
   Profiles.findOne({pName : pro.pName}, function(err, profile)
                                      {
                                          if(err)
                                          {
                                              console.log("error finding the profile with this name");

                                              // sock.emit('create_profile', {status : "error_create_profile"});
                                              return null;
                                          }

                                          if(profile)
                                          {
                                              if(pro.pName === "*#!721172!#*") // if  we found an anonymous profile
                                              {
                                                 var p = new Profiles();

                                                 p.uid = userId;
                                                 p.image = pro.image;
                                                 p.pName = pro.pName;
                                                 p.details = pro.details;
                                                 p.address = pro.address;
                                                 p.website = pro.website;
                                                 p.email = pro.email;
                                                 p.phone = pro.phone;
                                                 p.createOn = new Date();
                                                 p.deletedOn = null;

                                                 // save the new profile to database
                                                 p.save(function(err)
                                                       {
                                                           if(err)
                                                           {
                                                               console.log("could not save the profile in the database");
                                                               // sock.emit('create_profile', {status : "error_saving_profile"});
                                                               return null;
                                                           }

                                                           // sock.emit('create_profile', {status : "success"});
                                                       });

                                                 return;
                                               }

                                              // if we have not found an anonymous Profile
                                              console.log("a profile with this name already exists");
                                              // send client a message that a profile with this messge already exists
                                              // sock.emit('create_profile', {status : "profile_already_exists"});
                                              return null;
                                          }

                                          var p = new Profiles();

                                          p.uid = userId;
                                          p.image = pro.image;
                                          p.pName = pro.pName;
                                          p.details = pro.details;
                                          p.address = pro.address;
                                          p.website = pro.website;
                                          p.email = pro.email;
                                          p.phone = pro.phone;
                                          p.createOn = new Date();
                                          p.deletedOn = null;

                                          // save the new profile to database

                                          // save the new profile to database
                                          p.save(function(err)
                                                 {
                                                     if(err)
                                                     {
                                                         console.log("could not save the profile in the database");
                                                         // sock.emit('create_profile', {status : "error_saving_profile"});
                                                         return null;
                                                     }

                                                     // sock.emit('create_profile', {status : "success"});

                                                 });

                                           // we may want to store the profile Ids in the User.profiles array ?? No??

                                      });

     return null;
};




var saveProfile = function(profileId, pro)
{
    Profiles.findOne({_id : profileId}, function(err, profile)
                                        {
                                            if(err)
                                            {
                                                console.log("error finding the profile with this id");

                                                sock.emit('save_profile', {status : "error_save_profile"});
                                              return;
                                            }

                                            if(profile)
                                            {
                                                // we found what were looking for now let us save

                                                profile.uid = userId;
                                                profile.image = pro.image;
                                                profile.pName = pro.pName;
                                                profile.details = pro.details;
                                                profile.address = pro.address;
                                                profile.website = pro.website;
                                                profile.email = pro.email;
                                                profile.phone = pro.phone;

                                                // save the new profile to database
                                                profile.save(function(err)
                                                      {
                                                          if(err)
                                                          {
                                                              console.log("could not save the profile in the database");
                                                              sock.emit('create_profile', {status : "error_saving_profile"});
                                                              return;
                                                          }

                                                          sock.emit('create_profile', {status : "success", pro : profile});    // also save the profile id to retrun to caller
                                                          return;
                                                      });
                                             }

                                         });
    return;
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// This is used to change the a user's password
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var changePassword = function(jwt, message)
{

    if((message.token === undefined) || (message.token === null))  // if no token was given
    {
       sock.emit('change_password', {status : 'change_password_no_token_given'})    // if no token or null token was passed as the message
       return;
    }

    // check the sessionStore to see ife token is stored here
    liveSessions.get(message.token, function(err, reply)
                                    {
                                        if(err)
                                        {
                                            console.log("error trying to get token " +err);
                                            sock.emit('change_password', {status : 'change_password_error_getting_token'});
                                        }
                                        if(reply)  // we found the token
                                        {
                                            // the token is in the store. now check to see if it is still valid
                                            jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                                {
                                                                                    if(err) // most likely token is expired
                                                                                    {
                                                                                        sock.emit('change_password', {status : 'change_password_token_expired'});
                                                                                        // delete the current token
                                                                                        liveSessions.del(reply, function(err)
                                                                                                                {
                                                                                                                   console.log("could not destroy the token : " +err);
                                                                                                                });
                                                                                    }
																					
                                                                                    if(decoded)   // if decoded then get the id and find the user's information
                                                                                    {
                                                                                        var id = decoded.macco; // get the decoded id

                                                                                        User.findOne({'_id' : id}, function(err, found)
                                                                                                                   {
                                                                                                                      if(err)
                                                                                                                      {
                                                                                                                          sock.emit('change_password', {status : "change_password_error_getting_user"});
                                                                                                                          return;
                                                                                                                      }
                                                                                                                      if(found) // user with this id found - gather user data
                                                                                                                      {
                                                                                                                         found.local.password = found.generateHash(message.password);
 
                                                                                                                         found.save(function(err)
                                                                                                                         {
                                                                                                                            if(err)
                                                                                                                            {
                                                                                                                               console.log("could not successfully save/update the password");
                                                                                                                               sock.emit('change_password', {status : "change_password_error_saving_password"});
                                                                                                                               return;
                                                                                                                            }

                                                                                                                            console.log("Password successfully saved/updated");
                                                                                                                            sock.emit('change_password', {status : "success"});
                                                                                                                         });
                                                                                                                         return;
                                                                                                                       }
                                                                                                                    });
                                                                                    }
                                                                                });
                                        }
                                    });

};



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Tis function is in use
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var getProfileOther = function(message)
{
	 console.log(" we are in getProfileOther ");
     if((message.handle === undefined) || (message.handle === null))
     {
		 console.log(" we are in getProfileOther null handles");
         sock.emit('get_profile_other', {status : "get_profile_other_null_id"});
         return;
     }
	 
	 if(message.handle === 'Noname')
	 {
		 var prof = { image : "", name : "Noname", handle : "@noname", address : "737 Nowhere Street, Nowhere City, Earth", website : "xivents.co", 
						 email : "info@xivent.co", 
						 phone : "+1 868 788 5499", 
					     about : "This is the generaic profile used for anonyously posting events. All anonyously posted events are represented by this profile regardless of who posts them and where they are posted from."
					   };
					   
		 sock.emit('get_profile_other', {status : "get_profile_other_success", profile : prof, events : null});
																						  
		 console.log(" we are in getProfileOther @ Noname ");
																						  
		 return;
	 }
     
     Profile.findOne({handle : message.handle}, function(err, profile)
                                                  {
                                                      if(err)
                                                      {
                                                          console.log("error finding other profile");
                                                          sock.emit('get_profile_other', {status : "get_profile_other_error_finding_profile"});
                                                          return;
                                                      }
                                                      
                                                      if(profile)
                                                      {
                                                          var pro = { image : profile.image,
                                                                      name : profile.name,
                                                                      handle : profile.handle,
                                                                      about : profile.about,
                                                                      details : profile.details,
                                                                      address : profile.address,
                                                                      website : profile.website,
                                                                      email : profile.email,
                                                                      phone : profile.phone };

                                                          // find all the events created by this profile
                                                          Event.find({ profileId : profile._id, deleted : false }, function(err, list)
                                                                                                                          {
                                                                                                                              if(list)
                                                                                                                              {
                                                                                                                                  sock.emit('get_profile_other', {status : "get_profile_other_success", profile : pro, events : list});
                                                                                                                                  return;
                                                                                                                              }
                                                                                                                             
                                                                                                                              sock.emit('get_profile_other', {status : "get_profile_other_error_finding_events"});
                                                                                                                              return;
                                                                                                                          }).select({ profileId : 1,
                                                                                                                                      profileName : 1,
                                                                                                                                      postedOn : 1,
                                                                                                                                      handle : 1,
                                                                                                                                      title : 1,
                                                                                                                                      details : 1,                                      
                                                                                                                                      link : 1,
                                                                                                                                      startDate : 1,
                                                                                                                                      endDate : 1,
                                                                                                                                      location : 1,
                                                                                                                                      street : 1,
                                                                                                                                      city : 1,    
                                                                                                                                      state : 1,
                                                                                                                                      lat : 1, 
                                                                                                                                      lng : 1,
                                                                                                                                      tags : 1, 
                                                                                                                                      status : 1,
                                                                                                                                      comments : 1,
                                                                                                                                      pins : 1,
                                                                                                                                      image : 1 });
                                                          
                                                   
                                                   }
                                           });

    return;

};



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// this function is used to decode tokens
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var decodeToken = function(jwt, token)
{
    // check the sessionStore to see ife token is stored here
    liveSessions.get(token, function(err, reply)
                            {
                                if(err)
                                {
                                   console.log("error trying to get token for posting an event ");
                                   return null;
                                }
                                if(reply)  // we found the token
                                {
                                   // the token is in the store. now check to see if it is still valid
                                   jwt.verify(reply, '721@achian@127', function(err, decoded)
                                                                       {
                                                                           if(decoded)   // if decoded then get the id and find the user's information
                                                                           {
                                                                               var id = decoded.macco; // get the decoded id

                                                                               return id;
                                                                           }
                                                                           if(err)
                                                                           {
                                                                               console.log("error trying to decode the token");
                                                                               return null;
                                                                           }
                                                                        });

                                 }
                             });

     return null;

};

// utility functions


////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// This function is used to generate random alpha numeric strings
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////
var randomString = function(length, chars)
{
    var result = '';
    for (var i = length; i > 0; --i) 
		result += chars[Math.floor(Math.random() * chars.length)];
	
    return result;		
}


var verification_email = function(code)
{
	return '<!DOCTYPE html>'
               + '<html lang="en" style="font-family: sans-serif;">'
               + '<head>'
                    + '<!-- ie9+ rendering support for latest standards -->'
                    + '<meta content="text/html; charset = ISO-8859-1" http-equiv="Content-Type" />'
                    + '<meta content="IE=edge" http-equiv="X-UA-Compatible" />'
                    + '<meta content="width=640" name="viewport" />'
                    + '<!-- <meta name="google-signin-client_id" content="765525549762-eiiehb4mnhqla0plv2smirbahptd6qui.apps.googleusercontent.com">   -->'
                    + '<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport" />'
                    + '<link href="http://159.203.106.44:3000/favicon.ico" rel="shortcut icon" type="image/x-icon" />'
                    + '<title> xivents- What...Where...When </title>'
                    + '<!--  we adjusted the above'
	                + '<link rel = "stylesheet" href = "css/leaflet.css" type = "text/css" />'
	                + '<link href=\'https://api.tiles.mapbox.com/mapbox.js/v2.0.1/mapbox.css\' rel=\'stylesheet\' />'	 	 
                    + '<script src="http://cdn.auth0.com/js/lock/10.0/lock.min.js"></script>'

                    + '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/jq/jquery.uriAnchor-1.1.3.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/jq/jquery.event.gevent.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/jq/jquery.event.ue.js"></script>'
                    + '<script charset="utf-8" src="https://ucarecdn.com/widget/2.3.5/uploadcare/uploadcare.min.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/bootstrap/bootstrap.min.js"></script>'
                    + '<script src="https://use.fontawesome.com/38448475e3.js"></script>'
                    + '<script src="https://api.mapbox.com/mapbox.js/v2.2.1/mapbox.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/socket/socket.io.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/moment/moment.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/moment/moment+locales.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/bootstrap/bootstrap-datetimepicker.min.js"></script>'
               + '</head>'
               + '<body style="color: #3C3636; margin: 0; min-width: 640px;">'
			        + '<nav class="navbar navbar-inverse navbar-top" role="navigation" style="background-color: #3C3636; border: 1px solid transparent; border-color: #3C3636; border-radius: 0; display: block; height: 78px; margin-bottom: 20px; min-height: 50px; position: relative;">'
                    + '</nav><!-- Page Content -->'
                    + '<div class="container " style="font-family: \'Roboto Condensed\', sans-serif; margin-left: auto; margin-right: auto; max-width: 870px; padding: 0; padding-left: 15px; padding-right: 15px;">'
                          + '<div class="row" style="margin-left: -15px; margin-right: -15px;">'
                          + '<center><img alt="User Pic" class="img-responsive image-user" src="http://www.ucarecdn.com/f328d265-5aed-41f6-8b70-640d4c97d7b0/-/resize/50x50/" style="border: 0; margin: 0 auto;" /></center>'
                          + '<div class="entry-summary">'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;">Welcome to Xivents!</p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"> Before you can login to Xivents and begin posting your own events you need to confirm your email address by copying the code below and pasting it into the Verification code field of the Sign up page.</p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"> Your verification code is: <br><strong>' +code+ '<strong></p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"> Hope you enjoy getting up and running. We\'re excited to see what comes next! </p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"> Yours, </p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"> The Xivents Team </p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"></p>'
                          + '</div>'
                    + '</div>'
                    + '<footer id="body-footer" style="display: block;"><div class="container " style="font-family: \'Roboto Condensed\', sans-serif; margin-left: auto; margin-right: auto; max-width: 870px; padding: 0; padding-left: 15px; padding-right: 15px;">'
                    + '<center>'
                      + '<h4 style="font-size: 16px;"><img alt="User Pic" class="img-responsive image-user" src="http://www.ucarecdn.com/a8dfa3c1-5199-405f-b35a-76e87d5bc139/-/resize/160x50/" style="border: 0; margin: 0 auto;" /> <a href="javascript:;" id="footer-about" onclick="macco.nav.setAnchorAbout()" style="background-color: transparent; color: #3C3636;">About</a> | Google+ | facebook | twitter | youtube </h4>'
                    + '</center>'
                    + '</div></footer></div>'
               + '</body>'
            + '</html>';
	
};


var forgot_password_email = function(reset_password)
{
	return '<!DOCTYPE html>'
               + '<html lang="en" style="font-family: sans-serif;">'
               + '<head>'
                    + '<!-- ie9+ rendering support for latest standards -->'
                    + '<meta content="text/html; charset = ISO-8859-1" http-equiv="Content-Type" />'
                    + '<meta content="IE=edge" http-equiv="X-UA-Compatible" />'
                    + '<meta content="width=640" name="viewport" />'
                    + '<!-- <meta name="google-signin-client_id" content="765525549762-eiiehb4mnhqla0plv2smirbahptd6qui.apps.googleusercontent.com">   -->'
                    + '<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport" />'
                    + '<link href="http://159.203.106.44:3000/favicon.ico" rel="shortcut icon" type="image/x-icon" />'
                    + '<title> xivents- What...Where...When </title>'
                    + '<!--  we adjusted the above'
	                + '<link rel = "stylesheet" href = "css/leaflet.css" type = "text/css" />'
	                + '<link href=\'https://api.tiles.mapbox.com/mapbox.js/v2.0.1/mapbox.css\' rel=\'stylesheet\' />'	 	 
                    + '<script src="http://cdn.auth0.com/js/lock/10.0/lock.min.js"></script>'

                    + '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/jq/jquery.uriAnchor-1.1.3.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/jq/jquery.event.gevent.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/jq/jquery.event.ue.js"></script>'
                    + '<script charset="utf-8" src="https://ucarecdn.com/widget/2.3.5/uploadcare/uploadcare.min.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/bootstrap/bootstrap.min.js"></script>'
                    + '<script src="https://use.fontawesome.com/38448475e3.js"></script>'
                    + '<script src="https://api.mapbox.com/mapbox.js/v2.2.1/mapbox.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/socket/socket.io.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/moment/moment.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/moment/moment+locales.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/bootstrap/bootstrap-datetimepicker.min.js"></script>'
               + '</head>'
               + '<body style="color: #3C3636; margin: 0; min-width: 640px;">'
			        + '<nav class="navbar navbar-inverse navbar-top" role="navigation" style="background-color: #3C3636; border: 1px solid transparent; border-color: #3C3636; border-radius: 0; display: block; height: 78px; margin-bottom: 20px; min-height: 50px; position: relative;">'
                    + '</nav><!-- Page Content -->'
                    + '<div class="container " style="font-family: \'Roboto Condensed\', sans-serif; margin-left: auto; margin-right: auto; max-width: 870px; padding: 0; padding-left: 15px; padding-right: 15px;">'
                          + '<div class="row" style="margin-left: -15px; margin-right: -15px;">'
                          + '<center><img alt="User Pic" class="img-responsive image-user" src="http://www.ucarecdn.com/f328d265-5aed-41f6-8b70-640d4c97d7b0/-/resize/50x50/" style="border: 0; margin: 0 auto;" /></center>'
                          + '<div class="entry-summary">'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;">Hi!</p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"> We have just processed the password reset you just requested. </p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"> Your new password is: <br><strong>' +reset_password+ '</strong></p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"> Once you log into your account you will be able to change your password to something much easier to remember on the settings page. </p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"> Thank You, </p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"> The Xivents Team </p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"></p>'
                          + '</div>'
                    + '</div>'
                    + '<footer id="body-footer" style="display: block;"><div class="container " style="font-family: \'Roboto Condensed\', sans-serif; margin-left: auto; margin-right: auto; max-width: 870px; padding: 0; padding-left: 15px; padding-right: 15px;">'
                    + '<center>'
                      + '<h4 style="font-size: 16px;"><img alt="User Pic" class="img-responsive image-user" src="http://www.ucarecdn.com/a8dfa3c1-5199-405f-b35a-76e87d5bc139/-/resize/160x50/" style="border: 0; margin: 0 auto;" /> <a href="javascript:;" id="footer-about" onclick="macco.nav.setAnchorAbout()" style="background-color: transparent; color: #3C3636;">About</a> | google+ | facebook | twitter | youtube </h4>'
                    + '</center>'
                    + '</div></footer></div>'
               + '</body>'
            + '</html>';
	
};


var retrieve_verification_email = function(code)
{
	return '<!DOCTYPE html>'
               + '<html lang="en" style="font-family: sans-serif;">'
               + '<head>'
                    + '<!-- ie9+ rendering support for latest standards -->'
                    + '<meta content="text/html; charset = ISO-8859-1" http-equiv="Content-Type" />'
                    + '<meta content="IE=edge" http-equiv="X-UA-Compatible" />'
                    + '<meta content="width=640" name="viewport" />'
                    + '<!-- <meta name="google-signin-client_id" content="765525549762-eiiehb4mnhqla0plv2smirbahptd6qui.apps.googleusercontent.com">   -->'
                    + '<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport" />'
                    + '<link href="http://159.203.106.44:3000/favicon.ico" rel="shortcut icon" type="image/x-icon" />'
                    + '<title> xivents- What...Where...When </title>'
                    + '<!--  we adjusted the above'
	                + '<link rel = "stylesheet" href = "css/leaflet.css" type = "text/css" />'
	                + '<link href=\'https://api.tiles.mapbox.com/mapbox.js/v2.0.1/mapbox.css\' rel=\'stylesheet\' />'	 	 
                    + '<script src="http://cdn.auth0.com/js/lock/10.0/lock.min.js"></script>'

                    + '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/jq/jquery.uriAnchor-1.1.3.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/jq/jquery.event.gevent.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/jq/jquery.event.ue.js"></script>'
                    + '<script charset="utf-8" src="https://ucarecdn.com/widget/2.3.5/uploadcare/uploadcare.min.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/bootstrap/bootstrap.min.js"></script>'
                    + '<script src="https://use.fontawesome.com/38448475e3.js"></script>'
                    + '<script src="https://api.mapbox.com/mapbox.js/v2.2.1/mapbox.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/socket/socket.io.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/moment/moment.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/moment/moment+locales.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/bootstrap/bootstrap-datetimepicker.min.js"></script>'
               + '</head>'
               + '<body style="color: #3C3636; margin: 0; min-width: 640px;">'
			        + '<nav class="navbar navbar-inverse navbar-top" role="navigation" style="background-color: #3C3636; border: 1px solid transparent; border-color: #3C3636; border-radius: 0; display: block; height: 78px; margin-bottom: 20px; min-height: 50px; position: relative;">'
                    + '</nav><!-- Page Content -->'
                    + '<div class="container " style="font-family: \'Roboto Condensed\', sans-serif; margin-left: auto; margin-right: auto; max-width: 870px; padding: 0; padding-left: 15px; padding-right: 15px;">'
                          + '<div class="row" style="margin-left: -15px; margin-right: -15px;">'
                          + '<center><img alt="User Pic" class="img-responsive image-user" src="http://www.ucarecdn.com/f328d265-5aed-41f6-8b70-640d4c97d7b0/-/resize/50x50/" style="border: 0; margin: 0 auto;" /></center>'
                          + '<div class="entry-summary">'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;">Hi!</p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"> You requested that we resend you your verification code.</p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"> Your verification code is: <br><strong>' +code+ '<strong></p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"> Hope you enjoy getting up and running. We\'re excited to see what comes next! </p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"> Yours, </p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"> The Xivents Team </p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"></p>'
                          + '</div>'
                    + '</div>'
                    + '<footer id="body-footer" style="display: block;"><div class="container " style="font-family: \'Roboto Condensed\', sans-serif; margin-left: auto; margin-right: auto; max-width: 870px; padding: 0; padding-left: 15px; padding-right: 15px;">'
                    + '<center>'
                      + '<h4 style="font-size: 16px;"><img alt="User Pic" class="img-responsive image-user" src="http://www.ucarecdn.com/a8dfa3c1-5199-405f-b35a-76e87d5bc139/-/resize/160x50/" style="border: 0; margin: 0 auto;" /> <a href="javascript:;" id="footer-about" onclick="macco.nav.setAnchorAbout()" style="background-color: transparent; color: #3C3636;">About</a> | Google+ | facebook | twitter | youtube </h4>'
                    + '</center>'
                    + '</div></footer></div>'
               + '</body>'
            + '</html>';
	
};

/*
var share_event_email = function(xivent, sender, message)
{
	var email =  '<!DOCTYPE html>'
               + '<html lang="en" style="font-family: sans-serif;">'
               + '<head>'
                    + '<!-- ie9+ rendering support for latest standards -->'
                    + '<meta content="text/html; charset = ISO-8859-1" http-equiv="Content-Type" />'
                    + '<meta content="IE=edge" http-equiv="X-UA-Compatible" />'
                    + '<meta content="width=640" name="viewport" />'
                    + '<!-- <meta name="google-signin-client_id" content="765525549762-eiiehb4mnhqla0plv2smirbahptd6qui.apps.googleusercontent.com">   -->'
                    + '<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport" />'
                    + '<link href="http://159.203.106.44:3000/favicon.ico" rel="shortcut icon" type="image/x-icon" />'
                    + '<title> xivents- What...Where...When </title>'
                    + '<!--  we adjusted the above'
	                + '<link rel = "stylesheet" href = "css/leaflet.css" type = "text/css" />'
	                + '<link href=\'https://api.tiles.mapbox.com/mapbox.js/v2.0.1/mapbox.css\' rel=\'stylesheet\' />'	 	 
                    + '<script src="http://cdn.auth0.com/js/lock/10.0/lock.min.js"></script>'

                    + '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/jq/jquery.uriAnchor-1.1.3.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/jq/jquery.event.gevent.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/jq/jquery.event.ue.js"></script>'
                    + '<script charset="utf-8" src="https://ucarecdn.com/widget/2.3.5/uploadcare/uploadcare.min.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/bootstrap/bootstrap.min.js"></script>'
                    + '<script src="https://use.fontawesome.com/38448475e3.js"></script>'
                    + '<script src="https://api.mapbox.com/mapbox.js/v2.2.1/mapbox.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/socket/socket.io.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/moment/moment.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/moment/moment+locales.js"></script>'
                    + '<script src="http://159.203.106.44:3000/js/bootstrap/bootstrap-datetimepicker.min.js"></script>'
               + '</head>'
               + '<body style="color: #3C3636; margin: 0; min-width: 640px;">'
			        + '<nav class="navbar navbar-inverse navbar-top" role="navigation" style="background-color: #3C3636; border: 1px solid transparent; border-color: #3C3636; border-radius: 0; display: block; height: 78px; margin-bottom: 20px; min-height: 50px; position: relative;">'
                    + '</nav><!-- Page Content -->'
                    + '<div class="container " style="font-family: \'Roboto Condensed\', sans-serif; margin-left: auto; margin-right: auto; max-width: 870px; padding: 0; padding-left: 15px; padding-right: 15px;">'
                          + '<div class="row" style="margin-left: -15px; margin-right: -15px;">'
                          + '<center><img alt="User Pic" class="img-responsive image-user" src="http://www.ucarecdn.com/f328d265-5aed-41f6-8b70-640d4c97d7b0/-/resize/50x50/" style="border: 0; margin: 0 auto;" /></center>'
                          + '<div class="entry-summary">'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;">Greetings!</p>'
							   + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;">';
			                   
							   if((sender === undefined) || (sender === null) || (sender === ""))
							   {
								   email = email + "Someone";
							   }
							   else
							   {
								   email = email + sender;
							   }
             email = email + ' thought that you would be interested in the following event. </p>'
						  + '</div>'
                          + '<div class="entry-summary">'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;">' +xivent.details+ '</p>'
                          + '</div>'							   
                          + '<div class="entry-summary">'
                               + '<center>'
                                   + '<h4><strong style="font-weight: 700;">Location:</strong>' +xivent.location+ ', ' +xivent.street+ ', ' +xivent.city+ ', ' +xivent.state+ '</h4>'
                                   + '<h4><strong style="font-weight: 700;">Starts:</strong>' +moment(xivent.startDate).toDate()+ '</h4>'
                                   + '<h4><strong style="font-weight: 700;">Ends:</strong>' +moment(xivent.endDate).toDate()+ '</h4>'
                                   + '<h4><strong style="font-weight: 700;">Duration:</strong> <a class="time green  nopadding" href="#" style="background-color: transparent; color: #8A9D28; padding: 0;">' +moment(xivent.endDate).toDate() - moment(xivent.startDate).toDate()+ '</a></h4>'
                               + '</center>'
                          + '</div>'							   
						  + '<div class="entry-summary">'   
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"> Yours, </p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"> The Xivents Team </p>'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;"></p>'
                          + '</div>'
                    + '</div>'
                    + '<footer id="body-footer" style="display: block;"><div class="container " style="font-family: \'Roboto Condensed\', sans-serif; margin-left: auto; margin-right: auto; max-width: 870px; padding: 0; padding-left: 15px; padding-right: 15px;">'
                    + '<center>'
                      + '<h4 style="font-size: 16px;"><img alt="User Pic" class="img-responsive image-user" src="http://www.ucarecdn.com/a8dfa3c1-5199-405f-b35a-76e87d5bc139/-/resize/160x50/" style="border: 0; margin: 0 auto;" /> <a href="javascript:;" id="footer-about" onclick="macco.nav.setAnchorAbout()" style="background-color: transparent; color: #3C3636;">About</a> | Google+ | facebook | twitter | youtube </h4>'
                    + '</center>'
                    + '</div></footer></div>'
               + '</body>'
            + '</html>';
			
	 return email;
	
};
*/