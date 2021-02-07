/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// app/routes.js - this file holds all the routes for our application
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = function(express, app, passport)
{

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Router for uploads - used for uploading images
    //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const uploads = express.Router(); // used for user logins

    uploads.use( function(request, response, next)
               {
                   // response.contentType('json');           // json responses for these
                   console.log(request.method, request.url);   // log each request to the console
               });

    uploads.get('/uploads', function(request, response)
                                  {
                                     // response.send({code : request.params.code});
                                  });

    app.use('/', uploads);



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Router for Login - user login
    //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const login = express.Router(); // used for user logins

    login.use( function(request, response, next)
               {
                   response.contentType('json');           // json responses for these
                   console.log(request.method, request.url);   // log each request to the console
                   next();
               });

    login.post('/login/:user', function(request, response)
                                  {
                                     response.send({user : request.params.user});
                                  });

    app.use('/', login);
    
    /////////// End login //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Router for Signup - user signup
    //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const signup = express.Router(); // used for user signups

    signup.use( function(request, response, next)
               {
                   response.contentType('json');           // json responses for these
                   console.log(request.method, request.url);   // log each request to the console
                   next();
               });

    signup.get('/signup', function(request, response)
                          {
                              response.send({message : 'failed to sign up'});
                          });

    signup.post('/signup', passport.authenticate('local-signup', { successRedirect : '/profile', // redirect to the secure profile
                                                                   failureRedirect : '/signup',  // redirect back to the signup page if there is an error
                                                                   failureFlash : false    // do not allow flash messages
                                                                 }));

    app.use('/', signup);

    /////////// End signUp //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Router for logout - user logout
    //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const logout = express.Router(); // used for user logins

    logout.use( function(request, response, next)
               {
                   response.contentType('json');           // json responses for these
                   console.log(request.method, request.url);   // log each request to the console
                   next();
               });

    logout.get('/logout', function(request, response)
                                  {
                                      request.logout();
                                      response.redirect('/');
                                   
                                  });

    app.use('/', logout);

    /////////// End login //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////








    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Router for where (location)
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const where = express.Router();  // this is used to getting events on a happening at a certain location (city, state)

    where.use( function(request, response, next)
               {
                   response.contentType('json');           // json responses for these
                   console.log(request.method, request.url);   // log each request to the console
                   next();
               });

    where.get('/where/:location', function(request, response)
                                  {
                                     response.send({location : request.params.location});
                                  });

    where.get('/where/:city/:state', function(request, response)
                                 {
                                     response.send({location : request.params.city + " , " + request.params.state});
                                 });

    app.use('/', where);

    /////////// End location //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // When Router
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const when = express.Router();  // this is used to getting events on a happening at a certain location (city, state)

    when.use( function(request, response, next)
              {
                   response.contentType('json');           // json responses for these
                   console.log(request.method, request.url);   // log each request to the console
                   next();
              });

    when.get('/when/:time', function(request, response)
                       {
                           response.send({time : request.params.time});
                       });

    when.get('/when/:date/:time', function(request, response)
                                  {
                                      response.send({time : request.params.date + " , " + request.params.time});
                                  });

    app.use('/', when);

    /////////// End when //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Router for address (location) - will e used for when a user clicks on the Where button
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const address = express.Router();  // this is used to getting events on a happening at a certain location (city, state)

    address.use( function(request, response, next)
                 {
                    response.contentType('json');           // json responses for these
                    console.log(request.method, request.url);   // log each request to the console
                    next();
                 });

    address.get('/address/:location', function(request, response)
                                      {
                                          response.send({address : request.params.location});
                                      });

    address.get('/address/:location/:street', function(request, response)
                                              {
                                                 response.send({location : request.params.location + " , " + request.params.street});
                                              });

    app.use('/', address);

    /////////// End location //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Router for Search - get
    //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const search = express.Router(); // this is used to get search results

    search.use( function(request, response, next)
                {
                   response.contentType('json');           // json responses for these
                   console.log(request.method, request.url);   // log each request to the console
                   next();
                });

    search.get('/search/:query', function(request, response)
                                 {
                                     response.send({searchQuery : request.params.query})
                                 });

    app.use('/', search);

    ///////////// End Search ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Router for accessing user profile information
    //
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const profile = express.Router(); // this is used for getting a profiles information

    profile.use( function(request, response, next)
                 {
                    response.contentType('json');           // json responses for these
                    console.log(request.method, request.url);   // log each request to the console
                    next();
                 });


    profile.get('/profile', isLoggedIn, function(request, response)
                                 {
                                    response.send({profile : request.user});
                                 });

    app.use('/', profile);

    ////// End Profile /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Route middleware goes here
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////
//
// isLoggedIn - used to test(make sure that the user is logged in)
//
//////////////////////////////////////////////////////////////////////////////////////////
function isLoggedIn(request, response, next)
{
    // if user is authenticated in the session, carry on
    if(request.isAuthenticated())
       return next();

    // if they aren't redirected them to the home page
    response.redirect('/');
};
