///////////////////////////////////////////////////////////////////////////////////////////////////A/////////////////////
//
// app/model.js - this is used to define the schemas for our database
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/macco');      // connect to the database
const bcrypt = require('bcrypt-nodejs');

// checking to see if we have a successful connection or not
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

db.once('open', function()
                {
                    console.log('connection to mongo database established');
                });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// define the schemas for our our users and profiles ////////////////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const users = mongoose.Schema;
const ObjectID = users.ObjectId;  // this might cause problems but we will see what happens

const profileSchema = mongoose.Schema;
const profile = mongoose.Schema({ uid : mongoose.Schema.ObjectId,    // user id that owns this profile
                                   image : String,                    // profile picture
                                   name : String,                     // the name of the profile
                                   handle : String,                  // the profile's handle
                                   about : String,                    // summary information about the profile
                                   details : String,
                                   address : String,
                                   website : String,
                                   email : String,
                                   phone : String,
                                   createdOn : Date,                       // the date that this profile was created
                                   deletedOn : Date                       // the date that the profile was deleted on .This will be null if the profile is still active.
                                 });


const userSchema = new users({ local : { email : String,
                                               password : String,
                                       },
                               facebook : { id : String,
                                            token : String,
                                            email : String,
                                            name : String
                                          },
                               twitter : { id : String,
                                           token : String,
                                           screen_name : String,
                                           name : String,
                                         },
                               google : { id : String,
                                          token : String,
                                          email : String,
                                          name : String
                                        },
							   service : String,
                               verified : Boolean,
                               signup : Date,
                               deletedOn : Date,       // the date that the profile was deleted on. This is null if the profile is still active    
                               profiles : [mongoose.Schema.ObjectId]    // the list of profile ids for the profiles that his user has
                             });


// methods ///////////////////////////////////////////////////////////////////////////////////////////////////////////

// generating a hash
userSchema.methods.generateHash = function(password) 
{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) 
{
    return bcrypt.compareSync(password, this.local.password);
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//define schema for storage of verification keys when a person creates an account
const verificationSchema = mongoose.Schema({ code : String,    // hash(email + randNum + password)
                                             email : String,
                                             password : String,
                                             createDate : Date,
                                             verified : Boolean,
                                             verifiedDate : Date });                 // the date that is verification code was created

// generating a hash
verificationSchema.methods.generateHash = function(code)
{
    return bcrypt.hashSync(code, bcrypt.genSaltSync(8), null);
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// define schema for the event locations that users enter
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const cities = mongoose.Schema({ city : String,
                                 lat : Number,
                                 lng : Number,
                                 num : Number });
 
const locationSchema = mongoose.Schema({ state : String,    // eg Trinidad & Tobago
                                         cities : [cities] });               




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Define a schema for an event
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const eventSchema = mongoose.Schema;
// const ObjectID = eventSchema.ObjectId; just was originailly her before i updated the user schema

const eventSchema1 = new eventSchema({hash : String,       // this the unique hash tag given to an event when created, - basically the stringified  id.
                                      userId : mongoose.Schema.ObjectId, // the user who posted the event
                                      profileId : mongoose.Schema.ObjectId,    // the profile that posted the event
                                      profileName : String,   // the name of the profile that posted this event.
                                      handle : String,     // the handle for the user who posted this
                                      postedOn : Date,     // this is the date and time that this event was posted on
                                      title : String,      // title or event name
                                      details : String,    // further information about the event
                                      link : String,
                                      startDate : Date,    // starting date and time of the event
                                      endDate : Date,      // ending date and time for the event
                                      location : String,   // place where event will take place
                                      street : String,     // street address of the event
                                      city : String,       // city/town of event
                                      state : String,      // state or country that event will take place in
                                      lat : Number,    // lat coordinate for location on map
                                      lng : Number,    // long coordinate for location on map
                                      tags : [String],      // used to store tags
                                      status : String,      // indicates the status of the event scheduled, delayed, cancelled, past, in-progress
                                      comments : mongoose.Schema.ObjectId, //eventSchema.Types.ObjectId,  // the object id of the comments list
                                      pins : [mongoose.Schema.ObjectId],  //eventSchema.Types.ObjectId],     // array of objects of users who pin or Marked this event.
                                      image : String,         // uploaded image for this event.
                                      deleted : Boolean,      // if the event has been deleted
                                      deletedOn : Date,        // the date that the event was deleted on
                                      lastEdited : Date,      // the date on which the event was last edited
                                    });


// schema for holding external event tags   ///////////////////////////////
const tagsSchema = mongoose.Schema;

const eventTags = new tagsSchema({ eventId : mongoose.Schema.ObjectId,
                                   userId : mongoose.Schema.ObjectId,     // the id of the user that posed the event
								   profileId : mongoose.Schema.ObjectId,  // the profile id tat posted the event
                                   tag : String,             // primary tag
                                   tag1 : String             // secondary tag or meaning
                                 });


// Schema for holding user Log information
const logSchema = mongoose.Schema;

const userLog = new logSchema({ user: mongoose.Schema.ObjectId,
                                city : String,
                                country : String,
                                hostname : String,
                                ip : String,
                                lat : Number,
                                lng : Number,
                                org : String,
                                date : Date
                              });


// create the model for users and expose it to our app
module.exports = { profile : mongoose.model('Profile', profile), 
                   user : mongoose.model('User', userSchema),
                   veri : mongoose.model('Veri', verificationSchema),
                   locations : mongoose.model('Locations', locationSchema), 
                   event : mongoose.model('Event', eventSchema1),
                   tag : mongoose.model('Tag', eventTags),
                   log : mongoose.model('Log', userLog) 
                 };
