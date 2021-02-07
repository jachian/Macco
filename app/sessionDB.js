/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// This is the database client that will be used to store and retrieve session tokens
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const redis = require('redis');

const liveSessions = redis.createClient(6379);    // this database will be used to store sessions that have not expired
liveSessions.on('error', function(err)
                         {
                             console.log('LiveSessions Error: ' +err);
                         });
liveSessions.on('connect', function()
                           {
                               console.log('Redis liveSession is ready');
                           });

/*
const deadSessions = redis.createClient(6379);    // this database will be used to store sessions that have expired
deadSessions.on('error', function(err)
                         {
                             console.log('DeadSessions: ' +err);
                         });
deadSessions.on('connect', function()
                           {
                               console.log('Redis deadSession is ready');
                           });

*/

// Access and retrieve funcctions ////////////////////////////////////////////////////////////////////////////////////////
exports.setToken = function(token)
{
    liveSessions.set(token, token);
};

exports.getToken = function(token)
{
    var tok = null;
    liveSessions.get(token, function(err, reply)
                            {
                                if(err)
                                {
                                   console.log("error trying to get token " +err);
                                   // return null; // this means we have an error
                                }
                                if(reply)
                                {
                                    console.log(" from session store,,, token = " +reply);
                                    tok = reply;
                                    // return reply;     // this is null if the key is missing // this is not returning the correct session
                                }
                            });
    console.log("reply = " +tok);
    return tok;

};

exports.deleteToken = function(token)
{
    liveSessions.del(token, function(err)
                                {
                                    console.log("could not destroy the token : " +err);
                                    return null;
                                });
};
    



