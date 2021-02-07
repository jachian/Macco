///////////////////////////////////////////////////////
//
// Setting up a connection with our Mongo database
//
////////////////////////////////////////////////////////////
var MongoClient = require('mongodb').MongoClient;   // retrieve

//connect to databse
MongoClient.connect("mongodb://localhost:27017/macco", function(err,db)
                                                       {
                                                           if(!err)
                                                             console.log("We have a connection to mongo !!");
                                                           else
                                                             return console.dir(err);

                                                           db.collection('users', function(err, collection){});
                                                           db.collection('events', function(err, collection){});

                                                           var col = db.collection('users');
                                                           col.insert({"id" :  0,
"email" : "jachian@gmail.com", 
"password" : "Password1234", "profile" : [{"picture" : "kkjj", "name": "maccotest", "about" : "this is how it is", "followers" : [{"id" : 3, "name" : "Jak"}], "subscribers" : [{"id" : 43, "name": "king"}], "address" : {"street": "kdksj", "city":"lksjfs", "state":"ljdskajlla"}, "websites":["www.ere.com"], "emails":["opper@oper.co.tt"], "phones": ["868-445-5567"]}]
});
  
                                                           col = db.collection('events');
                                                           col.insert({"id" : 1,"by" : 1,"postedOn"  :  new Date("June 5, 2014 04:31:00"),"owner"  : "NAPA","what"  :  "Trinidad & Tobago National Philharmonic Concert","wdate" :  new Date("July 21, 2014 18:00:00"), "wdate1"  :  "July 21, 2014","wend"  :  new Date("July 21, 2014 21:00:00"),"wduration"  :  "3hours", "coord"  :  [10.663, -61.511],"where"  :  "National Academy for the Performing Arts", "address" :  { "street" : "kkdskdfsd", "city" : "kasdjkdsal", "state" : "ljdskajlla" }, "info" : { "furtherInfo" : "jdlkj kajlkjds kjla fjalj lajdf","website" : "www.website.com", "email" : "email@email.com", "phone" : "234-234-554"}, "tags" : ["akhdkda", "jlkajl", "jasljklsl"]});
                                                        });
