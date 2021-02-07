/*
 * macco.main.js
 * Main content panel for macco
 */
 
/*jslint               browser : true,      continue : true,
  devel : true,        indent : 2,          maxerr : 50,
  newcap : true,       nomen : true,        plusplus : true,
  regexp : true,       sloppy : true,       vars : false,
  white : true
*/

/*global $, macco */

macco.main = (function ()
{
        var configMap = { main_html : String(),
			  settable_map : {}
			};   // static configuration values go in here.
					
	var stateMap = { $container : null,     // Used for dynamic information shared across the module in here
	                 user : null,
			 city : "",
			 state : "",
			 mode : ""}; 
	
	var jqueryMap = {};  //used to Cache jQuery collections in jqueryMap
	
	
	var events = [];

        var myEvents = null;     // used to store the list of events all the events you have posted.

        var profilesList;
	
	var getLocation; // used to give ouside classes the locations of the events
	
	var listEvents;       // used to create markup to display events
	var listEventsPosted;
	var listEventsOn      // used to display a list of events on a particular date
	var profilePage;      // function used to generate the profile page of a user
        var profilePageOther;
        var formatTitle;      // function used to format the title text of events.
        var formatTitleBoard;   // for formating tiles on the main events board.
        var formatDetailsBoard;   // used for formating details strings for diaplay with events.
        var listTags;         // used to display the tags for a particular event
        var listTagsOnBoard;
	var profileEventsFilter;
	var profileEventsFilterOther;
	var profileEventsFilterSearch;
        
        var editProfilePage;  // used when user wants to edit his page
        var settingsPage;
		var saveNewPassword;
        var saveAsNewForm;
        var saveProfileChangesForm;
        var newProfileCancel;
    
	var createProfilePage;

	
	//nav bar pages
	var loginPage;
	var signUpPage;
	var signupSuccessPage;
	var aboutPage;
	var forgotPasswordPage;
    var createEventPage;
    var postEventForm;
	var editEventForm;
    var deleteEventForm;
    var deleteEventNo;
    var deleteEvent;
    var changeBoardHeader;
	var shareEventEmail;
	var shareModalOpen;


	// setting anchors
	var setAnchorProfile;
        var setAnchorProfileOther;
		var setAnchorProfileNoname;
	var setAnchorWhen;
	var setAnchorWhere;
	var setAnchorLoggedIn;
        var setAnchorLocation;
        var setAnchorCreatProfile;
        var setAnchorPostEvent;
        var setAnchorEditEvent;
        var setAnchorViewEvent;
		var setAnchorSearchEvents;
		var setAnchorTopSearch;

        var setLocation;
	
	//  map variables and functions
	//  var map;
	//  var myLayer;
	//  var geojson;
	//  var feature
        var latlong = [0,0];
	var generateMap;
	
	//validators
	var validateEmail;
	var login;
	var login_facebook;
	var login_auth0;
        var signUp;
        var forgotPassword;
	var signupResponse;
        var codeResponse;
        var loginResponse;
        var forgotPasswordResponse;
	var verify;
        var getVerificationCode;
        var getVerificationCodeResponse;
        var forgotPassword;
        var postEvent;
        var newProfile;
        var saveProfile;
        var postEventResponse;
        var getEventsResponse;
        var getLocationsResponse;
        var saveProfileResponse;
        var newProfileResponse;
        var updateProfileResponse;
        var updateEventsBoard;
        var displayEvent;
        var deleteEventResponse;
        var deleteProfileResponse;
		var changePasswordResponse;
		var shareEventResponse;

        // change and deleting profiles ////////////////////////////////////////////////////////////////////
        var changeProfile;
        var deleteProfile;
		var saveChangesModalYes;
		var newProfileModalYes;
		var savePasswordModalYes;
        var savePasswordModalNo;
        var deleteProfileYes;
        var deleteProfileNo;

        // utility functions ////////////////////////////////////////////////////////////////////////////////
        var getDuration;
        var generateCounterString;
        var eventProgressString;
		var getSearchTerms;
		
		// global variables
		var global_search_list = [];
	
	var initModule;
	// End module Scope Variables ---//////////////////////////////////////////////////////////////////////////////////////////////////////
	
	displayWhen = function(listHtml)
	{
	    if(stateMap.$container != null)
	        stateMap.$container.html(String() +listHtml);
	};


        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Name: getDuration
        // 
        // Arguments: milliseconds - the number of milisections that we wish to convert to hours mininteus seconds, etc.
        //
        // Returns: A string of the duration in the format (hrs, minutes, seconds)
        //
        // This function is used to determine in human readable term the duration of a time given in miliseconds
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        duration = function(milliseconds)
        {
	   var sec = milliseconds / 1000;
	
	   var time = sec % (60*60*24);
	   var elapsed = "";
	
	
	   if((time % (60*60)) <= 0)
	      return elapsed + " " + parseInt(time / (60*60), 10) + " hrs";
	
           elapsed = elapsed + " " + parseInt(time / (60*60), 10) + " hrs";
           time = time % (60*60);

           if((time % 60) <= 0)
              return elapsed + " " + parseInt(time / 60, 10) + " mins";

           return elapsed + " " + parseInt(time / 60, 10) + " mins " + parseInt(time % 60, 10) + " secs";
        };

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Name: generateCounterString
        //
        // Argument: date - the date of the event
        // 
        // Returns: A string that holds the event counter in the form of (Days : Hours : Seconds)
        //
        // This is used to gernate the counter that each event lists under it to indicate how far away the event is
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        generateCounterString = function(date)
        {
            var current = moment(new Date()).toDate();  // current date and time
	
	    var time_elapsed = (Math.abs(current - date))/1000;   // time elapsed in seconds
	
	    // we need to calculate days, hours, mins
	    var max_time = [24,60,60];   // number of seconds in a day
	    var max = 60*60*24;
	    var counter = [0, 0, 0, 0, 0, 1];
	
	    for(var i = 0; i < 3; i++)
	    {
		if(time_elapsed >= max)   // if we still have seconds remaining
		   counter[i] = parseInt(time_elapsed / max, 10);
                else
                   counter[i] = 0;

		time_elapsed = time_elapsed % max;
		max = max / max_time[i];
            }

            counter[3] = parseInt(time_elapsed / max, 10);
	
	    if(date < current)
	       counter[4] = - 1;
	    else
	       counter[4] = 1;

            return "" +counter[0]+ " : " +counter[1]+ " : " +counter[2]+ " ";
	};
        
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Name: eventProgressString
        // 
        // Arguments: start_date - A moment() date/time object that holds the staring date/time of an event.
        //            end_date - A moment() date/time object that holds the ending date/time of an event.
        //
        // Return type: A String containing the the markup that will be written concerning the status/progress of the even in question. The string will let the user know whether the event has ended,
        //              whether the event is currently happening/in progress or if the event is happening in the future.
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        eventProgressString = function(start_date, end_date)
        {

            if(start_date.isBefore(moment()) && end_date.isAfter(moment()))    // if the even is currently happening or is in progress
            {
                return '<h4>Happening Now:</h4><a href="map.html" class="time orang  nopadding">' +generateCounterString(start_date.toDate())+ '</a>';
            }
            if(start_date.isBefore(moment()))   // if the event has already happened or is past
            {
                return '<h4>Ended:</h4><a href="map.html" class="time red  nopadding">' +generateCounterString(end_date.toDate())+ '</a>';
            }
          
            return '<h4>Starts in:</h4><a href="map.html" class="time green   nopadding">' +generateCounterString(start_date.toDate())+ '</a>';   // the even is yet to happen- is in the future
        };
                 




   
	
	setAnchorProfile = function(userId)
	{
	    var user = macco.model.getUser(userId);
		
            if(user === null)
	       return false;
		   
		return $.uriAnchor.setAnchor({log : 0,
		                              pro : userId,
					      wt : "",									  
					      wn : "",
					      wr : "",
					      lt : "",
					      lg : ""},null,true);
    };
	
	setAnchorWhen = function(index)
	{
	    if(index < 0 || index > events.length - 1)
		{
		   console.log("setAnchorWhen returns false");
		   return false;
		}

		return $.uriAnchor.setAnchor({log : 0,
		                              pro : -21,   // might cause problems here, especially if a user has this profile name
									  wt : "",									  
									  wn : events[index].startDateString,
									  wr : "",
									  lt : "",
									  lg : ""}, null, true);
	};
	
	//// Argument: an index into the events[] array
	setAnchorWhere = function(index)
	{
	    
	    if(index < 0 || index > events.length - 1)
		{
		   console.log("setAnchorWere returns false");
		   return false;
		}
		   
		return $.uriAnchor.setAnchor({log : 0,
		                              pro : -21,
									  wt : events[index].title,
									  wn : events[index].startDateString,
									  wr : events[index].location,
									  ltlg : events[index].latlong}, null, true);				
	};
	
    setAnchorLoggedIn = function()    // leave this as is //////////////////////////////////////////////////////////////////////////////////////////////////////
    {
		return $.uriAnchor.setAnchor({log : 4    // 4 means that a user is logged into the platform
		                              // pro : macco.shell.currentUser   // might cause problems here, especially if a user has this profile name
					     }, null, true);
    };

    setAnchorLocation = function(location)
    {
        return $.uriAnchor.setAnchor({log : 7,    // 7 means that we want to change the location of events
                                      loc : location   // the new location we want events from
                                     }, null, true);
    };

    setAnchorSaveProfile = function()
    {
        return $.uriAnchor.setAnchor({log : 9    // 9 means that we want to save our profile information
                                     }, null, true);

    };

    setAnchorCreateProfile = function()
    {
        return $.uriAnchor.setAnchor({log : 10    // 10 means that we want the create- profile page
                                     }, null, true);
    };

    setAnchorPostEvent = function(index)
    {
		console.log("set anchor post event arg = " +index+ " ... Typeof(index) = " +typeof(index));
		
		//$("#post-event-message-top").html('<center><p style = "font-size:15px"><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></p></center>');
		//$("#post-event-message-bottom").html('<center><p style = "font-size:15px"><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></p></center>');
		
        $.uriAnchor.setAnchor({ log : 'post',
		                         id : index }, null, true);
		
		history.pushState(null, null, '/macco.html#!log=post&id=' +index);
		   
		return;		
    };

    setAnchorEditEvent = function(index)
    {
        $.uriAnchor.setAnchor({ log : 'edit',    // 10 means that we want the create- profile page
                                id : index 
                               }, null, true);
							   
		history.pushState(null, null, '/macco.html#!log=edit&id=' +index);					   
							   
		// macco.shell.current_url = '/macco.html#!log=edit&id=' +index; 
    };

    setAnchorViewEvent = function(index)
    {
        macco.counter.stopTimer();

        $.uriAnchor.setAnchor({ log : 'event',    // 10 means that we want the create- profile page
                                 id : macco.counter.getEvent(index)._id
                              }, null, true);
							  
		history.pushState(null, null, '/macco.html#!log=event&id=' +macco.counter.getEvent(index)._id);					  
		
		// macco.shell.current_url = '/macco.html#!log=event&id=' +macco.counter.getEvent(index)._id; 
    };
	
	// search_list is a stingified array of search terms or tags
	setAnchorSearchEvents = function(event_index, tag_index)
    {
		$("#board-header").html('<center><p style = "font-size:15px"><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></p></center>');
		console.log("event index = " +event_index+ "tag_index = " +tag_index);
		console.log("typeof index = " +typeof(event_index));
		console.log(macco.counter.getEventsList());
		
		var event_tag = macco.counter.getEventsList()[parseInt(event_index)].tags[parseInt(tag_index)];     //macco.counter.getEvent(parseInt(event_index)).tags[parseInt(tag_index)];  // get the event
		
        $.uriAnchor.setAnchor({log : 'event-search',
		                       query : event_tag}, null, true);
							   
							   
		history.pushState(null, null, '/macco.html#!log=event-search&query=' +event_tag);
		
		// macco.shell.current_url = '/macco.html#!log=event-search&query=' +event_tag;
							   	
		console.log("tag clicked = " +event_tag);
    };
	
	setAnchorTopSearch = function()
	{
		$("#board-header").html('<center><p style = "font-size:15px"><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></p></center>  ');
		var search_terms = document.getElementById('events-board-search').value;
		
		// console.log("search terms = " +search_terms);
		
		if((search_terms === undefined) || (search_terms === null) || (search_terms === ''))
			return;
		
		var search_list = [];
		search_list.push(search_terms);
		
		search_terms = search_terms.split(" ");  // slit the string into individual words
		
		// fill in the search_list to send to the server
		for(var i = 0; i < search_terms.length; i++)
		{
			var term = search_terms[i];
			
			if((term[0] === '#') || (term[0] === '@'))
				search_list.push(term.substr(1, term.length - 1));
			else
				search_list.push(term);
		}
		
		// set the global search value to the search array
		macco.main.global_search_list = search_list;
        console.log('searh list = ' +search_list);

        $.uriAnchor.setAnchor({log : 'search',
		                       query : search_list[0]}, null, true);
							   
		history.pushState(null, null, '/macco.html#!log=search&query=' +search_list[0]);					   
							   
        // macco.shell.current_url = '/macco.html#!log=search&query=' +search_list[0];
		
		return false;		
	};
	
	

    setAnchorProfileOther = function(index)
    {
        macco.counter.stopTimer();
		
		console.log("set anchor other INDEX = " +index);

        var event_handle = null;
		
		//experimental
		$.uriAnchor.setAnchor({ log : 'x'}, null, true);

        if(index < 0)
		{
           $.uriAnchor.setAnchor({ log : 'profile-o',
                                    id : 'Noname' }, null, true);

           history.pushState(null, null, '/macco.html#!log=profile-o&id="Noname"');										
		   
		   // macco.shell.current_url = '/macco.html#!log=profile-o&id="Noname"';						

		   console.log("set anchor other INDEX << 0");		   
		   
           return;		   
		}
	    else
	       event_handle = macco.counter.getEvent(index).handle;

        var current_user = macco.model.getUser();

        if((current_user === undefined) || (current_user === null))
        {
           $.uriAnchor.setAnchor({ log : 'profile-o',
                                    id : event_handle }, null, true);
									
		   history.pushState(null, null, '/macco.html#!log=profile-o&id=' +event_handle);					
									
		   // macco.shell.current_url = '/macco.html#!log=profile-o&id=' +event_handle;						

           return;
        }

        if(event_handle === current_user.handle) // check to see if the event handle is the same as the current user's handle
        {
             macco.nav.setAnchorMyProfile();
             return;
        }

        $.uriAnchor.setAnchor({ log : 'profile-o', 
                                 id : event_handle }, null, true);
								 
        history.pushState(null, null, '/macco.html#!log=profile-o&id=' +event_handle);								 
								 
        // macco.shell.current_url = '/macco.html#!log=profile-o&id=' +event_handle;
		
        return;
    };
	
	setAnchorProfileNoname = function()
	{
		 macco.counter.stopTimer();
		 
		 $.uriAnchor.setAnchor({ log : 'noname' }, null, true);
		 
         history.pushState(null, null, '/macco.html#!log=noname');		 
		 
		 // macco.shell.current_url = '/macco.html#!log=noname';	 	 	
	};






/////////////////// logged in pages ////////////////////////////////////////////////////////

    createEventPage = function()
    {
        stateMap.$container.html(String() + '');
    };




  
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Name: loginPage
    //
    // Arguments: message - the message that we may want to be displayed with this page on the user screen
    //
    // Return Type: None - Does not return anything
    //
    // This function is used to generate the markup for the login page. This makeup is then displayed in the main container of the website.
    //
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    loginPage = function(message)
    {		
	    stateMap.$container.html(String() + '<div class="container container-login">'
				                                + '<div class="text-center">'
				                                   + '<h1 class="settings-heading">Login</h1>'
				                                + '</div>'
				                                + '<div class="col-md-5 col-xs-10 nopadding">'
												    + '<center>'
													  + '<form>'
													       + '<div class="col-md-12 text-center">'
													          + '<p>'
				                                                 + '<button type="button" class="btn  btn-lg btn-three" id="main-login-button" onclick = macco.main.login_auth0()>login with <i class="fa fa-google" aria-hidden="true"></i> | <i class="fa fa-twitter" aria-hidden="true"></i></button>'
				                                              + '</p>'
													          + '<p>'
				                                                 + '<button type="button" class="btn  btn-lg btn-three" id="main-login-button" onclick = macco.main.login_facebook()>login with <i class="fa fa-facebook-square" aria-hidden="true"></i></button>'
				                                              + '</p>'	
                                                          + '</div>'
														  + '<h4 style = "font-size:16px"> or </h4>'													  
                                                      + '</form>'													  
                                                    + '</center>'
													 + '<div class="g-signin2" data-onsuccess="onSignIn"></div>'													
				                                   + '<form>'
				                                      + '<div class="col-md-12 text-center">'
													      + '<div id="main-login-response"></div>'
				                                          + '<div class="form-group text-left">'
				                                             + '<label for="Email">E-mail:</label>'
				                                             + '<input type="email" class="form-control" id="main-email" placeholder="Your e-mail goes here">'
				                                          + '</div>'
				                                      + '<div class="form-group text-left">'
				                                          + '<label for="Password">Password:</label>'
				                                          + '<input type="password" class="form-control" id="main-password" placeholder="Your password goes here">'
				                                      + '</div>'
				                                      + '<p>'
				                                          + '<button type="button" class="btn  btn-lg btn-first" id="main-login-button" onclick = macco.main.login()>Login</button>'
				                                      + '</p>'
				                                      + '<a  data-toggle="collapse" href="#collapseForgot" aria-expanded="false" aria-controls="collapseForgot">'
				                                          + 'Forgot your password?'
				                                      + '</a>'
				                                      + '<div class="collapse" id="collapseForgot">'
													  	  + '<div id="main-response-forgot-password"></div>'
				                                          + '<div class="form-group text-left">'
				                                              + '<label for="Registered">Registered e-mail:</label>'
				                                              + '<input type="email" class="form-control" id="main-forgot-email" placeholder="Enter your e-mail address here">'
				                                          + '</div>'
				                                          + '<button type="button" class="btn  btn-lg btn-first id="main-forgot-password-button" onclick = macco.main.forgotPassword()>Send password</button>'
				                                      + '</div>'
				                                      + '</div>'
				                                   + '</form>'
				                                 + '</div>'
				                             + '</div>');      

    };
	
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// Name: validateEmail
	//
	// Argumenmts: email - String - an email address in the standard format
	//
	// Return Type: Boolean - true if the email in the argument is a valid email address
	//                      - false if the email in the argument is not a valid email address
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	validateEmail = function(email) 
	{ 
            var re = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
            return re.test(email);
    };

	
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// Name: login
	//
	// Return Type: None
	//
	// Arguments: None
	//
	// This function is used to try to login into an account
	//
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    login = function()
    {
	    $("#main-login-response").html('<center><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></center>');
	    var email = document.getElementById('main-email').value;
	    var password = document.getElementById('main-password').value;
				
        var no_email = '<div class="alert alert-warning" role="alert">'
		                   + '<center><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
						   //+ '<center>'
                               + '<p style = "font-size:15px"><strong>I think you forgot to input your email address.</strong></p>'
                               + '<p style = "font-size:15px">Make sure you enter a valid email address.'
						     + '</center>'
                        + '</div>';
		
		
	    var no_password = '<div class="alert alert-warning" role="alert">'
		                      + '<center>'
		                      + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'		  
                              + '<p style = "font-size:15px"><strong>I didnt see you enter a password...</strong></p>'
                              + '<p style = "font-size:15px">Make sure you fill in your password.</p>'
							  + '</center>'
                            + '</div>';

	    var invalid_email = '<div class="alert alert-warning" role="alert">'
		                         + '<center>'
		  		                 + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                 + '<p style = "font-size:15px"><strong> I dont think you entered a valid email address.</strong></p>'
                                 + '<p style = "font-size:15px">Make sure your enter a valid email address in the correct format. For example, my-email@dom.com</p>'
								 + '</center>'
                              + '</div>';
		
		
	    var invalid_login = '<div class="alert alert-warning" role="alert"> Nope... That email and password combination dont compute. <br> Try again. If you forgot your password click the link to the bottom right to retrieve it.</div>';
	    // console.log(validateEmail(email));
		
	    if((email === undefined) || (email === null) || (email === ''))
	    {
            $("#main-login-response").html(no_email);
	        return;
	    }
		
	    if((password === undefined) || (password === null) || (password === ''))
        {
 	        $("#main-login-response").html(no_password);
	        return;
        }
		
        if(validateEmail(email) === false)
        {
             $("#main-login-response").html(invalid_email);
	         return;
        }
        
        macco.model.login(email, password);  // if we reach here then we are good to go- attempt to log in
		      
    };
	
	login_facebook = function()
	{
		FB.login(function(response) 
		         {
					 console.log(response);
					  macco.model.login("","","facebook", response);
				 });
	};
	
	login_auth0 = function()
	{
        var lock = new Auth0Lock('h2xT7N202vO57Xt9CfWdXsl4KAuMpkw0', 'xivents.auth0.com', { auth: { params: { scope: 'openid email' }, redirect: false  } }); // initialise the lock
		
		auth: { redirect: false }
		
		var token = null;
		var social_profile = null;
		
		console.log("lgoin_auth0 lock === " +lock);
		console.log(lock);
		
		if((lock === undefined) || (lock === null))
		{
		   console.log("could not initialise the lock.");
		   return;
		}
		
		lock.show();    // show the popup to select which service to login with
		
		// get the id tokens and stuff
		
		lock.on("authenticated", function(authResult) 
		                         {
                                     lock.getProfile(authResult.idToken, function(error, profile) 
									                                     {
                                                                            if(error) 
																			{
																				console.log("login with google or twitter failed");
																				localStorage.setItem('id_token', authResult);
                                                                                localStorage.setItem('profile', social_profile);
																				
																				// Do error message here
																		    
                                                                                // Handle error
                                                                                return;
                                                                            }
																			
                                                                            //localStorage.setItem('id_token', authResult.idToken);
                                                                            //localStorage.setItem('profile', JSON.stringify(profile));
																			console.log(JSON.stringify(authResult));
																			console.log(JSON.stringify(profile));
																			
															                macco.model.login("","","google/twitter", {token : authResult, profile : profile});
                                                                         });
                                 });	
	};
	
	// This does not work----- so we may have to remove this eventially
    login_google = function(googleUser)
	{
        var profile = googleUser.getBasicProfile();
		
        console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
        console.log('Name: ' + profile.getName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail());
	};
					  

	
	
	loginResponse = function(message)
    {
        console.log('login response status : ' +message.status+ ' profiles =  ' +message.myProfiles);

        var login_error =  '<div class="alert alert-warning" role="alert">'
		                      + '<center>'
		                      + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'		  
                              + '<p style = "font-size:15px"><strong>Our apologies... An error occured while processing your information</strong></p>'
                              + '<p style = "font-size:15px">Please do try to submit the verification code again.</p>'
							  + '</center>'
                            + '</div>';

        var wrong_email = '<div class="alert alert-warning" role="alert">'
		                      + '<center>'
		                      + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'		  
                              + '<p style = "font-size:15px"><strong>This user does not exist</strong></p>'
                              + '<p style = "font-size:15px">We have no record of the email address you input. <br> Do make sure that you have your email address correctly.</p>'
							  + '</center>'
                            + '</div>';
								
        var wrong_password = '<div class="alert alert-warning" role="alert">'
		                       + '<center>'
		                          + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'		  
                                  + '<p style = "font-size:15px"><strong>Incorrect password</strong></p>'
                                  + '<p style = "font-size:15px"> Have you forgotten your password? <br> If you have then you can retrieve it by clicking the link below. <br> If you remember it then please do re-enter it correctly. </p>'
							   + '</center>'
                              + '</div>';

        var not_verified =  '<div class="alert alert-warning" role="alert">'
		                       + '<center>'
		                          + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'		  
                                  + '<p style = "font-size:15px"><strong>Your account has not yet been verified</strong></p>'
                                  + '<p style = "font-size:15px"> Before you can use login to your account you must verify it.'
                                         + '<br> Do click Here to have your verification code sent to you. Once you have it, do submit it to us for verification.</p>'
							   + '</center>'
                             + '</div>';


        var success = '<div class="alert alert-success" role="alert">'
		                       + '<center>'
		                          + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'		  
                                  + '<p style = "font-size:15px"><strong>Success ! - Loggin in</strong></p>'
                                  + '<p style = "font-size:15px"> You can now login to your account and use the advance features of MaCCO. <br> Enjoy !</p>'
							   + '</center>'
                             + '</div>';
						


        if(message.status === 'error')
        {
            $("#main-login-response").html(login_error);
            return;
        }

        if(message.status === 'incorrectEmail')
        {
            $("#main-login-response").html(wrong_email);
            return;
        }

        if(message.status === 'incorrectPassword')
        {
            $("#main-login-response").html(wrong_password);
            return;
        }
        
        if(message.status === 'account_not_verified')
        {
            $("#main-login-response").html(not_verified);
            return;
        }

        if(message.status === 'success')
        {
            // if we reach here then we have successfully logged in.
            setAnchorLoggedIn();
            return;
        }
                // if we reach here then our login was successful.  we load out page and update the nav-bar ie macco.nav
                //setAnchorLoggedIn();

        return;
    };

   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Name: forgotPassword
   //
   // Arguments: email - the email address for the account forgot
   //
   // Return Type: None
   //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   forgotPassword = function()
   {
        $("#main-response-forgot-password").html('<center><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></center>');    // set prompt area to empty string

        var email = document.getElementById('main-forgot-email').value;     // get the email address entered

        // possible prompt strings
        var no_email = '<div class="alert alert-warning" role="alert">'
				          + '<center>'
		                    + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'	
                            + '<p style = "font-size:15px"><strong> I think you forgot to input your email address.</strong></p>'
                            + '<p style = "font-size:15px">Make sure you enter a valid email address.</p>'
                          + '</center>'						  
                        + '</div>';                             // if no email was entered
						
        var invalid_email = '<div class="alert alert-warning" role="alert">'
				               + '<center>'
		                          + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'	
                                  + '<p style = "font-size:15px"><strong>I dont think you entered a valid email address.</strong></p>'
                                  + '<p style = "font-size:15px"> Make sure your enter one in the form name@domain.something.</p>'
							   + '</center>'
                             + '</div>';       // if an invalid email was entered

        if(email === '')
        {
           $("#main-response-forgot-password").html(no_email);
           return;
        }

        if(validateEmail(email) === false)
        {
           $("#main-response-forgot-password").html(invalid_email);
           return;
        }

        macco.model.forgotPassword(email);

        return;
   };


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Name: forgotPasswordResponse
   //
   // Arguments: msg - the message from the server holding the response to the forgot password call
   //
   // Return type: None.
   //
   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   forgotPasswordResponse = function(message)
   {
	   console.log('forgot_password  =  ' +message.status);
        // the response messages ////////////////////////////////////
        var login_error =  '<div class="alert alert-warning" role="alert">' 
				             + '<center>'
		                         + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'	
                                 + '<p style = "font-size:15px"><strong>Our apologies... An error occured while processing your information.</strong></p>'
                                 + '<p style = "font-size:15px">Please do try to submit your email address again.</p>'
						     + '</center>'
                           '</div>';


        var wrong_email =  '<div class="alert alert-warning" role="alert">'
				               + '<center>'
		                          + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'	
                                  + '<p> <strong style = "font-size:15px">No record of this email address in our system.</strong></p>'
                                  + '<p style = "font-size:15px"> We have no record of the email address you input. <br> Do make sure that you input your email address correctly'
								  +'</p></center></div>';


        var success =  '<div class="alert alert-success" role="alert">'
				           + '<center>'
		                       + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'	
                               + '<p style = "font-size:15px"><strong> Excellent ! </strong></p>'
                               + '<p style = "font-size:15px"> We have just sent you an email message that should let you know what to do.<br> Do visit your inbox to get access to your account once more.</p>'
						   + '</center>'
                        + '</div>';

        if(message.status === 'error')
        {
            $("#main-response-forgot-password").html(login_error);
            return;
        }

        if(message.status === 'wrong_email')
        {
            $("#main-response-forgot-password").html(wrong_email);
            return;
        }

        if(message.status === 'success')
        {
            // if we reach here then we have successfully logged in.
            $("#main-response-forgot-password").html(success);
            return;
        }

        return;

   };
	
	
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Name: signUpPage
        //
        // Arguments: None
        //
        // Return Type: None
        //
        //  This function is used to generate and display the markup for the sign-up or account registration page.
        //
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	    signUpPage = function()
	    {
	        var page = '<div class="container container-login">'
                                                     + '<div class="text-center">'
                                                        + '<h1 class="settings-heading">Sign up</h1>'
                                                     + '</div>'
                                                     + '<div class="col-md-5 col-xs-10 nopadding">'
													 	+ '<form>'
													       + '<div class="col-md-12 text-center">'
													          + '<p>'
				                                                 + '<button type="button" class="btn  btn-lg btn-three" id="main-login-button" onclick = macco.main.login_auth0()>login with <i class="fa fa-google" aria-hidden="true"></i> | <i class="fa fa-twitter" aria-hidden="true"></i></button>'
				                                              + '</p>'
													          + '<p>'
				                                                 + '<button type="button" class="btn  btn-lg btn-three" id="main-login-button" onclick = macco.main.login_facebook()>login with <i class="fa fa-facebook-square" aria-hidden="true"></i></button>'
				                                              + '</p>'
															  + '<h4 style = "font-size:16px"> or </h4>'
                                                          + '</div>'
                                                       + '</form>'
													 + '</div>'
													 + '<div class="col-md-5 col-xs-10 nopadding">'
													    + '<div class="col-md-12 text-center" id="main-registration-message"></div>'
													 + '</div>'
													 + '<div class="col-md-5 col-xs-10 nopadding">'
                                                      + '<form>'
                                                        + '<div class="col-md-12 text-center">'
                                                            + '<div class="form-group text-left">'
                                                               + '<label for="Email">E-mail:</label>'
                                                                  + '<input type="email" class="form-control" id="main-registration-email" placeholder="Enter your e-mail">'
                                                            + '</div>'
                                                            + '<div class="form-group text-left">'
                                                               + '<label for="Password">Password:</label>'
                                                               + '<input type="password" class="form-control" id="main-registration-password" placeholder="Enter your password">'
                                                            + '</div>'
                                                            + '<button type="button" class="btn  btn-lg btn-first" id="main-registration-button" onclick = macco.main.signUp()>Create Account</button>'
                                                            + '<a  data-toggle="collapse" href="#collapseVerifyAccount" aria-expanded="false" aria-controls="collapseVerifyAccount">'
                                                                + 'Verify your account'
                                                            + '</a>'														
                                                            + '<div class="collapse" id="collapseVerifyAccount">'
                                                                + '<div id="main-verify-message"></div>'
                                                                + '<div class="form-group text-left">'
                                                                    + '<label for="code">Verification code:</label>'
                                                                    + '<input type="text" class="form-control" id="main-verification-code" placeholder="enter your code here">'
                                                                + '</div>'
                                                                + '<button type="button" class="btn  btn-lg btn-first" id="main-verifcation-button" onclick = macco.main.verify()>Submit code</button>'
                                                            + '</div>'
                                                        + '</div>'
													 + '</form>'
													 + '</div>'
                                                     + '<div class="col-md-5 col-xs-10 nopadding">'													   
													 + '<form>'
                                                       + '<div class="col-md-12 text-center">'													   
                                                            + '<a  data-toggle="collapse" href="#collapseGetCode" aria-expanded="false" aria-controls="collapseGetCode">'
                                                                + 'Get your verification code'
                                                            + '</a>'															
															+ '<div class="collapse" id="collapseGetCode">'
															+ '<div id="main-send-verification-message"></div>'
                                                                + '<div class="form-group text-left">'
                                                                    + '<label for="code">E-mail:</label>'
                                                                    + '<input type="text" class="form-control" id="main-verification-email" placeholder="enter your email address here">'
                                                                + '</div>'
                                                                + '<button type="button" class="btn  btn-lg btn-first" id="main-send-verifcation-button" onclick = macco.main.getVerificationCode()>Get my code</button>'
															+ '</div>'
                                                       + '</div>'
                                                     + '</form>'
                                                    + '</div>'
                             + '</div>';
			
			stateMap.$container.html(String() + page);
	};

	
	
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Name: signUp
    //
    // Arguments - None
    //
    // Return Type - None
    //
    //  This function is used to process the information input by the user on the signup or registration page and then sends the information to the model to attempt
    //  to create an account.
    //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    signUp = function()
    {
	     $("#main-registration-message").html('<center><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></center>');
         var email = document.getElementById('main-registration-email').value;
	     var password = document.getElementById('main-registration-password').value;
		 
         var verification = "email";

				
         var no_email = '<div class="alert alert-warning" role="alert">'
		                   + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
						   //+ '<center>'
                               + '<p style = "font-size:15px"><strong>I think you forgot to input your email address.</strong></p>'
                               + '<p style = "font-size:15px">Make sure you enter a valid email address.'
						   // + '</center>'
                        + '</div>';

	      var no_password = '<div class="alert alert-warning" role="alert">'
		                      + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'		  
                              + '<p style = "font-size:15px"><strong>I didnt see you enter a password...</strong></p>'
                              + '<p style = "font-size:15px">Make sure you fill in your password.</p>'
                            + '</div>';

	      var invalid_email = '<div class="alert alert-warning" role="alert">'
		  		                 + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                 + '<p style = "font-size:15px"><strong> I dont think you entered a valid email address.</strong></p>'
                                 + '<p style = "font-size:15px">Make sure your enter a valid email address in the correct format. For example, my-email@dom.com</p>'
                              + '</div>';

	      var invalid_login = '<div class="alert alert-warning" role="alert">'
		  		                + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                + '<p style = "font-size:15px"><strong> Nope... That email and password combination dont compute.</strong></p>'
                                + '<p style = "font-size:15px"> Try again. If you forgot your password click the link to the bottom right to retrieve it.</p>'
                              + '</div>';

	      var signup_error =  '<div class="alert alert-warning" role="alert">'
		  		                + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                + '<p style = "font-size:15px"><strong>Our apologies... An error occured while processing your information.</strong> </p>'
                                + '<p style = "font-size:15px"> Please do try to create an account again</p>'
                              + '</div>';

	      var user_exists =  '<div class="alert alert-warning" role="alert">'
		  		                + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                + '<p style = "font-size:15px"><strong> Do you already have an account with us?</strong></p>'
                                + '<p style = "font-size:15px"> An account already exists for the email address you input. <br> Do try another email address.</p>'
                             + '</div>';
		
	     if(email === '')
	     {
	        $("#main-registration-message").html(no_email);
	        return;
	     }
	     if(password === '')
         {
 	        $("#main-registration-message").html(no_password);
	        return;
	     } 
        if(validateEmail(email) === false)
        {
  	        $("#main-registration-message").html(invalid_email);
	        return;
        }
	
        macco.model.signup(email, password, verification);   // attempt to create an account
        console.log("Verfication type = " +verification);		      
    };
	
	
     ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
     //
     // Name: signupResponse 
     //
     // Arguments: message- This is the response message that coes from the server.
     //
     // Return Type: None
     //
     // This function is used to process signup response messages that come from the model
     //
     //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    signupResponse = function(message)
    {
        var signup_error =  '<div class="alert alert-warning" role="alert">'
				  		       + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                               + '<p style = "font-size:15px"><strong> Our apologies... An error occured while processing your information.</strong></p>'
		                       + '<p style = "font-size:15px">Please do try to submit the verification code again.</p>'
                             + '</div>';

        var signup_success = '<div class="alert alert-success" id = "signupalert">' 
				  		         + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                 + '<p style = "font-size:15px"><strong style = "font-size:15px">Success! - Your account has been created</strong> </p>'
                                 + '<p style = "font-size:15px"> Your verification code has been sent to your email address. Do copy the verification code and paste and paste it into the verification form below.</p>'
			                 + '</div>';
					 
        var user_exists =  '<div class="alert alert-warning" role="alert">'
				  		        + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
		                        + '<p style = "font-size:15px"><strong style = "font-size:15px">This user already exists</strong></p>'
                                + '<p style = "font-size:15px"> We already have a user that uses the email address you entered. <br> Are you that user? <br> If you are not try using a different email address.'
                                + '</p> </div>';

	    var success =  '<div class="alert alert-success" role="alert">< Success ! - Your account has been verified.'
				  		  + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
  		                  + '<p style = "font-size:15px"> You can now login to your account and use the advance features of MaCCO. <br> Enjoy !</p>'
			         + '</div>';
       
        if(message.status === 'error')
        {
            $("#main-registration-message").html(signup_error);
            return;
        }

        if(message.status === 'userExists')
        {
            $("#main-registration-message").html(user_exists);
            return;
        }

        if(message.status === 'success')
        {
            $("#main-registration-message").html(signup_success);
            return;

        }
				
        return;
    };
	

	
	    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Name: verify
    // 
    // Arguments: None
    //
    // Return Type: None
    //
    // This function is used to verify an account by sending the verification code to the model and finally to the server.
    //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    verify = function()
    {
	    $("#main-verify-message").html('<center><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></center>');
		
	    var no_code = '<div class="alert alert-warning" role="alert">'
		                   + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                               + '<p style = "font-size:15px"><strong>I think you forgot to input your code below.</strong></p>'
                               + '<p style = "font-size:15px">Make sure you paste your verification code below before clicking the <strong>Submit</strong> button. </p>'
                        + '</div>';
						
			
        var code = document.getElementById('main-verification-code').value;   // get the code
		
		if((code === undefined) || (code === null) || (code === ""))
		{
			$("#main-verify-message").html(no_code);
            return;				
		}
	
        macco.model.verifyAccount(code);   // attempt to create an account		      
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Name: getVerificationCode
    //
    // Arguments: none
    //
    // Return Type: none
    //
    // this function gets the email form the form that requests the mail address to send the verification code to and them passes it to the model to make the request of the server
    //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
    getVerificationCode = function()
    {
        $("#main-send-verification-message").html('<center><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></center>');
		
		var no_email = '<div class="alert alert-warning" role="alert">'
		                   + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
						   //+ '<center>'
                               + '<p style = "font-size:15px"><strong>I think you forgot to input your email address.</strong></p>'
                               + '<p style = "font-size:15px">Make sure you enter a valid email address below before clicking the button.'
						   // + '</center>'
                        + '</div>';
						
		var invalid_email = '<div class="alert alert-warning" role="alert">'
		  		                 + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                 + '<p style = "font-size:15px"><strong> I dont think you entered a valid email address.</strong></p>'
                                 + '<p style = "font-size:15px">Make sure your enter a valid email address below, in the correct format. For example, my-email@dom.com</p>'
                              + '</div>';				
		
		
        var email = document.getElementById('main-verification-email').value; //get the email input into the form
		
		if((email === undefined) || (email === null) || (email === ""))
		{
			$("#main-send-verification-message").html(no_email);
            return;			
		}
		
		if(validateEmail(email) === false)
		{
			$("#main-send-verification-message").html(invalid_email);
            return;				
		}

        macco.model.getVerificationCode(email); // make a request of the model

    };	
	

	
    getVerificationCodeResponse = function(message)
    {
        console.log('get code response status : ' +message.status);

        var server_error =  '<div class="alert alert-warning" role="alert">'
						  		 + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
		                         + '<p> <strong style = "font-size:15px"> Our apologies... An error occured while trying to process your request.</strong></p>'
                                 + '<p>Please do try to submit your email again.</p></div>';


        var wrong_email =  '<div class="alert alert-warning" role="alert">'
						  		+ '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                + '<p> <strong style = "font-size:15px">We dont have a code for this email address</strong></p>'
                                + '<p style = "font-size:15px"> Did you sign up with the email adress you input? if not make sure you sign up for an account by clicking here.'
                                     + '<br> Perhaps you already verified you account. If you already verified your account there is no need to do so again. Click here to go to the login page'
                                + '</p> </div>';

        var success =  '<div class="alert alert-success" role="alert">'
						    + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
		                    + '<p> <strong style = "font-size:15px">Success ! - Your verification code has been resent to your email </strong></p>'
                            + '<p style = "font-size:15px">Please do copy the entire code, paste it into the field below and submit it to verify that you are human.</p>'
                        + '</div>';

        if(message.status === 'error')
        {
            $("#main-send-verification-message").html(server_error);
            return;
        }

        if(message.status === 'email_not_found')
        {
            $("#main-send-verification-message").html(wrong_email);
            return;
        }

        if(message.status === 'could_not_send_code')
        {
            $("#main-send-verification-message").html(wrong_email);
            return;
        }

        if(message.status === 'success')
        {
            $("#main-send-verification-message").html(success);
            return;
        }

        return;
    };


    codeResponse = function(message)
    {

        console.log('Verification code response : ' +message.status);

        var verify_error =  '<div class="alert alert-warning" role="alert">'
		                        + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
		                        + '<p> <strong style = "font-size:15px"> Our apologies... An error occured while processing your verification code.</strong></p>'
		                        + '<p style = "font-size:15px"> Please do try to resubmit the code sent to your email.</p> </div>';

        var invalid_code =  '<div class="alert alert-warning" role="alert">'
						  		+ '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                + '<p> <strong style = "font-size:15px">Invalid verification code</strong></p>'
							 + '</div>';
							 
	    var success =  '<div class="alert alert-success" role="alert">'
		                   + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
		                   + '<p> <strong style = "font-size:15px"> Success ! - Your account has been verified.</strong></p>'
	                       + '<p style = "font-size:15px"> You can now login to your account and use the advance features of XiVents. <br> Enjoy !</p>'
	                    + '</div>';


        if(message.status === 'error')
        {
            $("#main-verify-message").html(verify_error);
            return;
        }

        if(message.status === 'invalid_code')
        {
            $("#main-verify-message").html(invalid_code);
            return;
        }


        if(message.status === 'invalidCode')
        {
            $("#main-verify-message").html(invalid_code);
            return;
        }

        if(message.status === 'success')
        {
            // go to the login page.
            $("#main-verify-message").html(success);
            return;
        }  

    };

        aboutPage = function()
        {
            stateMap.$container.html(String() + '<!-- Page Content -->'
                                              + '<div class="container container-pfy">'
                                                   + '<div class=" col-md-12 col-lg-12 col-sm-12 col-xs-10 toppad" >'
                                                      + '<div class="row">'
                                                         + '<div class="col-md-5 col-lg-5">' 
                                                            + '<img alt="User Pic" src="images/x-full-size.png" class="img-responsive image-user">' 
                                                         + '</div>'
                                                         + '<div class="col-md-6 col-lg-6  info-user">'
                                                            + '<h1>xivents.co</h1>'
                                                            + '<h2 class="red">@xivents</h2>'
                                                            + '<ul class="nopadding">'
                                                            + '<li><h4>Address:</h4><a href="#">Cunupia, Trinidad & Tobago</a></li>'
                                                            + '<li><h4>Website:</h4><a href="http://159.203.106.44:3000/">xivents.co</a></li>'
                                                            + '<li><h4>Email:</h4><a href="mailto:jachian@gmail.com">jachian@gmail.com</a></li>'
                                                            + '<li><h4>Phone:</h4><a href="tel:+18687885499">+1-868-788-5499</a></li>'
                                                            + '<li>'
                                                            + '<h4>About us:</h4>'
                                                                + '<p> This application get you in touch with is currently happening around you and what will be happening in the future.</p>'
                                                            + '</li>'
                                                            + '</ul>'
                                                         + '</div>'
                                                         + '<div class="col-md-1 col-lg-1 col-sm-12  info-user">'
                                                            + '<button type="button" class="community" data-toggle="modal" data-target=".bs-example-modal-lg">000/000</button>'
                                                         + '</div>'
                                                         + '</div>'
                                                         + '<hr>'
                                                         + '<div role="tabpanel">'
                                                            + '<!-- Nav tabs -->'
                                                            + '<div class="row">'
                                                               + '<ul class="nav nav-tabs" role="tablist">'
                                                                    + '<li role="presentation" class="active">'
                                                                       + '<a href="#about" aria-controls="about" role="tab" data-toggle="tab">About </a>'
                                                                    + '</li>'
                                                                    + '<li role="presentation"><a href="#covenant" aria-controls="Privacy" role="tab" data-toggle="tab">Covenant</a></li>'
                                                                    + '<li role="presentation"><a href="#Progress" aria-controls="Progress" role="tab" data-toggle="tab">Development</a></li>'
                                                                    + '<li role="presentation"><a href="#Help" aria-controls="Help" role="tab" data-toggle="tab">Help</a></li>'																	
                                                               + '</ul>'
                                                            + '<div class="col-sm-4 col-md-4 col-xs-3 nopadding pull-right">'
                                                               // + '<form class="navbar-form nopadding" role="search">'
                                                            // + '<div class="input-group">'
                                                              // + '<input type="text" class="form-control" placeholder="Filter" name="q">'
                                                              // + '<div class="input-group-btn">'
                                                               //   + '<button class="btn btn-default" type="submit"><i class="glyphicon glyphicon-search"></i></button>'
                                                              //  + '</div>'
                                                            // + '</div>'
                                                            // + '</form>'
                                                         + '</div>'
                                                      + '</div>'
				                      + '<div class="tab-content">'
				                         + '<div role="tabpanel" class="tab-pane fade in active" id="about">'
                                                                + '<p> This application puts you in touch with events happening around you. '
                                                                + 'Users are able to discover events happening all over the globe that are posted and promoted by our community of users.'
                                                                + 'Interested in finding out whats going on near you? This free service is available to you without the need to sign on.'
                                                                + 'If however you wish to promote your own events and intimately interact with our community of users then dont hesitate to '
                                                                + 'create an account.'
                                                                + '<br> <small> -- Happy discovery- xiVents.co design team.</small></p>'
                                         + '</div>'
                                         + '<div role="tabpanel" class="tab-pane fade in inactive" id="covenant">'
										    // + '<small><div class="alert alert-warning" role="alert">'
										       + '<p> By using this xivents.co you agree to this covenant us and other platform users.</p>'
											   + '<p> You agree to: </p>'
											   + '<p></p>'
											   + '<div class="alert" role="alert">'
										            + '<table class="table table-condensed">'
                                                        + '<tr>'
												           + '<td>1</td>'
													       + '<td>'
														     + '<strong> Not use the platform for spam - </strong>'
									                         + '<br> That is, using fake tags or deceptive links or try to mislead others about the events you post.'
													         + '<br> Using malicious code in your posts.'
													         + '<br> Using xiVents as a vehicle for generating revenue for affiliate marketing.'
													         + '<br> using the platform for phishing.'
													       + '</td>'
												        + '</tr>'
                                                        + '<tr>'
												           + '<td>2</td>'
													       + '<td>'
														     + '<strong> Not use the platform to post hate events and movements - </strong>'
											                 + '<br> That is, events that promote hatred of people of specific nationalities, ethnic groups, religious persuasions, political affiliation, age or anything else.'
													         + '<br> In this regard we consider white supremacy and radical feminism to be included in our list of hate groups.'
													       + '</td>'
												        + '</tr>'
                                                        + '<tr>'
												           + '<td>3</td>'
													       + '<td>'
														     + '<strong> Not use the platform to promote self-harm or events specifically designed to promote self-harm -</strong>'
                                                             + '<br> That is, events that glorify self-harm and that encourage participants to harm themselves.'
														   + '</td>'
												        + '</tr>'
                                                        + '<tr>'
												           + '<td>4</td>'
													       + '<td>'
														     + '<strong> Not post the personal information of any users or third parties without their express permission -</strong>'
                                                             + '<br> This will include addresses, phone/mobile numbers, email addresses, identification/permit numbers, etc.'
													       + '</td>'
												        + '</tr>'
                                                        + '<tr>'
												           + '<td>5</td>'
													       + '<td>'
														     + '<strong> Not use bots or other computers to automate registrations and posts-</strong>'
                                                             + '<br> You must be a sentient, biological organism to use this platform.'
													       + '</td>'
												        + '</tr>'
                                                        + '<tr>'
												           + '<td>6</td>'
													       + '<td>'
														     + '<strong> Not impersonate others-</strong>'
                                                             + '<br> You must not pretent or represent yourself as someone else.'
													       + '</td>'
												        + '</tr>'	
                                                        + '<tr>'
												           + '<td>7</td>'
													       + '<td>'
														     + '<strong> Not post illegal content-</strong>'
                                                             + '<br> You cannot post content that violates any of the laws or regulations of the state or territory which you are posting from.'
													       + '</td>'
												        + '</tr>'
                                                        + '<tr>'
												           + '<td>8</td>'
													       + '<td>'
														     + '<strong> Not impersonate others-</strong>'
                                                             + '<br> You must not pretent or represent yourself as someone else.'
													       + '</td>'
												        + '</tr>'
                                                        + '<tr>'
												           + '<td>9</td>'
													       + '<td>'
														     + '<strong> Not post illegal content-</strong>'
                                                             + '<br> You cannot post content that violates any of the laws or regulations of the state or territory which you are posting from.'
													       + '</td>'
												        + '</tr>'
                                                        + '<tr>'
												           + '<td>10</td>'
													       + '<td>'
														     + '<strong> Not post strong sexual content or pornography or events that will be considered adult oriented-</strong>'
                                                             + '<br> You cannot post content that is considered pornographic or sexually indecent.'
													       + '</td>'
												        + '</tr>'
                                                        + '<tr>'
												           + '<td>11</td>'
													       + '<td>'
														     + '<strong> Not post content or events that hurt children, minors or young people-</strong>'
                                                             + '<br> You must not post events or other content about children that is violent or sexual in nature.'
													       + '</td>'
												        + '</tr>'														
                                                        + '<tr>'
												           + '<td>12</td>'
													       + '<td>'
														     + '<strong> Not try to circumvent or compromise our security-</strong>'
                                                                + '<br> This include attempting to access non-public areas of the platform. Using automated technology to access the platform.'
													            + 'Scraping content. Interfering with other users use of the platform. Intentionally load testing our Service or see how much traffic it can handle.'
													            + 'Overload our servers with traffic. Distribute viruses or malware to or through Ello.'
													       + '</td>'
												        + '</tr>'
                                                        + '<tr>'
												           + '<td>13</td>'
													       + '<td>'
														     + '<strong>In conclusion-</strong>'
                                                             + '<br> If you break our covenant we may contact you and ask you to fix the problem immediately or we may simply suspend or delete your account.'
													         + 'We reserve the right to enforce or not to enforce this covenant in whatever way we see fit, at our sole discretion.'
                                                             + 'Also this covenant does not create a duty or contractual obligation for us to act in any particular manner. And we reserve the right to change this agreement at any time. So do behave yourself.'
													       + '</td>'
												        + '</tr>'														
											      + '</table>'
											  + '</div>' 
                                         + '</div>'
                                         + '<div role="tabpanel" class="tab-pane fade in inactive" id="Progress">'
										      + '<p> XiVents is still in development, so while you can use the service now, additional functionality will become available as we continue to develop the platform.</p>'
											  + '<p> Below is a rough development schedule. As functionality becomes available we will strike it off the list. </p>'
											  + '<div class="alert" role="alert">'
										      + '<table class="table table-condensed">'
											     + '<tr>'
												     + '<th><small>#</small></th>'
													 + '<th><small>Functionality/Service/Issue</small></th>'
													 + '<th><small>Status</small></th>'
													 + '<th><small>Notes</small></th>'
												 + '</tr>'
                                                 + '<tr>'
												     + '<td><small>-3</small></td>'
													 + '<td><small>Point Site to Domain</small></td>'
													 + '<td><small>In Progress</small></td>'
													 + '<td><small>Scheduled completion Date - Feb 1, 2016</small></td>'
												 + '</tr>'												 
                                                 + '<tr>'
												     + '<td><small>-2</small></td>'
													 + '<td><small>Set up Reverse Proxy</small></td>'
													 + '<td><small>In Progress</small></td>'
													 + '<td><small>Scheduled completion Date - Feb 1, 2016</small></td>'
												 + '</tr>'
                                                 + '<tr>'
												     + '<td><small>-1</small></td>'
													 + '<td><small>Footer Deployment</small></td>'
													 + '<td><small>In Progress</small></td>'
													 + '<td><small>Scheduled completion Date - Feb 1, 2016</small></td>'
												 + '</tr>'												 
                                                 + '<tr>'
												     + '<td><small>0</small></td>'
													 + '<td><small> Last Pass to public Deployment</small></td>'
													 + '<td><small>In Progress</small></td>'
													 + '<td><small>Scheduled completion Date - March 31, 2016</small></td>'
												 + '</tr>'												 
                                                 + '<tr>'
												     + '<td><small>1</small></td>'
													 + '<td><small>Socket Encryption</small></td>'
													 + '<td><small>In Progress</small></td>'
													 + '<td><small>Scheduled completion Date - Feb 1, 2016</small></td>'
												 + '</tr>'
                                                 + '<tr>'
												     + '<td><small>2</small></td>'
													 + '<td><small>Ratification of privacy policy</small></td>'
													 + '<td><small>In Progress</small></td>'
													 + '<td><small>Scheduled completion Date - to be determined</small></td>'
												 + '</tr>'	
                                                 + '<tr>'
												     + '<td><small>3</small></td>'
													 + '<td><small>User help page</small></td>'
													 + '<td><small>In Progress</small></td>'
													 + '<td><small>Scheduled completion Date - to be determined</small></td>'
												 + '</tr>'	
                                                 + '<tr>'
												     + '<td><small>4</small></td>'
													 + '<td><small>Events Filter - Profile Page</small></td>'
													 + '<td><small>In Progress</small></td>'
													 + '<td><small>Scheduled completion Date - to be determined</small></td>'
												 + '</tr>'
                                                 + '<tr>'
												     + '<td><small>5</small></td>'
													 + '<td><small>Track List Tab - Profile Page</small></td>'
													 + '<td><small>In Progress</small></td>'
													 + '<td><small>Scheduled completion Date - to be determined</small></td>'
												 + '</tr>'	
                                                 + '<tr>'
												     + '<td><small>6</small></td>'
													 + '<td><small>New Stream Tab - Profile Page</small></td>'
													 + '<td><small>In Progress</small></td>'
													 + '<td><small>Scheduled completion Date - to be determined</small></td>'
												 + '</tr>'
                                                 + '<tr class="success">'
												     + '<td><small>7</small></td>'
													 + '<td><small>Edit Option - Profile Page</small></td>'
													 + '<td><small>Done</small></td>'
													 + '<td><small>Completed Dec 22, 2015</small></td>'
												 + '</tr>'
	                                                 + '<tr class="success">'
												     + '<td><small>8</small></td>'
													 + '<td><small>Search Functionality</small></td>'
													 + '<td><small>Done</small></td>'
													 + '<td><small>Feb 27, 2016</small></td>'
												 + '</tr>'
                                                 + '<tr class="success">'
												     + '<td><small>9</small></td>'
													 + '<td><small>Filter Hashtags</small></td>'
													 + '<td><small>Done</small></td>'
													 + '<td><small>Feb 27</small></td>'
												 + '</tr>'	
                                                 + '<tr class="success">'
												     + '<td><small>10</small></td>'
													 + '<td><small>Database Encryption - User information</small></td>'
													 + '<td><small>Done</small></td>'
													 + '<td><small>Completed Jan 23, 2016</small></td>'
												 + '</tr>'
                                                 + '<tr class="success">'
												     + '<td><small>11</small></td>'
													 + '<td><small>Change Password Functionality - Settings page</small></td>'
													 + '<td><small>Done</small></td>'
													 + '<td><small>Completed on Dec 26, 2015</small></td>'
												 + '</tr>'	
                                                 + '<tr class="success">'
												     + '<td><small>12</small></td>'
													 + '<td><small>Limit the number of profiles to 5 per user.</small></td>'
													 + '<td><small>Done</small></td>'
													 + '<td><small>Dec 28, 2015 - this is not doen on the server side. pnly checking on the client.</small></td>'
												 + '</tr>'	
                                                 + '<tr class="success">'
												     + '<td><small>13</small></td>'
													 + '<td><small>Modify required (*) field on Post and event and Edit an event pages.</small></td>'
													 + '<td><small>Done</small></td>'
													 + '<td><small>Completed Dec 28, 2015</small></td>'
												 + '</tr>'
                                                 + '<tr>'
												     + '<td><small>14</small></td>'
													 + '<td><small>Secure upload Photo/image - choose a file functionality so that the system deleted images that are not used.</small></td>'
													 + '<td><small>In Progress</small></td>'
													 + '<td><small>Scheduled completion Date - to be determined</small></td>'
												 + '</tr>'	
                                                 + '<tr>'
												     + '<td><small>15</small></td>'
													 + '<td><small>Social media integration (Facebook, twitter, google+.</small></td>'
													 + '<td><small>In Progress</small></td>'
													 + '<td><small>Scheduled completion Date - to be determined</small></td>'
												 + '</tr>'	
												 
											  + '</table>'
											  + '</div>'
                                         + '</div>'
										 + '<div role="tabpanel" class="tab-pane fade in inactive" id="Help">'
										    //+ '<small><div class="alert alert-warning" role="alert">'
										       + '<p> Hi! <br> Still working on this. We will let you know as soon as its done. </p>'
                                            //+ '</small></div>'											   
                                         + '</div>'
                                      + '</div>'
									  + '<footer></footer>');
        };
		
		
	


        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Name: postEventForm
        //
        // Arguments: none
        // 
        // Return Type: None
        //
        // This function is used to display the form that lets users post an event
        //
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        postEventForm = function(index)
        {

            var event_form =     '<!-- Page Content -->'
                                       + '<div class="container container-ep">'
		                           + '<div class="text-center">';
			
			var ev = null;
								   
			if((index === undefined) || (index === null) || (index < 0))
            {		
                console.log("postEventform Index = " +index);
				
			    event_form = event_form + '<h1 class="settings-heading">Post an Event</h1>'
		                           + '</div>'
                                           + '<div class = "text-center" id = "post-event-message-top">'
                                           + '</div>'
	                                   + '<div class="col-md-10 col-xs-10 col-md-offset-1 nopadding">'
		                              + '<form>'
		                                  + '<div class="col-md-5 col-xs-12 pull-left">'
		                                      + '<div class="form-group">'
		                                         + '<label for="Event">Event Title<span class="red">*</span>:</label>'
		                                         + '<input type="text" class="form-control" id="post-event-name" placeholder="Name your event" >'
		                                      + '</div>'
		                                      + '<div class="form-group">'
		                                           + '<label for="Additional">Additional details:</label>'
		                                           + '<textarea name="text" class="form-control" id="post-event-details" placeholder="Event details/info about this event..." ></textarea>'
		                                      + '</div>'	
                                                  + '<div class="form-group">'
                                                        + '<label for="Event">Link:</label>'
                                                        + '<input type="text" class="form-control" id="post-event-link" placeholder="link to more details." >'
                                                  + '</div>'
                                                  + '</div>'
		                                  + '<div class="col-md-4 col-xs-8 pull-right field-left">'
		                                      + '<div class="form-group">'
		                                          + '<label for="Location">Location:</label>'
		                                          + '<input type="text" class="form-control" id="post-event-location" placeholder="Where is it happening?">'
		                                      + '</div>'
		                                  + '<div class="form-group">'
		                                      + '<label for="Street">Street<span class="red">*</span>:</label>'
		                                      + '<input type="text" class="form-control" id="post-event-street" placeholder="Street location">'
		                                  + '</div>'
		                                  + '<div class="form-group">'
		                                      + '<label for="City">City/Town<span class="red">*</span>:</label>'
		                                      + '<input type="text" class="form-control" id="post-event-city" placeholder="City/Town">'
		                                  + '</div>'
		                                  + '<div class="form-group">'
		                                      + '<label for="State">State/Country<span class="red">*</span>:</label>'
		                                      + '<input type="text" class="form-control" id="post-event-state" placeholder="Country/State">'
		                                  + '</div>'
		                           + '</div>'
		                           + '<div class="col-md-3 col-xs-4 pull-left">'
		                                  + '<div class="form-group">'
		                                      + '<label for="Date">Date<span class="red">*</span>:</label>'
		                                      + '<input type="text" data-format="YYYY-MM-DD" id="post-event-date"></input>'
		                                  + '</div>'
		                                  + '<div class="form-group">'
		                                      + '<label for="Stime">Start time<span class="red">*</span>:</label>'
		                                      + '<input type=time class="form-control" id="post-event-start-time">'
		                                  + '</div>'
                                                  + '<div class="form-group">'
                                                      + '<label for="Date">End date:</label>'
                                                      + '<input type="text" data-format="YYYY-MM-DD" id="post-event-end-date"></input>'
                                                  + '</div>'
		                                  + '<div class="form-group">'
		                                      + '<label for="Endtime">End time:</label>'
		                                      + '<input type=time class="form-control" id="post-event-end-time" placeholder="-- : --">'
		                                  + '</div>'
		                            + '</div>'		
	                                    // + '<div class="col-md-8 col-xs-8 pull-left">'
                                            + '<div class="col-md-12 col-xs-10 pull-left">'
		                                  + '<div class="form-group">'
		                                      + '<label for="Tags">Tags:</label>'
		                                      + '<input type="text" class="form-control" id="post-event-tags" placeholder="Add tags to this event to make it easier to find - (comma separated).">'
		                                  + '</div>'
		                            + '</div>'
                                            + '<div class="col-md-8 col-xs-8 pull-left">'
                                                  + '<label>Pin the location:</label>'
                                            + '</div>'
	                                + '<div class="col-md-12 col-xs-12 container-map-ep" id = "pin">'
		                            + '</div>'
		                            + '<div class="col-md-6 col-xs-6 pull-left">'
		                                + '<p>'
		                                    + 'Add Event Photo/Image: <input type="hidden" name="picture" role="uploadcare-uploader" id = "post-event-image" /> ' //'<button 
		                                + '</p>'
		                            + '</div>'
		                            + '<div class="col-md-6 col-xs-6 pull-right">'
		                                + '<p>'
		                                    + '<button type="button" class="btn  btn-lg btn-first" id = "post-event-button-post" onclick = macco.main.postEvent(null)>Post Event</button>'
		                                + '</p>'
		                            +  '</div>'
		                            + '</form>'
                                            + '<div class="col-md-12 col-xs-12 text-center" id = "post-event-message-bottom">'
                                            + '</div>'
		                      + '</div>'
                                      + '<!-- Footer -->'
                                      + '<footer>'            
                                      + '</footer>'
                                 + '</div>'
                                 + '<div class = "text-center" id = "post-event-message-bottom- 1">'
                                 + '</div>';
								 
			}
			else
			{
				ev = macco.counter.getEvent(index);
				
				event_form = event_form + '<h1 class="settings-heading">Re-Post as New Event</h1>'
		                           + '</div>'
                                           + '<div class = "text-center" id = "post-event-message-top">'
                                           + '</div>'
	                                   + '<div class="col-md-10 col-xs-10 col-md-offset-1 nopadding">'
		                              + '<form>'
		                                  + '<div class="col-md-5 col-xs-12 pull-left">'
		                                      + '<div class="form-group">'
		                                         + '<label for="Event">Event Title<span class="red">*</span>:</label>'
		                                         + '<input type="text" class="form-control" id="post-event-name" placeholder="Name your event" value="' +ev.title+ '" >'
		                                      + '</div>'
		                                      + '<div class="form-group">'
		                                           + '<label for="Additional">Additional details:</label>'
		                                           + '<textarea name="text" class="form-control" id="post-event-details" placeholder="Event details/info about this event..." >' +ev.details+ '</textarea>'
		                                      + '</div>'	
                                                  + '<div class="form-group">'
                                                        + '<label for="Event">Link:</label>'
                                                        + '<input type="text" class="form-control" id="post-event-link" placeholder="link to more details." value="' +ev.link+ '">'
                                                  + '</div>'
                                                  + '</div>'
		                                  + '<div class="col-md-4 col-xs-8 pull-right field-left">'
		                                      + '<div class="form-group">'
		                                          + '<label for="Location">Location:</label>'
		                                          + '<input type="text" class="form-control" id="post-event-location" placeholder="Where is it happening?" value="' +ev.location+ '">'
		                                      + '</div>'
		                                  + '<div class="form-group">'
		                                      + '<label for="Street">Street<span class="red">*</span>:</label>'
		                                      + '<input type="text" class="form-control" id="post-event-street" placeholder="Street location" value="' +ev.street+ '">'
		                                  + '</div>'
		                                  + '<div class="form-group">'
		                                      + '<label for="City">City/Town<span class="red">*</span>:</label>'
		                                      + '<input type="text" class="form-control" id="post-event-city" placeholder="City/Town" value="' +ev.city+ '">'
		                                  + '</div>'
		                                  + '<div class="form-group">'
		                                      + '<label for="State">State/Country<span class="red">*</span>:</label>'
		                                      + '<input type="text" class="form-control" id="post-event-state" placeholder="Country/State" value="' +ev.state+ '">'
		                                  + '</div>'
		                           + '</div>'
		                           + '<div class="col-md-3 col-xs-4 pull-left">'
		                                  + '<div class="form-group">'
		                                      + '<label for="Date">Date<span class="red">*</span>:</label>'
		                                      + '<input type="text" data-format="YYYY-MM-DD" id="post-event-date" value="' +moment(ev.startDate).format('YYYY-MM-DD')+ '"></input>'
		                                  + '</div>'
		                                  + '<div class="form-group">'
		                                      + '<label for="Stime">Start time<span class="red">*</span>:</label>'
		                                      + '<input type=time class="form-control" id="post-event-start-time" value="' +moment(ev.startDate).format('HH:mm')+ '">'
		                                  + '</div>'
                                                  + '<div class="form-group">'
                                                      + '<label for="Date">End date:</label>'
                                                      + '<input type="text" data-format="YYYY-MM-DD" id="post-event-end-date" value="' +moment(ev.endDate).format('YYYY-MM-DD')+ '"></input>'
                                                  + '</div>'
		                                  + '<div class="form-group">'
		                                      + '<label for="Endtime">End time:</label>'
		                                      + '<input type=time class="form-control" id="post-event-end-time" placeholder="-- : --" value="' +moment(ev.endDate).format('HH:mm')+ '">'
		                                  + '</div>'
		                            + '</div>'		
	                                    // + '<div class="col-md-8 col-xs-8 pull-left">'
                                            + '<div class="col-md-12 col-xs-10 pull-left">'
		                                  + '<div class="form-group">'
		                                      + '<label for="Tags">Tags:</label>'
		                                      + '<input type="text" class="form-control" id="post-event-tags" placeholder="Add tags to this event to make it easier to find - (comma separated)."';
											  var t_string = ev.tags[0];
											  for(var i = 1; i < ev.tags.length; i++)
											  {
												  t_string = t_string + ',' +ev.tags[i];
											  }
											  
									event_form = event_form + 'value="' +t_string+ '">'
		                                  + '</div>'
		                            + '</div>'
                                            + '<div class="col-md-8 col-xs-8 pull-left">'
                                                  + '<label>Pin the location:</label>'
                                            + '</div>'
	                                    + '<div class="col-md-12 col-xs-12 container-map-ep" id = "pin">'
		                            + '</div>'
		                            + '<div class="col-md-6 col-xs-6 pull-left">'
		                                + '<p>'
		                                    + 'Add Event Photo/Image: <input type="hidden" name="picture" role="uploadcare-uploader" id = "post-event-image"/> ' //'<button 
		                                + '</p>'
		                            + '</div>'
		                            + '<div class="col-md-6 col-xs-6 pull-right">'
		                                + '<p>'
		                                    + '<button type="button" class="btn  btn-lg btn-first" id = "post-event-button-post" onclick = macco.main.postEvent(null)>Post Event</button>'
		                                + '</p>'
		                            +  '</div>'
		                            + '</form>'
                                            + '<div class="col-md-12 col-xs-12 text-center" id = "post-event-message-bottom">'
                                            + '</div>'
		                      + '</div>'
                                      + '<!-- Footer -->'
                                      + '<footer>'            
                                      + '</footer>'
                                 + '</div>'
                                 + '<div class = "text-center" id = "post-event-message-bottom">'
                                 + '</div>';
				
			}



            stateMap.$container.html(String() + event_form);
            

            // attach date and time pickers

            $(document).ready(function()
                              { 
                                  $('#post-event-date').datetimepicker({format: 'YYYY-MM-DD'});

                                  $('#post-event-start-time').datetimepicker({format: 'HH:mm'});

                                  $('#post-event-end-date').datetimepicker({format: 'YYYY-MM-DD'});

                                  $('#post-event-end-time').datetimepicker({format: 'HH:mm'});
                              });
							  
			if(index > -1)
			   $('#post-event-image').val(macco.counter.getEvent(index).image);
			
			
           
		    if((index === undefined) || (index === null) || (index < 0))
			{
				// set the map's lat long position
                var latlong = JSON.parse(macco.model.getBrowserLocation()).loc.split(',');

                macco.util.initiateMap(parseFloat(latlong[0]), parseFloat(latlong[1]));   // attach the map
                // macco.util.initiateImageCloud();         // initiate upload section for image
			
			    return;
		    }
			
            macco.util.initiateMap(ev.lat, ev.lng);   // attach the map

        };


        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Name: editEventForm
        //
        // Arguments: event_index - This is the array index of the event we wish to edit
        //
        // Return Type: None
        //
        // Thsi function is used to display the form that lets users edit events that were previously posted by the user
        //
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        editEventForm = function(event_index)
        {

           var ev = macco.counter.getEvent(event_index); // macco.model.getProfileEvents();

           // remeber the next line of code. Is very important
           /* var event = $.grep(JSON.parse(events_list), function(e)
                                                       {
                                                           return e._id === event_id;
                                                       });    */
           console.log("Events list edit form = " + ev);
		   console.log("type of event_index = " +typeof(event_index)+ " = " +Number(event_index));
		   
           var date = moment(ev.startDate).format('YYYY-MM-DD');   // get the event's date in the proper format.
           var start = moment(ev.startDate).format('HH:mm');


           var end_date = moment(ev.endDate).format('YYYY-MM-DD');
           var end = moment(ev.endDate).format('HH:mm');


           var event_form = '<!-- Page Content -->'
                                       + '<div class="container container-ep">'
                                           + '<div class="text-center">'
                                              + '<h1 class="settings-heading">Edit Event</h1>'
                                           + '</div>'
                                           + '<div class = "text-center" id = "post-event-message-top">'
                                           + '</div>'
                                           + '<div class="col-md-10 col-xs-10 col-md-offset-1 nopadding">'
                                              + '<form>'
                                                  + '<div class="col-md-5 col-xs-12 pull-left">'
                                                      + '<div class="form-group">'
                                                         + '<label for="Event">Event Title<span class="red">*</span>:</label>'
                                                         + '<input type="text" class="form-control" id="post-event-name" placeholder="Whats happening? - event name" value = "' +ev.title+ '" >'
                                                      + '</div>'
                                                      + '<div class="form-group">'
                                                           + '<label for="Additional">Additional details:</label>'
                                                           + '<textarea name="text" class="form-control" id="post-event-details" placeholder="Additional details/info about this event...">' +ev.details+ '</textarea>'
                                                      + '</div>'
                                                  + '<div class="form-group">'
                                                        + '<label for="Event">Link:</label>'
                                                        + '<input type="text" class="form-control" id="post-event-link" placeholder="link to more details." value = "' +ev.link+ '" >'
                                                  + '</div>'
                                                  + '</div>'
                                                  + '<div class="col-md-4 col-xs-8 pull-right field-left">'
                                                      + '<div class="form-group">'
                                                          + '<label for="Location">Location :</label>'
                                                          + '<input type="text" class="form-control" id="post-event-location" placeholder="Where is it happening?" value = "' +ev.location+ '">'
                                                      + '</div>'
                                                  + '<div class="form-group">'
                                                      + '<label for="Street">Street<span class="red">*</span>:</label>'
                                                      + '<input type="text" class="form-control" id="post-event-street" placeholder="Some street" value = "' +ev.street+ '">'
                                                  + '</div>'
                                                  + '<div class="form-group">'
                                                      + '<label for="City">City/Town<span class="red">*</span>:</label>'
                                                      + '<input type="text" class="form-control" id="post-event-city" placeholder="City or town" value = "' +ev.city+ '">'
                                                  + '</div>'
                                                  + '<div class="form-group">'
                                                      + '<label for="State">State/Country<span class="red">*</span>:</label>'
                                                      + '<input type="text" class="form-control" id="post-event-state" placeholder="Country or state" value = "' +ev.state+ '">'
                                                  + '</div>'
                                           + '</div>'
                                           + '<div class="col-md-3 col-xs-4 pull-left">'
                                                  + '<div class="form-group">'
                                                      + '<label for="Date">Date<span class="red">*</span>:</label>'
                                                      + '<input type="text" data-format="YYYY-MM-DD" id="post-event-date" value = "' +date+ '"></input>'
                                                  + '</div>'
                                                  + '<div class="form-group">'
                                                      + '<label for="Stime">Start time<span class="red">*</span>:</label>'
                                                      + '<input type=time class="form-control" id="post-event-start-time" placeholder="-- : --" value = "' +start+ '">'
                                                  + '</div>'
                                                  + '<div class="form-group">'
                                                      + '<label for="Date">End date:</label>'
                                                      + '<input type="text" data-format="YYYY-MM-DD" id="post-event-end-date" value = "' +end_date+ '"></input>'
                                                  + '</div>'
                                                  + '<div class="form-group">'
                                                      + '<label for="Endtime">End time :</label>'
                                                      + '<input type=time class="form-control" id="post-event-end-time" placeholder="-- : --" value = "' +end+ '">'
                                                  + '</div>'
                                            + '</div>'
                                            // + '<div class="col-md-8 col-xs-8 pull-left">'
                                            + '<div class="col-md-12 col-xs-10 pull-left">'
                                                  + '<div class="form-group">'
                                                      + '<label for="Tags">Tags:</label>'
                                                      + '<input type="text" class="form-control" id="post-event-tags" placeholder="Add tags to this event to make it easier to find - (comma separated)." value = "';

                                                      for(var i = 0; i < ev.tags.length; i++)
                                                      {
                                                          event_form = event_form + ev.tags[i]+ ', ';
                                                      }

                                              event_form = event_form + '">'
                                                  + '</div>'
                                            + '</div>'
                                            + '<div class="col-md-8 col-xs-8 pull-left">'
                                                  + '<label>Pin the location:</label>'
                                            + '</div>'
                                            + '<div class="col-md-12 col-xs-12 container-map-ep" id = "pin">'
                                            + '</div>'
                                            + '<div class="col-md-6 col-xs-6 pull-left">'
                                                + '<p>'
                                                    + 'Add Event Photo/Image: <input type="hidden" name="picture" role="uploadcare-uploader" id = "post-event-image" /> ' //'<button
                                                + '</p>'
                                            + '</div>'
                                            + '<div class="col-md-6 col-xs-6 pull-right">'
                                                + '<p>'
                                                    + '<button type="button" class="btn  btn-lg btn-first" id = "post-event-button-post" onclick = macco.main.postEvent(' +event_index+ ')>Update event</button>'
                                                + '</p>'
                                            +  '</div>'
                                            + '</form>'
                                            + '<div class="col-md-12 col-xs-12 text-center" id = "post-event-message-bottom">'
                                            + '</div>'
                                      + '</div>'
                                      + '<!-- Footer -->'
                                      + '<footer>'
                                      + '</footer>'
                                 + '</div>'
                                 + '<div class = "text-center" id = "post-event-message-bottom- 1">'
                                 + '</div>';



            stateMap.$container.html(String() + event_form);
  

            // attach date and time pickers

            $(document).ready(function()
                              {
                                  $('#post-event-date').datetimepicker({format: 'YYYY-MM-DD'});

                                  $('#post-event-start-time').datetimepicker({format: 'HH:mm'});

                                  $('#post-event-end-date').datetimepicker({format: 'YYYY-MM-DD'});

                                  $('#post-event-end-time').datetimepicker({format: 'HH:mm'});
                              });


            // set the map's lat long position
            // var latlong = JSON.parse(macco.model.getBrowserLocation()).loc.split(',');

            macco.util.initiateMap(ev.lat, ev.lng);   // attach the map

};





	
forgotPasswordPage = function()
{
     stateMap.$container.html(String() + '<div class="panel panel-default">' 
					                          + '<div class="panel-body">'
                                                 + '<strong style = "font-size:15px">Forgot your password?</strong>'
						                            + '<table class="table" style="margin-bottom: 0">'
						                                + '<thead style="margin-bottom: 0">'
							                                + '<tr style="margin-bottom: 0">'
							                                  + '<td width = "100">'
								                              + '</td>'								 
							                                  + '<td width = "300">'
								 	                             + '<form role="form">'
				                                                    + '<div class="form-group">' 
					                                                    + '<input type="email" class="form-control" placeholder="Email address">' 
					                                                + '</div>'  
				                                                 + '</form>'
                                                                 + '<button type="button" class="btn btn-primary"><span class="glyphicon glyphicon-log-in"></span> Reset your password</button>'									 
								                              + '</td>' 
								                             + '<td>'				  
								                             + '</td>' 							 
							                                + '</tr>'
                                                        + '</thead>'							   
                                                    + '</table>'
						                      + '</div>' 
					                       + '</div>');
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name : ProfilePage
//
// Arguments : None
//
// Returns : Nothing
//
// This function is used generate the html for the currently logged in user's profile page
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
profilePage = function()
{
 var profile = '<div class="container container-pfy">'
                   + '<div class=" col-md-12 col-lg-12 col-sm-12 col-xs-10 toppad" >'	
				        + '<div class="row">'
					         + '<div class="col-md-5 col-lg-5">';

                             var user = macco.model.getUser();     // get the current user
                             if((user !== null) && (user !== undefined))
                             {
							    if((user.image === undefined) || (user.image === null) || (user.image === ""))
                                    profile = profile + '<img alt="User Pic" src="images/x-full-size.png" class="img-responsive image-user">';
							    else
								    profile = profile + '<img alt="User Pic" src="' +user.image+ '" class="img-responsive image-user">';
								 
							    profile = profile + '</div>';
					
					            profile = profile + '<div class="col-md-6 col-lg-6  info-user">'
							                         + '<h1>' +user.name+ '</h1>'
						                             + '<h2 class="red">@' +user.handle+ '</h2>'
						                         + '<ul class="nopadding">'
							                         + '<li><h4>Address:</h4>' +user.address+ '</li>'
							                         + '<li><h4>Website:</h4><a href="' +user.website+ '" target="_blank">' +user.website+ '</a></li>'
							                         + '<li><h4>Email:</h4><a href="mailto:' +user.email+ '">' +user.email+ '</a></li>'
							                         + '<li><h4>Phone:</h4><a href="tel:' +user.phone+ '">' +user.phone+ '</a></li>'
							                         + '<li><h4>About:</h4><p>' +user.about+ '</p></li>'
						                         + '</ul>'
					                           + '</div>'
					                           + '<div class="col-md-1 col-lg-1 col-sm-12  info-user">'
                                                      + '<button type="button" class="community" data-toggle="modal" data-target=".bs-example-modal-lg">000/000</button>'
		                                              + '<a href="javascript:;" class="activ-add" onclick = macco.nav.setAnchorSettings()><span>Edit</span></a>'
					                           + '</div>'

				             + '</div> <!-- close row -->'
						     + '<hr>'
				               + '<div role="tabpanel">'
				                   + '<!-- Nav tabs -->'
					               + '<div class="row">'
						              + '<ul class="nav nav-tabs" role="tablist">'
									     + '<li role="presentation" class="active"><a href="#your-ev" aria-controls="your-events" role="tab" data-toggle="tab">Posted Events</a></li>'
						              + '</ul>'
						              + '<div class="col-sm-4 col-md-4 col-xs-3 nopadding pull-right" id="your-profile-events">'
		                                    //+ '<form class="navbar-form nopadding" role="search" onsubmit="return macco.main.profileEventsFilterSearch()">'
		                                       // + '<div class="input-group">'
		                                           // + '<input type="text" class="form-control" placeholder="Filter" id="profile-filter">'
		                                            //+ '<div class="input-group-btn">'
		                                                 //+ '<button class="btn btn-default" id="profile-filter"><i class="glyphicon glyphicon-search"></i></button>'
		                                           // + '</div>'
		                                       // + '</div>'
		                                    //+ '</form>'
		                              + '</div>'
					                + '</div>'
					                + '<!-- Tab panes -->'
					                     + '<div class="tab-content" id="your-events">'
                                                + '<div role="tabpanel" class="tab-pane fade in active">'
                                                     + '<div class="row" id="other-events">'
                                                          + '<div class="col-md-4 portfolio-item">'
                                                              + '<a href="javascript:;" class="link-events-pr post-event" onclick = macco.main.setAnchorPostEvent(-99)>'
                                                                    + '<img class="img-responsive first-event-img" src="images/post-event.jpg" alt="">'
                                                                    + '<img class="img-responsive secondary-event-img" src="images/post-event-hover.jpg" alt="">'
                                                              + '</a>'
								                          + '</div>';
							 }   // end if ///////
							 else
							 { 
								profile = profile + '<img alt="User Pic" src="images/x-full-size.png" class="img-responsive image-user">'
								    + '</div>'
		                            + '<div class="col-md-6 col-lg-6  info-user">'
		                                + '<h1>Noname</h1>' 
		                                + '<h2 class="red">@noname</h2>'
		                                + '<ul class="nopadding">'
		                                     + '<li><h4>Address:</h4><a href="javascript:;">737 Nowhere Street, Nowhere City, Earth</a></li>'
		                                     + '<li><h4>Website:</h4><a href="www.xivents.co">www.xivents.co</a></li>'
		                                     + '<li><h4>Email:</h4><a href="mailto:info@xivents.co">info@xivent.co</a></li>'
		                                     + '<li><h4>Phone:</h4><a href="tel:">+1 868 788 5499</a></li>'
		                                     + '<li><h4>About:</h4>'
                                                   + '<p> This is a generic profile used for anonyously posting events. All anonyously posted events are represented by this profile regardless of who posts them or where they are posted from.'
                                                   + '</p>'
											 + '</li>'
		                                + '</ul>'
		                            + '</div>'
		                            + '<div class="col-md-1 col-lg-1 col-sm-12  info-user">'
		                                + '<button type="button" class="community" data-toggle="modal" data-target=".bs-example-modal-lg">000/000</button>'
		                                + '<a href="javascript:;" class="activ-add" onclick = macco.nav.setAnchorSettings()><span>Edit</span></a>'
		                            + '</div>'
									+ '</div> <!-- close row -->'
						            + '<hr>'
				               + '<div role="tabpanel">'
                                    + '<!-- Nav tabs -->'
		                                + '<div class="row">'
		                                     + '<ul class="nav nav-tabs" role="tablist">'
		                                          + '<li role="presentation" class="active"><a href="#your-events" aria-controls="your-events" role="tab" data-toggle="tab">Posted Events</a></li>'
		                                     + '</ul>'
		                                     + '<div class="col-sm-4 col-md-4 col-xs-3 nopadding pull-right">'
		                                          //+ '<form class="navbar-form nopadding" role="search">' /// onsubmit="return macco.main.profileEventsFilterSearch()">'
		                                               //+ '<div class="input-group">'
		                                                   //+ '<input type="text" class="form-control" placeholder="Filter" name="q" id="profile-filter">'
		                                                   //+ '<div class="input-group-btn">'
		                                                        //+ '<button class="btn btn-default" id="profile-filter" onclick = macco.main.profileEventsFilterSearch()><i class="glyphicon glyphicon-search"></i></button>'
		                                                  // + '</div>'
		                                               //+ '</div>'
		                                          //+ '</form>'
		                                     + '</div>'
		                                + '</div>'
                                        + '<!-- Tab panes -->'
		                                + '<div class="tab-content">'
		                                   + '<div role="tabpanel" class="tab-pane fade in active">'
		                                       + '<div class="row" id="other-events">'
		                                           + '<div class="col-md-4 portfolio-item">'
		                                               + '<a href="javascript:;" class="link-events-pr post-event" onclick = macco.main.setAnchorPostEvent(-99)>'
		                                                     + '<img class="img-responsive first-event-img" src="images/post-event.jpg" alt="">'
		                                                     + '<img class="img-responsive secondary-event-img" src="images/post-event-hover.jpg" alt="">'
                  		                               + '</a>'
		                                           + '</div>';
							}

                           // create markup for the 'Your events' tab
                           var my_posts = macco.model.getProfileEvents();       // start here

                           macco.counter.setCounters(my_posts);     // set up the counter lists for your list of events
                           console.log(" In Profile Page -macco.main- profile events are:");
                           console.log(my_posts);
						   
						   if((my_posts !== undefined) && (my_posts !== null) && (my_posts !== []))
                           {
                               for(var i = my_posts.length - 1; i > -1; i--)
                               {
								   if(moment() <= moment(my_posts[i].endDate))
								   {
									   // looping through to write events					 
								       profile = profile + '<div class="col-md-4 portfolio-item">'
                                                            + '<a href="javascript:;" class="link-events-pr">';
															
															if((my_posts[i].image === undefined) || (my_posts[i].image === null) || (my_posts[i].image === ""))
																profile = profile + '<img class="img-responsive" height="286" src="http://www.ucarecdn.com/746f7c30-95ed-49c5-b9f4-c8bd40bb24f3/-/resize/470x286/" alt="">';
															else
                                                                profile = profile + '<img class="img-responsive" height="286" src="' +my_posts[i].image+ '-/resize/470x286/" alt="">';
															
                                                            profile = profile + '<div class="bg-active">'
                                                                    + formatTitle(my_posts[i].title)   // '<h3>' +my_posts[i].title+ '</h3>'
                                                                    + '<h4>' +moment(my_posts[i].startDate).format('dddd MMM D YYYY')+ '</h4>'
                                                                + '</div>'
                                                                + '<div class="hover">'
                                                                    + '<h3 onclick = macco.main.setAnchorViewEvent(' +i+ ')>VIEW EVENT</h3>'
                                                                    + '<h4>'
                                                                        + '<div onclick = macco.main.setAnchorEditEvent(' +i+ ')>Edit Event</div>'
																		+ '<div onclick = macco.main.setAnchorPostEvent(' +i+ ')>Copy as New</div>'
                                                                        + '<div onclick = macco.main.deleteEventForm(' +i+ ')>Delete</div>'
                                                                        + '<div style="text-align:right" onclick = macco.main.listTags(' +i+ ')>TAGS </div>'
                                                                    + '</h4>'
                                                                + '</div>'
                                                            + '</a>'
                                                      + '<div id = "event' +i+ '"></div>'
                                                  + '</div>';
								   }
								   else
								   {
									   // looping through to write events					 
								       profile = profile + '<div class="col-md-4 portfolio-item">'
                                                            + '<a href="javascript:;" class="link-events-pr">';
															
															if((my_posts[i].image === undefined) || (my_posts[i].image === null) || (my_posts[i].image === ""))
																profile = profile + '<img class="img-responsive" height="286" src="images/x-full-size.png" alt="">';
															else
                                                                profile = profile + '<img class="img-responsive" height="286" src="' +my_posts[i].image+ '-/resize/470x286/-/effect/grayscale/" alt="">';
															
															profile = profile + '<div class="bg-active">'
                                                                    + formatTitle(my_posts[i].title)   // '<h3>' +my_posts[i].title+ '</h3>'
                                                                    + '<h4>' +moment(my_posts[i].startDate).format('dddd MMM D YYYY')+ '</h4>'
                                                                + '</div>'
                                                                + '<div class="hover">'
                                                                    + '<h3 onclick = macco.main.setAnchorViewEvent(' +i+ ')>PAST EVENT</h3>'
                                                                    + '<h4>'
                                                                        // + '<div>PAST EVENT</div>'
                                                                        // + '<div onclick = macco.main.deleteEventForm(' +i+ ')>Delete</div>'
																		+ '<div onclick = macco.main.setAnchorPostEvent(' +i+ ')>Copy as New</div>'
                                                                        + '<div style="text-align:right" onclick = macco.main.listTags(' +i+ ')>TAGS </div>'
                                                                    + '</h4>'
                                                                + '</div>'
                                                            + '</a>'
                                                      + '<div id = "event' +i+ '"></div>'
                                                  + '</div>';									   
								   }
							   }
							   
							   profile = profile + '<div class="row text-center">'
								                       + '<div class="col-lg-12">'
									                       + '<ul class="pagination">'
										                       + '<li class="active">'
											                      + '<a href="#"></a>'
										                       + '</li>'
										                       + '<li>'
											                      + '<a href="#"></a>'
										                       + '</li>'
										                       + '<li>'
											                      + '<a href="#"></a>'
										                       + '</li>'
									                       + '</ul>'
								                       + '</div>'
							                      + '</div><!-- /.row -->'
						   }
						   profile = profile + '</div>';
					
					profile = profile + '</div>'
					             + '</div>'
				               + '</div>';

             //now we get the list of events that this user and profile have posted.
				
             stateMap.$container.html(String() +profile);						
	};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name : profilePageOther
//
// Arguments : profile - the JSON object that contains a profile's information
//             events - An array of events that belong to this profile
//
// Returns : Nothing
//
// This function is used generate the html for viewing another person's profile page
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
profilePageOther = function(profile, events)
{
   macco.counter.setCounters(events);  // set councter for the events
   
   var page = '<div class="container container-pf">'
	           + '<div class="col-md-12 col-lg-12 col-sm-12 col-xs-10 toppad" >'
	              + '<div class="row">'
	                  + '<div class="col-md-5 col-lg-5 ">' 
	                     + '<img alt="User Pic" src=' +profile.image+ ' class="img-responsive image-user">' 
	                  + '</div>'
	              + '<div class="col-md-6 col-lg-6  info-user">'
	                  + '<h1>' +profile.name+ '</h1>'
	                  + '<h2 class="red">@' +profile.handle+ '</h2>'
	                  + '<ul class="nopadding">'
	                       + '<li><h4>Address:</h4><a href="#">' +profile.address+ '</a></li>'
	                       + '<li><h4>Website:</h4><a href="' +profile.website+ '" target="_blank">' +profile.website+ '</a></li>'
	                       + '<li><h4>Email:</h4><a href="mailto:' +profile.email+ '">' +profile.email+ '</a></li>'
	                       + '<li><h4>Phone:</h4><a href="tel:' +profile.phone+ '">' +profile.phone+ '</a></li>'
	                       + '<li><h4>About me:</h4><p>' +profile.about+ '</p></li>'
	                  + '</ul>'
	              + '</div>'
	              + '<div class="col-md-1 col-lg-1 col-sm-12  info-user">'
	                  + '<button type="button" class="community" data-toggle="modal" data-target=".bs-example-modal-lg">000/000</button>'
	                  + '<a href="wdscode.guru/events/settings.html" class="activ-add"><span>Follow</span></a>'
	              + '</div>'
	           + '</div>'
                   + '<hr>'
	              + '<div class="row">'
	                   + '<div class="col-lg-12">'
	                       + '<h3 class="head-events-pr">Posted Events</h3>'
                                   + '<div class="col-sm-4 col-md-4 col-xs-3 nopadding pull-right">'
                                       //+ '<form class="navbar-form nopadding" role="search" action="#" onsubmit="return macco.main.profileEventsFilterSearch()">'
                                         // + '<div class="input-group">'
                                             //+ '<input type="text" class="form-control" placeholder="Filter" id="profile-filter">'
                                                 //+ '<div class="input-group-btn">'
                                                    //+ '<button class="btn btn-default" type="button" onclick = macco.main.profileEventsFilterSearch()><i class="glyphicon glyphicon-search"></i></button>'
                                                 //+ '</div>'
                                          //+ '</div>'
                                       //+ '</form>'
                                   + '</div>'
                           + '</div>'
                      + '</div>';

     if((events === undefined) || (events === null))
     {
         page = page + '<div class="row" id="other-events">'
                     + '</div><!-- /.row -->';

         page = page + '</div>';

     }
	 else
	 {

          macco.counter.setCounters(events);

          page = page + '<div class="row" id="other-events">';

          for(var i = events.length - 1; i > -1; i--)
          {
			    if(moment() <= moment(events[i].endDate))
		        {
                         // loop through to write the events
                             page = page + '<div class="col-md-4 portfolio-item">'
                                             + '<a href="javascript:;" class="link-events-pr">';
											 
											 if((events[i].image === undefined) || (events[i].image === null) || (events[i].image === ""))
												page = page + '<img class="img-responsive" height="286" src="images/x-full-size.png" alt="">';
											 else
                                                page = page + '<img class="img-responsive" height="286" src="' +events[i].image+ '-/resize/470x286/" alt="">';
										   
                                             page = page + '<div class="bg-active">'
                                                    + formatTitle(events[i].title)   // '<h3>' +my_posts[i].title+ '</h3>'
                                                    + '<h4>' +moment(events[i].startDate).format('dddd MMM D YYYY')+ '</h4>'
                                               + '</div>'
                                               + '<div class="hover">'
                                                    + '<h3 onclick = macco.main.setAnchorViewEvent(' +i+ ')>READ MORE</h3>';
													
													var user = macco.model.getUser();  // get the current user 
													if((user !== undefined) && (user !== null))
													   page = page + '<h4>PIN THIS</h4>';                  // eventually we will put more here
												   
                                                    page = page + '<h4>'
                                                       + '<div style="text-align:right" onclick = macco.main.listTags(' +i+ ')>TAGS </div>'
                                                    + '</h4>'
                                               + '</div>'
                                             + '</a>'
                                             + '<div id = "event' +i+ '"></div>'
                                          + '</div>';
				}
				else
				{
					                         // loop through to write the events
                             page = page + '<div class="col-md-4 portfolio-item">'
                                             + '<a href="javascript:;" class="link-events-pr">';
											 
											 if((events[i].image === undefined) || (events[i].image === null) || (events[i].image === ""))
											   page = page + '<img class="img-responsive" height="286" src="images/x-full-size.png" alt="">';
											 else
                                               page = page + '<img class="img-responsive" height="286" src="' +events[i].image+ '-/resize/470x286/-/effect/grayscale/" alt="">';
										   
                                             page = page + '<div class="bg-active">'
                                                    + formatTitle(events[i].title)   // '<h3>' +my_posts[i].title+ '</h3>'
                                                    + '<h4>' +moment(events[i].startDate).format('dddd MMM D YYYY')+ '</h4>'
                                               + '</div>'
                                               + '<div class="hover">'
                                                    + '<h3 onclick = macco.main.setAnchorViewEvent(' +i+ ')>READ MORE</h3>';
													
													var user = macco.model.getUser();  // get the current user 
													if((user !== undefined) && (user !== null))
													   page = page + '<h4>PAST EVENT</h4>';                  // eventually we will put more here
												   
                                                    page = page + '<h4>'
                                                       + '<div style="text-align:right" onclick = macco.main.listTags(' +i+ ')>TAGS </div>'
                                                    + '</h4>'
                                               + '</div>'
                                             + '</a>'
                                             + '<div id = "event' +i+ '"></div>'
                                          + '</div>';
					
					
				}
            }
			
			page = page + '<div class="row text-center">'
							  + '<div class="col-lg-12">'
									+ '<ul class="pagination">'
										 + '<li class="active">'
											   + '<a href="#"></a>'
										 + '</li>'
										 + '<li>'
											   + '<a href="#"></a>'
										 + '</li>'
										 + '<li>'
											   + '<a href="#"></a>'
										 + '</li>'
									     + '</ul>'
							  + '</div>'
					    + '</div><!-- /.row -->';

            page = page + '</div><!-- /.row -->'
                     + '</div>';
            page = page + '</div>';  // we may have to remove this
	 }

     stateMap.$container.html(String() + page);
	 
	 $(document).keyup(function(e) 
	                   {
                          if (e.keyCode == 13) 
						  { // enter
                            macco.main.profileEventsFilterSearch();
                            return false; //this will stop the default event triggering 
                          }
                       });

};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name : formatTitle
//
// Arguments : title - a string
//
// Return Type - A string - a string enclosed in <h3> markup for displaying event titles
//
// This function is called by profilePage() to determine the font size of the titles of events
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
formatTitle = function(title)
{
    if((title === undefined) || (title === null) || (typeof(title) !== "string"))
      return '<h3> </h3>';

    var len = title.length;

    if(len > 60)
       return '<h3 style="font-size:15px">' +title+ '</h3>';

    if(len > 20)
       return '<h3 style="font-size:20px">' +title+ '</h3>';

    return '<h3>' +title+ '</h3>';
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name : formatTitle
//
// Arguments : title - a string
//
// Return Type - A string - a string enclosed in <h3> markup for displaying event titles
//
// This function is called by profilePage() to determine the font size of the titles of events
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
formatTitleBoard = function(title)
{
    if((title === undefined) || (title === null) || (typeof(title) !== "string"))
      return '<h3> </h3>';

    var len = title.length;

    if(len > 60)
       return '<h3 style="font-size:18px">' +title+ '</h3>';

    if(len > 20)
       return '<h3 style="font-size:20px">' +title+ '</h3>';

    return '<h3>' +title+ '</h3>';
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name: deleteEventform
//
// Arguments: event_index
//
// Return Type: None
//
// This function is used to display a message promt whenenver a user whished to delete an event thy have prevoisly posted.
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        deleteEventForm = function(event_index)
        {
             if(event_index < 0)
                return;

             // messages /////////////////////////////////////
             var message = '<div class="alert alert-warning" id = "messages' +event_index+ '">'
			                   + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                               + '<center><h4 style = "font-size:15px"> Should we delete this event?'
                                    + '<br><button type="button" style = "font-size:12px" class="btn btn-default btn-lg" onclick = macco.main.deleteEvent(' +event_index+ ')>Yes</button>  |  ' 
                                         + '<button type="button" style = "font-size:12px" class="btn btn-default btn-lg" onclick = macco.main.deleteEventFormNo(' +event_index+ ')>No</button>'
                               + '</h4></center>'
                           + '</div>';

             $("#event" +event_index).html(message);
                                       
        };

        deleteEventFormNo = function(event_index)
        {
             $("#event" +event_index).html("");
        };


        deleteEvent = function(event_index)
        {
             var message = '<div class="alert" id = "messages' +event_index+ '">'
                               + '<center><h4 style = "font-size:15px"> Deleting...'
                               + '</h4></center>'
                           + '</div>';


             $("#event" +event_index).html(message);   // display deleting message

             macco.model.deleteEvent(macco.model.getProfileEvents()[event_index]._id, event_index);      // ask the model to try to delete this event.

        };

        deleteEventResponse = function(msg)
        {
             if(msg.status === 'delete_event_past_event')
             {
                  var message = '<div class="alert" id = "messages' +msg.index+ '">'
                                   + '<center><h4 style = "font-size:15px"> Past events cannot be deleted. Only events that have not yet happened can be edited or deleted.'
                                   + '<br><button type="button" style = "font-size:12px" class="btn btn-default btn-lg" onclick = macco.main.deleteEventFormNo(' +msg.index+ ')>No</button>'
                                   + '</h4></center>'
                           + '</div>';


                  $("#event" +msg.index).html(message);   // display deleting message
                  return;
             }

             if((msg.status === 'delete_event_not_found') || (msg.status === 'delete_event_error_deleting'))
             {
                 var message = '<div class="alert" id = "messages' +msg.index+ '">'
                                 + '<center><h4 style = "font-size:15px"> Our apologies. We are experiencing challenges deleting your event. Do try again later.'
                                 + '<button type="button" style = "font-size:12px" class="btn btn-default btn-lg" onclick = macco.main.deleteEventFormNo(' +msg.index+ ')>No</button>'
                                 + '</h4></center>'
                           + '</div>';


                 $("#event" +msg.index).html(message);   // display deleting message
                 return;
             }
        };

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name: listTags
//
// Arguments: event_index - the index of the event we wish to list the tags of
//            profile_handle - the handle of the 
//
// Return Type: none
//
// This function is used to list the tags associated with an even that has been listed on a profile's page
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
listTags = function(event_index)
{
    if(event_index < 0)
       return;

    // get the tags array from the event
    var ev = macco.counter.getEvent(event_index);

    if((ev === undefined) || (ev === null))
       return;

    var tags = ev.tags;
	
	var message = '<div class="alert alert-info" id = "messages' +event_index+ '">'
                      + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                          + '<center><h4 style = "font-size:15px"><span class="glyphicon glyphicon-tags"></span> : '
						      + '<a href="javascript:;" onclick = macco.main.setAnchorProfileOther(' +event_index+ ') id="tag_All" value="All" >#All</a> ';
	
	
	// console.log('tags list ====== ' + typeof(ev.handle) + ' .... ' + typeof(macco.model.getUser().handle));
	
	if((macco.model.getUser() !== undefined) && (macco.model.getUser() !== null))  // we are logged on
	{
	    if(String(ev.handle) === String(macco.model.getUser().handle))
	    {	
            for(var i = 0; i < tags.length; i++)
            {
                message = message + '<a href="javascript:;" onclick = macco.main.profileEventsFilter("' +event_index+ '_' +i+ '") id="tag_' +event_index+ '_' +i+ '" value=' +tags[i]+ ' >#' +tags[i]+ '</a> ';
            }
        }
	    else
	    {
            for(var i = 0; i < tags.length; i++)
            {
                message = message + '<a href="javascript:;" onclick = macco.main.profileEventsFilterOther("' +event_index+ '_' +i+ '") id="tag_' +event_index+ '_' +i+ '" value=' +tags[i]+ ' >#' +tags[i]+ '</a> ';
            }			
	    }
	}
	else
	{
		for(var i = 0; i < tags.length; i++)
        {
            message = message + '<a href="javascript:;" onclick = macco.main.profileEventsFilterOther("' +event_index+ '_' +i+ '") id="tag_' +event_index+ '_' +i+ '" value=' +tags[i]+ ' >#' +tags[i]+ '</a> ';
        }
		
	}
    
	message = message + '</h4><center></div>';

    $("#event" +event_index).html(message);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name: profileEventsFilter
//
// Arguments: string - the tag or searech term we are requesting
//
// Return type : None
//
// This function is used to filter or update the profile page with the events that have the tag in the arguments
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var profileEventsFilter = function(coordinates)
{
	var cut = coordinates.indexOf('_');
	
	var event_index = parseInt(coordinates.substring(0, cut));
	var tag_index = parseInt(coordinates.substring(cut + 1, coordinates.length));
	
	console.log("event_index = " +event_index+ " " +typeof(event_index)+ " tag_index = " +tag_index+ " type = " +typeof(tag_index));	
	
	var ev = macco.counter.getEvent(event_index);
	
	if((ev === undefined) || (ev === null) || (ev === []))
    {
		console.log("could not find any profile lists (profileEventsFilter)");
		return;
	}
	
	var tag = ev.tags[tag_index];
	
	var events_html = '<!-- Tab panes -->'
                           + '<div class="tab-content" id="your-events">'
                                  + '<div role="tabpanel" class="tab-pane fade in active">'
                                          + '<div class="row">'
                                                + '<div class="col-md-4 portfolio-item">'
                                                      + '<a href="javascript:;" class="link-events-pr post-event" onclick = macco.main.setAnchorPostEvent()>'
                                                            + '<img class="img-responsive first-event-img" src="images/post-event.jpg" alt="">'
                                                                  + '<img class="img-responsive secondary-event-img" src="images/post-event-hover.jpg" alt="">'
                                                            + '</a>'
                                                + '</div>';
												
    var list = macco.counter.getEventsList();
	
    for(var i = list.length - 1; i > -1; i--)
    {	
	    // loop through to write the events
		var position = list[i].tags.indexOf(tag);
		
		if(position > -1)
		{
		    events_html = events_html + '<div class="col-md-4 portfolio-item">'
                                         + '<a href="javascript:;" class="link-events-pr">'
                                                + '<img class="img-responsive" height="286" src="' +list[i].image+ '-/resize/470x286/" alt="">'
                                                       + '<div class="bg-active">'
                                                             + formatTitle(list[i].title)   // '<h3>' +my_posts[i].title+ '</h3>'
                                                             + '<h4>' +moment(list[i].startDate).format('dddd MMM D YYYY')+ '</h4>'
                                                       + '</div>'
                                                       + '<div class="hover">'
                                                             + '<h3 onclick = macco.main.setAnchorViewEvent(' +i+ ')>VIEW EVENT</h3>'
															 + '<h4>';
															 var user = macco.model.getUser();  // get the current user 
															 
										                     if((user !== undefined) && (user !== null))
															 {
                                                                 events_html = events_html + '<div>ADD TO TRACK LIST</div>';   // we will put something here later
																 
																 //+ '<div onclick = macco.main.setAnchorEditEvent(' +i+ ')>EDIT EVENT</div>'
                                                                                           //+ '<div onclick = macco.main.deleteEventForm(' +i+ ')>DELETE</div>';
											                 }
                                                             events_html = events_html + '<div style="text-align:right" onclick = macco.main.listTags(' +i+ ')>TAGS </div>'
                                                             + '</h4>'
                                                       + '</div>'
                                         + '</a>'
                                         + '<div id = "event' +i+ '"></div>'
                                       + '</div>'
									+ '</div>';   // - <div row>
		}
	}
	
	$("#other-events").html(events_html);
    document.getElementById("profile-filter").value = tag;
	
    console.log("html = " +events_html);
}; 


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name: profileEventsFilterOther
//
// Arguments: string - the tag or searech term we are requesting
//
// Return type : None
//
// This function is used to filter or update the profile page of a enitty that is not you, with the events that have the tag in the arguments
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var profileEventsFilterOther = function(coordinates)
{
	var cut = coordinates.indexOf('_');
	
	var event_index = parseInt(coordinates.substring(0, cut));
	var tag_index = parseInt(coordinates.substring(cut + 1, coordinates.length));
	
	console.log("event_index = " +event_index+ " " +typeof(event_index)+ " tag_index = " +tag_index+ " type = " +typeof(tag_index));	
	
	var ev = macco.counter.getEvent(event_index);
	
	if((ev === undefined) || (ev === null) || (ev === []))
    {
		console.log("could not find any profile lists (profileEventsFilter)");
		return;
	}
	
	var tag = ev.tags[tag_index];
	
	var events_html = '<!-- Tab panes -->'
                           + '<div class="tab-content" id="your-events">'
                                  + '<div role="tabpanel" class="tab-pane fade in active">'
                                          + '<div class="row">';
												
    var list = macco.counter.getEventsList();
	
    for(var i = list.length - 1; i > -1; i--)
    {	
	    // loop through to write the events
		var position = list[i].tags.indexOf(tag);
		
		if(position > -1)
		{
		    events_html = events_html + '<div class="col-md-4 portfolio-item">'
                                         + '<a href="javascript:;" class="link-events-pr">'
                                                + '<img class="img-responsive" height="286" src="' +list[i].image+ '-/resize/470x286/" alt="">'
                                                       + '<div class="bg-active">'
                                                             + formatTitle(list[i].title)   // '<h3>' +my_posts[i].title+ '</h3>'
                                                             + '<h4>' +moment(list[i].startDate).format('dddd MMM D YYYY')+ '</h4>'
                                                       + '</div>'
                                                       + '<div class="hover">'
                                                             + '<h3 onclick = macco.main.setAnchorViewEvent(' +i+ ')>VIEW EVENT</h3>'
															 + '<h4>';
															 var user = macco.model.getUser();  // get the current user 
															 
										                     if((user !== undefined) && (user !== null))
															 {
                                                                 events_html = events_html + '<div>ADD TO TRACK LIST</div>';   // we will put something here later
																 
																 //+ '<div onclick = macco.main.setAnchorEditEvent(' +i+ ')>EDIT EVENT</div>'
                                                                                           //+ '<div onclick = macco.main.deleteEventForm(' +i+ ')>DELETE</div>';
											                 }
                                                             events_html = events_html + '<div style="text-align:right" onclick = macco.main.listTags(' +i+ ')>TAGS </div>'
                                                             + '</h4>'
                                                       + '</div>'
                                         + '</a>'
                                         + '<div id = "event' +i+ '"></div>'
                                       + '</div>'
									+ '</div>';   // - <div row>
		}
	}
	
	$("#other-events").html(events_html);
    // document.getElementById("profile-filter").value = tag;
	
    console.log("html = " +events_html);
}; 


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name: profileEventsFilter
//
// Arguments: string - the tag or searech term we are requesting
//
// Return type : None
//
// This function is used to filter or update the profile page with the events that have the tag in the arguments
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var profileEventsFilterSearch = function()
{	
	var list = macco.counter.getEventsList();   // get the list of events
	
	if((list === undefined) || (list === null) || (list === []))
    {
		console.log("could not find any profile lists (profileEventsFilterSearch)");
		return;
	}
	
	var events_html = '<!-- Tab panes -->'
                           + '<div class="tab-content" id="your-events">'
                                  + '<div role="tabpanel" class="tab-pane fade in active">'
                                          + '<div class="row">'
                                                + '<div class="col-md-4 portfolio-item">'
                                                      + '<a href="javascript:;" class="link-events-pr post-event" onclick = macco.main.setAnchorPostEvent()>'
                                                            + '<img class="img-responsive first-event-img" src="images/post-event.jpg" alt="">'
                                                                  + '<img class="img-responsive secondary-event-img" src="images/post-event-hover.jpg" alt="">'
                                                            + '</a>'
                                                + '</div>';

    for(var i = list.length - 1; i > -1; i--)
    {	
	    // loop through to write the events
		var position = list[i].tags.indexOf(document.getElementById("profile-filter").value);
		
		if(position > -1)
		{
		    events_html = events_html + '<div class="col-md-4 portfolio-item">'
                                         + '<a href="javascript:;" class="link-events-pr">'
                                                + '<img class="img-responsive" height="286" src="' +list[i].image+ '-/resize/470x286/" alt="">'
                                                       + '<div class="bg-active">'
                                                             + formatTitle(list[i].title)   // '<h3>' +my_posts[i].title+ '</h3>'
                                                             + '<h4>' +moment(list[i].startDate).format('dddd MMM D YYYY')+ '</h4>'
                                                       + '</div>'
                                                       + '<div class="hover">'
                                                             + '<h3 onclick = macco.main.setAnchorViewEvent(' +i+ ')>VIEW EVENT</h3>'
                                                             + '<h4>';
															 var user = macco.model.getUser();  // get the current user 
															 
										                     if((user !== undefined) && (user !== null))
															 {
                                                                 events_html = events_html + '<div onclick = macco.main.setAnchorEditEvent(' +i+ ')>EDIT EVENT</div>'
                                                                                           + '<div onclick = macco.main.deleteEventForm(' +i+ ')>DELETE</div>';
											                 }
                                                             events_html = events_html + '<div style="text-align:right" onclick = macco.main.listTags(' +i+ ')>TAGS </div>'
                                                             + '</h4>'
                                                       + '</div>'
                                         + '</a>'
                                         + '<div id = "event' +i+ '"></div>'
                                       + '</div>'
									+ '</div>';   // - <div row>
		}
	}
	
	$("#other-events").html(events_html);
    //document.getElementById("profile-filter").value = list[event_index].tags[tag_index];
    ///console.log("html = " +events_html);	
	
};



        createProfilePage = function()
        {
             var page = '<div id = "messages"></div><div class="panel panel-default" style = "background:#D8D8D8">'
                            + '<div class="panel-body">'
                                + '<table class="table" style="margin-bottom: 0">'
                                    + '<thead style="margin-bottom: 0">'
                                       + '<tr style="margin-bottom: 0">'
                                          + '<td width = "90">'
                                          + '</td>'
                                          + '<td style = "font-size:12px">'
                                              + '<div>'
                                                  + '<input type="text" class="form-control" id="profilename" placeholder="profile name goes here" style = "font-size:12px">'
                                                  + '<br><ul class="list-group">'
                                                     + '<li class="list-group-item" style="margin-bottom: 0">'
                                                        + '<form role="form">'
                                                           + '<div class="form-group">'
                                                              + '<label for="name" style = "font-size:12px">Profile Picture</label>'
                                                                  + '<p><input type="file" id = "pic" accept="image/*" style = "font-size:10px"></input></p>'
                                                           + '</div>'
                                                        + '</form>'
                                                     + '</li>'
                                                 + '</ul>'
                                                  + '<br><ul class="list-group">'
                                                     + '<li class="list-group-item" style="margin-bottom: 0">'
                                                        + '<form role="form">'
                                                           + '<div class="form-group">'
                                                              + '<label for="name" style = "font-size:12px">About</label>'
                                                              + '<textarea class="form-control" rows="" placeholder="summary info about your profile goes here" id="details" style = "font-size:12px">'
                                                              + '</textarea>'
                                                           + '</div>'
                                                        + '</form>'
                                                     + '</li>'
                                                 + '</ul>'
                                                 + '<ul class="list-group" style="margin-bottom: 0">'
                                                     + '<li class="list-group-item" style="margin-bottom: 0">'
                                                        + '<div class="form-group">'
                                                           + '<label for="Address" style = "font-size:12px">Address:</label>'
                                                           + '<div>'
                                                              + '<input type="text" class="form-control" id="address" placeholder="street name and number, city, state/country" style = "font-size:12px">'
                                                           + '</div>'
                                                        + '</div>'
                                                        + '<div class="form-group">'
                                                           + '<label for="Address" style = "font-size:12px">Website:</label>'
                                                           + '<div>'
                                                               + '<input type="url" class="form-control" id="website" placeholder="your website url goes here" style = "font-size:12px">'
                                                           + '</div>'
                                                        + '</div>'
                                                        + '<div class="form-group">'
                                                           + '<label for="Address" style = "font-size:12px">Email:</label>'
                                                           + '<div>'
                                                               + '<input type="email" class="form-control" id="email" placeholder="your email address goes here" style = "font-size:12px">'
                                                           + '</div>'
                                                        + '</div>'
                                                        + '<div class="form-group">'
                                                           + '<label for="Address" style = "font-size:12px">Phone:</label>'
                                                           + '<div>'
                                                               + '<input type="tel" class="form-control" id="phone" placeholder="your contact number goes here" style = "font-size:12px">'
                                                           + '</div>'
                                                        + '</div>'
                                                     + '</li>'
                                                 + '</ul>'
                                          + '</td>'
                                          + '<td width = "200">'
                                                + '<center> <button type="button" class="btn btn-primary" style = "font-size:12px" onclick = macco.main.createProfile()><span class="glyphicon glyphicon-plus"></span> Create Profile</button> </center>'
                                          + '</td>'
                                        + '</tr>'
                                     + '</thead>'
                                  + '</table>'
                               + '</div>'
                           + '</div>';

             stateMap.$container.html(String() +page);


        };


        editProfilePage = function()
        {
             // first check to see if the macco.model.profile is null. If it is then we need to get the profiles so that we can print this profile
             var user = macco.model.getUser();

             if((user === null) || (user === undefined))
                return;

             var profile = '<div class="panel panel-default" style = "background:#D8D8D8">' 
		            + '<div class="panel-body">'
		                + '<table class="table" style="margin-bottom: 0">'
		                    + '<thead style="margin-bottom: 0">'
		                       + '<tr style="margin-bottom: 0">' 
		                          + '<td width = "90">'
		                              + '<center>'
                                                  + '<a class="pull-left" href="#">'
                                                     + '<img src="phil.jpg" class="img-rounded" alt="..." width = "160" height = "120">'
                                                  + '</a>'
                                              + '</center>'
		                          + '</td>' 
		                          + '<td style = "font-size:12px">'
		                              + '<div>' 
                                                  + '<input type="text" class="form-control" id="profilename" placeholder="Edit your profile name goes here" value = "' +user.pName+ '" style = "font-size:12px">' 
                                                  + '<br><ul class="list-group">'
		                                     + '<li class="list-group-item" style="margin-bottom: 0">'
		                                        + '<form role="form">' 
		                                           + '<div class="form-group">' 
		                                              + '<label for="name" style = "font-size:12px">About</label>' 
		                                              + '<textarea class="form-control" rows="" placeholder="Summary info about this profile." id="details" value="' +user.details+ '" style = "font-size:12px">'
                                                                    + user.details
                                                              + '</textarea>'  
		                                           + '</div>' 
		                                        + '</form>'
		                                     + '</li>'   
                                                 + '</ul>' 
		                                 + '<ul class="list-group" style="margin-bottom: 0">'   
                                                     + '<li class="list-group-item" style="margin-bottom: 0">'
		                                        + '<div class="form-group">'
		                                           + '<label for="Address" style = "font-size:12px">Address:</label>' 
		                                           + '<div>' 
		                                              + '<input type="text" class="form-control" id="address" placeholder="street name and number, city, state/country" value = "' +user.address+ '" style = "font-size:12px">' 
		                                           + '</div>'   
		                                        + '</div>'
		                                        + '<div class="form-group">'
		                                           + '<label for="Address" style = "font-size:12px">Website:</label>' 
		                                           + '<div>' 
		                                               + '<input type="url" class="form-control" id="website" placeholder="website url goes here" value = "' +user.website+ '" style = "font-size:12px">' 
		                                           + '</div>'   
		                                        + '</div>'
		                                        + '<div class="form-group">'
		                                           + '<label for="Address" style = "font-size:12px">Email:</label>' 
		                                           + '<div>' 
		                                               + '<input type="email" class="form-control" id="email" placeholder="email address goes here" value = "' +user.email+  '" style = "font-size:12px">' 
		                                           + '</div>'   
		                                        + '</div>'        
		                                        + '<div class="form-group">'
		                                           + '<label for="Address" style = "font-size:12px">Phone:</label>' 
		                                           + '<div>' 
		                                               + '<input type="tel" class="form-control" id="phone" placeholder="phone number goes here" value = "' +user.phone+ '" style = "font-size:12px">' 
		                                           + '</div>'   
		                                        + '</div>'               
		                                     + '</li>'
                                                 + '</ul>'  
		                          + '</td>'
                                          + '<td width = "200">'
                                                + '<center> <button type="button" class="btn btn-primary" style = "font-size:12px" onclick = macco.main.saveProfile()><span class="glyphicon glyphicon-plus"></span> Save</button> </center>'
                                          + '</td>' 
		                        + '</tr>'
                                     + '</thead>'   
                                  + '</table>'
		               + '</div>' 
		           + '</div>';

             //now we get the list of events that this user and profile have posted.


             stateMap.$container.html(String() +profile);
        };



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Name: settingsPage
        // 
        // Arguments: None
        //
        // Return Type: None
        //
        // This function is used to generate the markup for the settings page. for logged in users
        //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
settingsPage = function()
{
            var page = '<div class="container">'
                            + '<div class="col-md-10 col-md-offset-1 col-xs-10 nopadding">'
                             + '<div class="row text-center">'
                                    + '<h1 class="settings-heading">Settings</h1>'
                             + '</div>'
                             + '<div id = "message-settings-top">'
                             + '</div>';

            var user = macco.model.getUser();
              
            // get the current profile information - this will be used to fill out the top part of the settings page
            if((user !== null) && (user !== undefined))
            {
                page = page + '<form>'
		             + '<div class="col-md-6 col-xs-12 pull-left">'
		                + '<div class="form-group">'
		                   + '<label for="Name">Name<span class="red">*</span>:</label>'
		                   + '<input type="text" class="form-control" id="settings-profile-name" placeholder="Your profile name goes here" value="' +user.name+ '" >'
		                + '</div>'
                                + '<div class="form-group">'
                                   + '<label for="Name">Handle<span class="red">*</span>:</label>'
                                   + '<input type="text" class="form-control" id="settings-handle" placeholder="Your profile handle goes here" value="' +user.handle+ '">'
                                + '</div>'
		             + '<div class="form-group">'
		                + '<label for="About">About:</label>'
		                   + '<textarea name="text" class="form-control" maxlength="250" id="settings-about" placeholder="Short description about your profile. 250 characters maximum." >' +user.about+ '</textarea>'
		             + '</div>'
		             + '</div>'
		             + '<div class="col-md-6 col-xs-12 pull-right">'
		                 + '<div class="form-group">'
		                    + '<label for="Email">E-mail:</label>'
		                    + '<input type="email" class="form-control" id="settings-email" placeholder="name@domain.something" value="' +user.email+ '">'
		                 + '</div>'
		             + '<div class="form-group">'
		             + '<label for="Phone">Phone:</label>'
		                 + '<input type="text" class="form-control" id="settings-phone" placeholder="+ 1 000 000 0000" value="' +user.phone+ '">'
		             + '</div>'
		             + '<div class="form-group">'
		                 + '<label for="Address">Address:</label>'
		                    + '<input type="text" class="form-control" id="settings-address" placeholder="Profile address here" value="' +user.address+ '">'
		                 + '</div>'
		             + '<div class="form-group">'
		                 + '<label for="Website">Website:</label>'
		                 + '<input type="text" class="form-control" id="settings-website" placeholder="Your website url goes here" value="' +user.website+ '">'
		             + '</div>'
					 + '<div id = "message-settings-middle"></div>'
					 + '<button type="button" class="btn  btn-lg btn-four" id = "settings-save-changes" onclick = macco.main.newProfile(true)>Save Changes</button>'          // >
					 + '<button type="button" class="btn  btn-lg btn-three" id = "settings-save-new-profile" onclick = macco.main.newProfile(false)>Save as New Profile</button>'
		             + '<div class="form-group">'
		                 + '<label for="Password">Enter new password:</label>'
		                    + '<input type="password" class="form-control" id="settings-password" placeholder="Enter new password">'
		             + '</div>'
		             + '<div class="form-group">'
		                  + '<label for="repeatpw">Repeat password:</label>'
		                  + '<input type="password" class="form-control" id="settings-repeatpw" placeholder="Enter new password">'
		             + '</div>'
					 + '<div id = "message-settings-new-password"></div>'
		             + '<p>'
                           + '<button type="button" class="btn  btn-lg btn-first" id = "settings-save-new-password" onclick = macco.main.saveNewPassword() >Save New Password</button>'                                
                           + '<button type="button" class="btn  btn-lg btn-three" id = "settings-delete-profile" onclick = macco.main.deleteProfile()>Delete Profile</button>'
		             + '</p>'
		             + '</div>'
		             + '<div class="col-md-6">';

                if((user.image === undefined) || (user.image === null) || (user.image === ""))
                {
                     page = page + '<img class="img-responsive image-user" src="images/profile_pic.gif" alt="" id = "settings-display-image">'
					                + '<p><center> Add Profile Photo/Image: <input type="hidden" name="picture" role="uploadcare-uploader" id = "settings-profile-image"/><center></p> '
		                  + '</div>'		 
		            + '</form>';
                }
                else
                {
                    page = page + '<img class="img-responsive image-user" src="' +user.image+ '" alt="" id = "settings-display-image" >'
					                  + '<p><center> Add Profile Photo/Image: <input type="hidden" name="picture" role="uploadcare-uploader" id = "settings-profile-image"/><center></p> '
                             + '</div>'
                         + '</form>';
                }

            }
            else
            {
                page = page + '<form>'
                             + '<div class="col-md-6 col-xs-12 pull-left">'
                                + '<div class="form-group">'
                                   + '<label for="Name">Name<span class="red">*</span>:</label>'
                                   + '<input type="text" class="form-control" id="settings-profile-name" placeholder="Your profile name goes here" >'
                                + '</div>'
                                + '<div class="form-group">'
                                   + '<label for="Name">Handle<span class="red">*</span>:</label>'
                                   + '<input type="text" class="form-control" id="settings-handle" placeholder="Your profile name goes here" >'
                                + '</div>'
                                + '<div class="form-group">'
                                   + '<label for="About">About:</label>'
                                   + '<textarea name="text" class="form-control" maxlength="250" id="settings-about" placeholder="Short description about your profile. 250 characters maximum." ></textarea>'
                                + '</div>'
                             + '</div>'
                             + '<div class="col-md-6 col-xs-12 pull-right">'
                                 + '<div class="form-group">'
                                    + '<label for="Email">Email:</label>'
                                    + '<input type="email" class="form-control" id="settings-email" placeholder="name@domain.something">'
                                 + '</div>'
                             + '<div class="form-group">'
                             + '<label for="Phone">Phone:</label>'
                                 + '<input type="text" class="form-control" id="settings-phone" placeholder="+ 1 000 000 0000">'
                             + '</div>'
                             + '<div class="form-group">'
                                 + '<label for="Address">Location/Address:</label>'
                                    + '<input type="text" class="form-control" id="settings-address" placeholder="Profile address here">'
                                 + '</div>'
                             + '<div class="form-group">'
                                 + '<label for="Website">Website:</label>'
                                 + '<input type="text" class="form-control" id="settings-website" placeholder="Your website url goes here">'
                             + '</div>'
							 + '<div id = "message-settings-middle"></div>'
							 + '<button type="button" class="btn  btn-lg btn-three" id = "settings-save-new-profile" onclick = macco.main.newProfile(false)>Save as New Profile</button>'
                             + '<div class="form-group">'
                                 + '<label for="Password">Enter new password:</label>'
                                    + '<input type="password" class="form-control" id="settings-password" placeholder="Enter new password">'
                             + '</div>'
                             + '<div class="form-group">'
                                  + '<label for="repeatpw">Repeat password:</label>'
                                  + '<input type="password" class="form-control" id="settings-repeatpw" placeholder="Enter new password">'
                             + '</div>'
							 + '<button type="button" class="btn  btn-lg btn-first" id = "settings-save-new-password" onclick = macco.main.saveNewPassword() >Save new password</button>'
                             + '</div>'
                             + '<p>'
                             + '</p>'
                             + '</div>'
                             + '<div class="col-md-6">'
                                 + '<img class="img-responsive image-user" src="images/profile_pic.gif" alt="" id = "settings-display-image" >'
								 + '<p><center> Add Profile Photo/Image: <input type="hidden" name="picture" role="uploadcare-uploader" id = "settings-profile-image"/><center> </p> '
                             + '</div>'
                      + '</form>'
                      + '<div id ="message-settings-bottom">'
                      + '</div>';

            }

            // remainder of the page - use another profile
            page = page + '<div class="col-md-12 author-box">'
		               + '<hr>'
		               + '<h3>Your other profiles:</h3>'
		               + '<div class="row text-center">'
	                           + '<div class="col-md-2 col-sm-4 col-xs-4" onclick = macco.model.changeProfile(-99)>'
		                         + '<a href="javascript:;" class="link-events-pr">'
		                             + '<img class="img-responsive" src="images/profile_pic.gif" alt="">'
		                             + '<div class="hover">'
		                               + '<h5>USE THIS PROFILE</h5>'
		                             + '</div>'
		                         + '</a>'
		                         + '<h3>Noname</h3>'
		                         + '<h4 class="red">@Noname</h4>'
		                   + '</div>';

            var profile_list = macco.model.getList();


  
            if((profile_list !== undefined) && (profile_list !== null))
            {

                 for(var i = 0; i < profile_list.length; i++)
                 {
                     page = page + '<div class="col-md-2 col-sm-4 col-xs-4">'
		                  + '<a href="javascript:;" class="link-events-pr" onclick = macco.model.changeProfile(' +i+ ')>';
                     
                     if(profile_list[i].image === "")
                     {
                         page = page + '<img class="img-responsive" src="images/profile_pic.gif" alt="">';
                     }
                     else
                     {
                         page = page + '<img class="img-responsive" src="' +profile_list[i].image+ '" alt="">';
                     }
      
                     page = page + '<div class="hover">'
		                           + '<h5>USE THIS PROFILE</h5>'
		                      + '</div>'
		                  + '</a>'
		                  + '<h3>' +profile_list[i].name+ '</h3>'
		                  + '<h4 class="red">@' +profile_list[i].handle+ '</h4>'
		            + '</div>';
                 }
            }


            page = page + '</div></div></div>';
			
			//implement the modal
			page = page + '<!-- Modal -->'
                             + '<div id="settings-save-changes-modal" class="modal fade" role="dialog">'
                                 + '<div class="modal-dialog">'
                                     + '<!-- Modal content-->'
                                     + '<div class="modal-content">'
                                         + '<div class="modal-header">'
                                              + '<center><button type="button" class="close" data-dismiss="modal">&times;</button>'
                                              + '<h4 class="modal-title">Are you sure you want to save changes to this profile?</h4></center>'
                                         + '</div>'
                                         + '<div class="modal-body">'
                                              + '<center><button type="button" class="btn btn-default" data-dismiss="modal" onclick = macco.main.saveChangesModalYes()>Yes</button>     |     '
											  + '<button type="button" class="btn btn-default" data-dismiss="modal" onclick = macco.main.newProfileCancel()>No</button></center>'											   
                                         + '</div>'
                                     + '</div>'
                                 + '</div>'
                             + '</div>'
                             + '<div id="settings-new-profile-modal" class="modal fade" role="dialog">'
                                 + '<div class="modal-dialog">'
                                     + '<!-- Modal content-->'
                                     + '<div class="modal-content">'
                                         + '<div class="modal-header">'
                                              + '<center><button type="button" class="close" data-dismiss="modal">&times;</button>'
                                              + '<h4 class="modal-title">Shall we continue creating a new profile?</h4></center>'
                                         + '</div>'
                                         + '<div class="modal-body">'
                                              + '<center><button type="button" class="btn btn-default" data-dismiss="modal" onclick = macco.main.newProfileModalYes()>Yes</button>     |     '
											  + '<button type="button" class="btn btn-default" data-dismiss="modal" onclick = macco.main.newProfileCancel()>No</button></center>'											   
                                         + '</div>'
                                     + '</div>'
                                 + '</div>'
                             + '</div>'							 
                             + '<div id="settings-save-password-modal" class="modal fade" role="dialog">'
                                 + '<div class="modal-dialog">'
                                     + '<!-- Modal content-->'
                                     + '<div class="modal-content">'
                                         + '<div class="modal-header">'
                                              + '<center><button type="button" class="close" data-dismiss="modal">&times;</button>'
                                              + '<h4 class="modal-title">Should we proceed to change your password?</h4></center>'
                                         + '</div>'
                                         + '<div class="modal-body">'
                                              + '<center><button type="button" class="btn btn-default" data-dismiss="modal" onclick = macco.main.savePasswordModalYes()>Yes</button>     |     '
											  + '<button type="button" class="btn btn-default" data-dismiss="modal" onclick = macco.main.savePasswordModalNo()>No</button></center>'											   
                                         + '</div>'
                                     + '</div>'
                                 + '</div>'
                             + '</div>'
							 + '<div id="settings-delete-profile-modal" class="modal fade" role="dialog">'
                                 + '<div class="modal-dialog">'
                                     + '<!-- Modal content-->'
                                     + '<div class="modal-content">'
                                         + '<div class="modal-header">'
                                              + '<center><button type="button" class="close" data-dismiss="modal">&times;</button>'
                                              + '<h4 class="modal-title">Are you sure you want to delete this profile?</h4></center>'
                                         + '</div>'
                                         + '<div class="modal-body">'
                                              + '<center><button type="button" class="btn btn-default" data-dismiss="modal" onclick = macco.main.deleteProfileYes()>Yes</button>     |     '
											  + '<button type="button" class="btn btn-default" data-dismiss="modal" onclick = macco.main.deleteProfileNo()>No</button></center>'											   
                                         + '</div>'
                                     + '</div>'
                                 + '</div>'
                             + '</div>';
			
			
            stateMap.$container.html(String() +page);
};

saveNewPassword = function()
{
    var password = document.getElementById('settings-password').value;
	var repeat_password = document.getElementById('settings-repeatpw').value;
	
	var message = " ";
	
	if((password === undefined) || (password === null) || (password === ""))
	{
        // messages /////////////////////////////////////
        message = '<div class="alert alert-warning" role="alert" id = "messages">'
					    + '<center>'
		                       + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                               + '<h4 style = "font-size:15px"><strong> Make sure you input a password </strong>'
                               + '</h4></center>'
                    + '</div>';

        $("#message-settings-middle").html(message);
		return message;
    }

	if((repeat_password === undefined) || (repeat_password === null) || (repeat_password === ""))
	{
        // messages /////////////////////////////////////
        message = '<div class="alert alert-warning" role="alert" id = "messages">'
					  + '<center>'
		                   + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                           + '<h4 style = "font-size:15px"> <strong>Make sure you input the password in the repeat field as well. </strong>'
                           + '</h4>'
					  + '</center>'
                   + '</div>';

        $("#message-settings-middle").html(message);
		return message;
    }
	
	if(password !== repeat_password)
	{
        // messages /////////////////////////////////////
        message = '<div class="alert alert-warning" role="alert" id = "messages">'
                      + '<center>'
							+ '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
							+ '<h4 style = "font-size:15px"> The passwords you input do not match. make sure they do before you try to make the change.'
                            + '</h4></center>'
                   + '</div>';

        $("#message-settings-middle").html(message);
		return message;
    }

	// messages /////////////////////////////////////
    message = '<div class="alert alert-info">'
                    + '<center><h4 style = "font-size:15px"><strong> Changing your password... </strong>'
                    + '</h4></center>'
               + '</div>';
			   
    // show the modal
	$('#settings-save-password-modal').modal('show');
			   
    // make the request to the server
	// macco.model.changePassword(password);
			   
    $("#message-settings-middle").html(message);
};


savePasswordModalYes = function()
{
	//get rid of modal
	$('#settings-save-password-modal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
	
	// change the password
    macco.model.changePassword(document.getElementById('settings-repeatpw').value);	
	
	// show loading session
	("#message-settings-middle").html('<div class="alert alert-info">'
                                            + '<center><h4 style = "font-size:15px"><strong> Changing your password... </strong>'
                                            + '</h4></center>'
                                       + '</div>');
};

savePasswordModalNo = function()
{
	// do nothing ////
};

changePasswordResponse = function(msg)
{
	// messages /////////////////////////////////////
    var message = ''; 
			   
    if(msg === 'success')
	{
       message = '<div class="alert alert-success" id = "messages">'
	   				+ '<center><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                    + '<h4 style = "font-size:15px"><strong> Succsess !!... </strong>'
					        + '<br> Your password has been changed.'
                    + '</h4></center>'
               + '</div>';
	}
	
	if((msg === 'change_password_error_getting_user') || (msg === 'change_password_error_saving_password'))
	{
	    message = '<div class="alert alert-warning" role="alert" id = "messages">'
                        + '<center><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
						 + '<h4 style = "font-size:15px"><strong>Our apologies. <br> Our system was not able to change your password at this time.</strong>'
						 + '<br> Please do try again later. If this problem persists do contact our technical support as soon as you can.'
                         + '</h4></center>'
                   + '</div>';
    }

    $("#message-settings-middle").html(message);	
	   
};

saveAsNewForm = function()
{

    // messages /////////////////////////////////////
    var message = '<div class="alert alert-warning">'
                               + '<center><h4 style = "font-size:15px"> Should we proceed to creating your new profile?'
                                    + '<p>'
                                         + '<a href="javascript:;" style = "font-size:15px" onclick = macco.main.newProfile(false)>Yes</a> | '
                                         + '<a href="javascript:;" style = "font-size:15px" onclick = macco.main.newProfileCancel()>No</a>'
                                    + '</p>'
                               + '</h4></center>'
                           + '</div>';

    $("#message-settings-middle").html(message);

};


deleteProfile = function()
{	
	$('#settings-delete-profile-modal').modal('show');
	
    // messages /////////////////////////////////////
    //var message = '<div class="alert alert-warning" role="alert" id = "messages">'
                               //+ '<center><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
							   //+ '<h4 style = "font-size:15px"> Are you sure you want to delete the profile you are currently using?'
                                    //+ '<p>'
                                         //+ '<a href="javascript:;" style = "font-size:15px" onclick = macco.model.deleteProfile()>Yes</a> | '
                                         //+ '<a href="javascript:;" style = "font-size:15px" onclick = macco.main.newProfileCancel()>No</a>'
                                    //+ '</p>'
                               //+ '</h4></center>'
                           //+ '</div>';

    // $("#message-settings-middle").html(message);
};

deleteProfileYes = function()
{
	$('#settings-delete-profile-modal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
	
	macco.model.deleteProfile();
};

deleteProfileNo = function()
{
	
};



newProfileCancel = function()
{
    $("#message-settings-middle").html("");
};


saveProfileChangesForm = function()
{
    // messages /////////////////////////////////////
    var message = '<div class="alert alert-warning">'
                               + '<center><h4 style = "font-size:15px"> Are you sure you want to save changes to this profile?'
                                    + '<p>'
                                        + '<a href="javascript:;" style = "font-size:15px" onclick = macco.main.newProfile(true)>Yes</a> | '
                                        + '<a href="javascript:;" style = "font-size:15px" onclick = macco.main.newProfileCancel()>No</a>'
                                    + '</p>'
                               + '</h4></center>'
                           + '</div>';

    $("#message-settings-middle").html(message);

};


   

newProfile = function(update)
{
           console.log("executing newProfile() ...");

            // messages /////////////////////////////////////
            var too_many_profiles = '<div class="alert alert-warning" role="alert" id = "settings-message-too-many-profiles">'
			                            + '<center>'
											 + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                             + '<p style = "font-size:15px"><strong>You are allowed no more than 5 different profiles</strong> </p>'
                                             + '<p style = "font-size:15px">You have reached your profile limit.</p>'
                                             + '<p style = "font-size:15px"> If you wish, you can delete one of your current profiles and create a new one.</p>'
									    + '</center>'
                                    + '</div>';
								   

            var no_profile_name = '<div class="alert alert-warning" role="alert" id = "messages">'
		                             + '<center>'
		  		                         + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'			
                                         + '<p style = "font-size:15px"><strong> Profile Name Required </strong> </p>'
                                         + '<p style = "font-size:15px"> You forgot to fill in the profile name. A profile must have a unique name that identifies the profile you wish to create.</p>'
                                     + '</center>'                        
								   + '</div>';

            var profile_already_exists = '<div class="alert alert-warning" role="alert" id = "messages">'
					                          + '<center>'
		  		                                   + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                                   + '<p style = "font-size:15px"><strong>Profile Name Already Taken</strong></p>'
                                                   + '<p style = "font-size:15px"> The profile name you selected is already taken by someone else. <br> Do try another name.</p>'
											  + '</center>' 
                                         + '</div>';

            var invalid_email = '<div class="alert alert-warning" role="alert" id = "messages">'
								     + '<center>'
		  		                          + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                          + '<p style = "font-size:15px"><strong>Incorrect format for an email address.</strong></p>'
                                          + '<p style = "font-size:15px"> The email address you included is not in the standard format.<br> Do make sure your email is in the form xxxxxx@xx.xxx </p>'
								     + '</center>' 
                                 + '</div>';

            var no_handle = '<div class="alert alert-warning" role="alert" id = "messages">'
				                 + '<center>'
		  		                       + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                       + '<p style = "font-size:15px"><strong> A handle is required </strong> </p>'
                                       + '<p style = "font-size:15px"> You forgot to include a handle for your profile. A handle uniquely identifies your profile.<br> Do include a unique handle for your profile.</p>'
								 + '</center>' 
                             + '</div>';


            var list = macco.model.getList();

            if((update === false) && (list !== undefined) && (list !== null))
            {
                  if(list.length >= 5)
                  {
                      $("#message-settings-middle").html(too_many_profiles);
                      return;
                  }
            }
          
            var name = document.getElementById('settings-profile-name').value;
            console.log("name = " +name);

            if((name === undefined) || (name === null) || (name === ""))
            {

                console.log("name = 3333" +name);

                $("#message-settings-middle").html(no_profile_name);
                return;
            }

            var handle = document.getElementById('settings-handle').value;
            console.log("handle = @" +name);

            if((handle === undefined) || (handle === null) || (handle === ""))
            {

                console.log("name = 3333" +name);

                $("#message-settings-middle").html(no_handle);
                return;
            }


            var email = document.getElementById('settings-email').value;
            if((email !== undefined) && (email !== null) && (email !== ""))
            {
                 // see if a valid email address was included 
                 if(validateEmail(email) === false)
                 {
                      $("#message-settings-middle").html(invalid_email);
                      return;
                 }
            }
            
			// '<button type="button" class="btn  btn-lg btn-four" data-toggle="modal" data-target= "#settings-save-changes-modal"
			
			// show the modal
			if(update === true)
			   $('#settings-save-changes-modal').modal('show');
		    else
			   $('#settings-new-profile-modal').modal('show');
				

            //macco.model.newProfile({ name : name, handle : handle, about : document.getElementById('settings-about').value, address : document.getElementById('settings-address').value, 
                                        //website : document.getElementById('settings-website').value, email : document.getElementById('settings-email').value,
                                        //phone : document.getElementById('settings-phone').value, image : document.getElementById('settings-profile-image').value}, update);
};

saveChangesModalYes = function()
{	
	$('#settings-save-changes-modal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
	
	var im = document.getElementById('settings-profile-image').value;
	
	if(im === "")
	{
		console.log("save changes modal yes *****  image = " +im);
		
		im = null;
	}
	
	macco.model.newProfile({ name : document.getElementById('settings-profile-name').value, handle : document.getElementById('settings-handle').value, about : document.getElementById('settings-about').value, address : document.getElementById('settings-address').value, 
                             website : document.getElementById('settings-website').value, email : document.getElementById('settings-email').value,
                             phone : document.getElementById('settings-phone').value, image : im }, true);	
};

newProfileModalYes = function()
{
	$('#settings-save-changes-modal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
	
	macco.model.newProfile({ name : document.getElementById('settings-profile-name').value, handle : document.getElementById('settings-handle').value, about : document.getElementById('settings-about').value, address : document.getElementById('settings-address').value, 
                             website : document.getElementById('settings-website').value, email : document.getElementById('settings-email').value,
                             phone : document.getElementById('settings-phone').value, image : document.getElementById('settings-profile-image').value}, false);	
};


newProfileResponse = function(message)
{
    console.log("executing newProfileResponse() ...");

            // messages /////////////////////////////////////
            var too_many_profiles = '<div class="alert alert-warning" role="alert" id = "settings-message-too-many-profiles">'
			                            + '<center>'
		  		                             + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                             + '<p style = "font-size:15px"><strong>You are allowed no more than 5 different profiles</strong> </p>'
                                             + '<p style = "font-size:15px">Your account currently already reached its profiles limit.</p>'
                                             + '<p style = "font-size:15px"> If you wish you can delete one of your current profile before you will be allowed to create a new one.</p>'
									    + '</center>'
                                    + '</div>';

            var error_saving_profile = '<div class="alert alert-warning" role="alert" id = "messages">'
			                            + '<center>'
		  		                             + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'			
                                             + '<p style = "font-size:15px"><strong>Error Saving Profile</strong> </p>'
                                             + '<p style = "font-size:15px"> Our apologies to you. Our system has encountered challenges saving your profile. Do try saving the profile again.</p>'
								        + '</center>'
                                      + '</div>';

            var profile_handle_exists = '<div class="alert alert-warning" role="alert" id = "messages">'
			                            + '<center>'
		  		                             + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                             + '<p style = "font-size:15px"><strong>Profile Handle Already Taken</strong> </p>'
                                             + '<p style = "font-size:15px"> The profile handle name you suggested is already taken by someone else. <br> Do try another handle.</p>'
								        + '</center>'											 
                                     + '</div>';


            if((message.status === 'new_profile_err_profiles_count') || (message.status === 'new_profile_error_searching_profiles') || (message.status === 'new_profile_error_saving_profile'))
            {
                 $("#message-settings-middle").html(error_saving_profile);
                 return;
            }

            if(message.status === 'new_profile_limit_reached')
            {
                 $("#message-settings-middle").html(too_many_profiles);
                 return;
            }

            if(message.status === 'new_profile_handle_already_exists')
            {
                 $("#message-settings-middle").html(profile_handle_exists);
                 return;
            }
};


updateProfileResponse = function(message)
{
    console.log("executing updateProfileResponse() ...");

    // messages /////////////////////////////////////
    var too_many_profiles = '<div class="alert alert-warning" role="alert" id = "settings-message-too-many-profiles">'
			                    + '<center>'
		  		                     + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                     + '<p style = "font-size:15px"><strong>You are allowed no more than 5 different profiles</strong></p>'
                                     + '<p style = "font-size:15px">Your account currently already reached its profiles limit.</p>'
                                     + '<p style = "font-size:15px"> If you wish you can delete one of your current profile before you will be allowed to create a new one.</p>'
							    + '</center>'
                             + '</div>';

    var error_saving_profile = '<div class="alert alert-warning" role="alert" id = "messages">'
			                     + '<center>'
		  		                     + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'	
                                     + '<p style = "font-size:15px"><strong>Error Saving Profile</strong> </p>'
                                     + '<p style = "font-size:15px"> Our apologies to you. Our system has encountered challenges saving your profile updates. Do try saving the profile again.</p>'
							    + '</center>'									 
                              + '</div>';

    var profile_handle_exists = '<div class="alert alert-warning" role="alert" id = "messages">'
			                     + '<center>'
		  		                     + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'	
                                     + '<p style = "font-size:15px"><strong>Profile Handle Already Taken</strong> </p>'
                                     + '<p style = "font-size:15px"> The profile handle name you suggested is already taken by someone else. <br> Do try another handle.</p>'
				                 + '</center>'
                              + '</div>';


    if((message.status === 'update_profile_error_finding_profile') || (message.status === 'update_profile_error_saving_profile'))
    {
        $("#message-settings-middle").html(error_saving_profile);
        return;
    }


    if((message.status === 'update_profile_handle_taken') || (message.status === 'update_profile_error_finding_handles'))
    {
        $("#message-settings-middle").html(profile_handle_exists);
        return;
    }
};



deleteProfileResponse = function(message)
{
    console.log("executing deleteProfileResponse() ...");

            // messages /////////////////////////////////////
    var profile_not_found = '<div class="alert alert-warning" role="alert" id = "messages">'
			                     + '<center>'
		  		                     + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                     + '<p style = "font-size:15px"><strong>Sorry our system is having a few challenges completing your request.</p>'
                                     + '<p style = "font-size:15px"> Do ttry deleting thsi account again later on and see what happens</p>'
								 + '</center>'
                             + '</div>';

    if((message.status === 'delete_profile_not_found') || (message.status === 'delete_profile_could_not_delete'))
    {
        $("#message-settings-middle").html(profile_not_found);
        return;
    }
};


    listEventsOn = function(date)
    {
	    events = [];
		events = macco.model.getEventsOn(date);
		   
		var list = '<span class="label label-primary" style = "font-size:15px"> Events happening on ' +date+ '</span>';
		counterList = [];
		
		for(var i = 0; i < events.length; i++)
		{
			console.log("an event");
			
			counterList[counterList.length] = { "id": events[i].id, "what": events[i].what, "counter": getCounter(events[i].wdate), "where": events[i].where, "lat": events[i].lat, "long": events[i].long};  
			
		    list = list + '<div class="panel panel-default">' 
					        + '<div class="panel-body">'
						       + '<table class="table" style="margin-bottom: 0">'
						          + '<thead style="font-size: 12px">'
							         + '<tr style="margin-bottom: 0">' 
							            + '<td width = "90">'
								           + '<center>'
                                              + '<a class="pull-left" href="javascript:;" onclick = macco.main.setAnchorProfile(' +events[i].by+ ')>'
                                                 + '<img src="phil.jpg" class="img-rounded" alt="..." width = "80" height = "60">'
                                              + '</a>'
                                              + '</center>'
								        + '</td>' 
								        + '<td>'
                        						+ '<a href = "javascript:;" onclick = macco.main.setAnchorProfile(' +events[i].by+ ')>' +events[i].owner+ '</a> posted on ('+events[i].pdate.toDateString()+ ')'								 
									       + '<ul class="list-group" style="margin-bottom: 0">'
									          + '<li class="list-group-item" style="margin-bottom: 0">'
								                 + '<strong>' +events[i].what+ '</strong>'
									          + '</li>'
									          + '<li class="list-group-item list-group-item-warning" id = "counter' +i+ '">'
									             + '<center>' +counterToString(counterList[i].counter)+ '</center>'
									          + '</li>'									   
                                           + '</ul>'				  
								        + '</td>' 
								        + '<td width = "200">'
								       + '<a href = "javascript:;" onclick = macco.main.setAnchorWhen(' +i+ ')> When: </a>'								 
									       + '<ul class="list-group" style="margin-bottom: 0">'									   
                                              + '<li class="list-group-item" style="margin-bottom: 0">'
							                     + '<strong><span class ="glyphicon glyphicon-calendar"></span> ' +events[i].wdate.toDateString()+ '</strong>'
                                                 + '<br> <span class ="glyphicon glyphicon-time"></span> Begins : ' +events[i].wdate.toLocaleTimeString()+ ''
                                                 + '<br> <span class ="glyphicon glyphicon-time"></span> Ends : ' +events[i].wend.toLocaleTimeString()+ ''												 
                                                 + '<br> Duration :' + duration(events[i].wdate, events[i].wend) + ''
								              + '</li>'
                                           + '</ul>'
								        + '</td>'
								        + '<td width = "200">'
								       + '<a href = "javascript:;" onclick = macco.main.setAnchorWhere(' +i+ ')> Where: </a>'								 
								  	          + '<ul class="list-group" style="margin-bottom: 0">'									   
                                                 + '<li class="list-group-item" style="margin-bottom: 0">'
							                        + '<strong>' +events[i].where+ '</strong>'
                                                       + '<br>' +events[i].city+ ','	
                                                       + '<br>' +events[i].country
								                 + '</li>'
                                              + '</ul>'
								        + '</td>' 								 
							        + '</tr>'
                                + '</thead>'							   
                            + '</table>'
						+ '</div>' 
					+ '</div>';
		}
		stateMap.$container.html(String() +list);
		return list;
			    
    };	

	listEventsPosted = function(userId)
	{
	    events = [];
		events = macco.model.getEventsPosted(userId);
		   
		var list = "";
		counterList = [];
		
		for(var i = 0; i < events.length; i++)
		{
			
			counterList[counterList.length] = { "id": events[i].id, "what": events[i].what, "counter": getCounter(events[i].wdate), "where": events[i].where, "lat": events[i].lat, "long": events[i].long};  
			
		    list = list + '<div class="panel panel-default">' 
					        + '<div class="panel-body">'
						       + '<table class="table" style="margin-bottom: 0">'
						          + '<thead style="font-size: 12px">'
							         + '<tr style="margin-bottom: 0">' 
							            + '<td width = "90">'
								           + '<center>'
                                              + '<a class="pull-left" href="javascript:;" onclick = macco.main.setAnchorProfile(' +events[i].by+ ')>'
                                                 + '<img src="phil.jpg" class="img-rounded" alt="..." width = "80" height = "60">'
                                              + '</a>'
                                              + '</center>'
								        + '</td>' 
								        + '<td>'
    							       + '<a href = "javascript:;" onclick = macco.main.setAnchorProfile(' +events[i].by+ ')>' +events[i].owner+ '</a> posted on ('+events[i].pdate.toDateString()+ ')'								 
									       + '<ul class="list-group" style="margin-bottom: 0">'
									          + '<li class="list-group-item" style="margin-bottom: 0">'
								                 + '<strong>' +events[i].what+ '</strong>'
									          + '</li>'
									          + '<li class="list-group-item list-group-item-warning" id = "counter' +i+ '">'
									             + '<center>' +counterToString(counterList[i].counter)+ '</center>'
									          + '</li>'									   
                                           + '</ul>'				  
								        + '</td>' 
								        + '<td width = "200">'
									       + '<a href = "javascript:;" onclick = macco.main.setAnchorWhen(' +i+ ')> When: </a>'							 
									       + '<ul class="list-group" style="margin-bottom: 0">'									   
                                              + '<li class="list-group-item" style="margin-bottom: 0">'
							                     + '<strong><span class ="glyphicon glyphicon-calendar"></span> ' +events[i].wdate.toDateString()+ '</strong>'
                                                 + '<br> <span class ="glyphicon glyphicon-time"></span> Begins : ' +events[i].wdate.toLocaleTimeString()+ ''
                                                 + '<br> <span class ="glyphicon glyphicon-time"></span> Ends : ' +events[i].wend.toLocaleTimeString()+ ''												 
                                                 + '<br> Duration :' + duration(events[i].wdate, events[i].wend) + ''
								              + '</li>'
                                           + '</ul>'
								        + '</td>'
								        + '<td width = "200">'
									+ '<a href = "javascript:;" onclick = macco.main.setAnchorWhere(' +i+ ')> Where: </a>'								 
								  	          + '<ul class="list-group" style="margin-bottom: 0">'									   
                                                 + '<li class="list-group-item" style="margin-bottom: 0">'
							                        + '<strong>' +events[i].where+ '</strong>'
                                                       + '<br>' +events[i].city+ ','	
                                                       + '<br>' +events[i].country
								                 + '</li>'
                                              + '</ul>'
								        + '</td>' 								 
							        + '</tr>'
                                + '</thead>'							   
                            + '</table>'
						+ '</div>' 
					+ '</div>';
		}
		
	    stateMap.$container.html(String() +list);
		
		return list;
	};	

	
	
	
	

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name: updateEventsBoard
//
// Arguments: list - this is a list(array) of event objects - the events that we wish to display
//            search - boolean. if True then this page should list the results of an event search.
//            search_terms - these were the terms used to search for the event if it was an event_search
//
// Return type : None
//
// This function is used as a repsonse function to display all the incomping events that we wish to display on the screen on the Events page
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
updateEventsBoard = function(list, search, search_terms)
{
    if((list === undefined) || (list === null) || (list === []) || (list.length === 0))
	{
	   var display_text = '<div class="container ">'
                                + '<div class="col-md-12 col-sm-12 col-xs-9">'
                                      + '<!-- Page Heading -->'
                                        + '<div class="row">'
                                           + '<div class="col-lg-12">'
	                                            + '<h1 id="board-header">No upcoming events currently listed...</h1>'
                                                + '<div class="col-xs-4 col-sm-4 col-md-4 pull-right nopadding">'
                                                     + '<form class="navbar-form nopadding" role="search" action="#" onsubmit="return macco.main.setAnchorTopSearch()">'
                                                     + '<div class="input-group">'
                                                          + '<input type="text" class="form-control" placeholder="Search" id="events-board-search">'
							                              + '<div class="input-group-btn">'
                                                               + '<button class="btn btn-default" type="button" onclick = macco.main.setAnchorTopSearch()><i class="glyphicon glyphicon-search"></i></button>'
                                                          + '</div>'
                                                     + '</div>'
                                                     + '</form>'
                                                + '</div>'
                                           + '</div>'
                                        + '</div>'
                                      + '<!-- /.row -->'
                                + '</div>'
                            + '</div>';
									
	   stateMap.$container.html(String() +display_text);
       return;
	}

    // if we have a valid list -////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	console.log("the type of _id === " +typeof(list[0]._id));
    
    // first we generate the counters
    macco.counter.setCounters(list);

    console.log(" we are in updateEventsBoard() now ");

    // now we start compiling markup
    var display = '<div class="container ">'
                       + '<div class="col-md-12 col-sm-12 col-xs-9">'
                             + '<!-- Page Heading -->'
                                 + '<div class="row">'
                                    + '<div class="col-lg-12">';
									
									if(search === true)
									{	
								       display = display + '<h1 class="page-header" id="board-header">Search Results...</h1>'
                                            + '<div class="col-xs-4 col-sm-4 col-md-4 pull-right nopadding">'
                                                + '<form class="navbar-form nopadding" role="search" action="#" onsubmit="return macco.main.setAnchorTopSearch()">'
                                                    + '<div class="input-group">'
                                                        + '<input type="text" class="form-control" placeholder="Search" id="events-board-search" value="';
														if((search_terms !== undefined) && (search_terms !== null))
                                                        {
															// for(var i = 0; i < search_terms.length; i++)
																display = display +search_terms[0]+ ' ';
														}  
								                        display = display + '">';
									}
									else
									{
                                        display = display + '<h1 class="page-header" id="board-header">Upcoming Events</h1>'
                                            + '<div class="col-xs-4 col-sm-4 col-md-4 pull-right nopadding">'
                                                + '<form class="navbar-form nopadding" role="search" action="#" onsubmit="return macco.main.setAnchorTopSearch()">'
                                                    + '<div class="input-group">'
                                                        + '<input type="text" class="form-control" placeholder="Search" id="events-board-search">';
									}
																		
                                                            display = display + '<div class="input-group-btn">'
                                                                + '<button class="btn btn-default" type="button" onclick = macco.main.setAnchorTopSearch()><i class="glyphicon glyphicon-search"></i></button>'
                                                            + '</div>'
                                                    + '</div>'
                                                + '</form>'
                                            + '</div>'
                                    + '</div>'
                                 + '</div>'
                              + '<!-- /.row -->';

    // writing the markup for each event
    var i;
    for(i = 0; i < list.length; i++)
    {
        // start new
        display = display + '<div>' // class="row container-post">'           // "col-md-12 col-xs-12 container-map-ep">'  //    "row container-post">'
                               + '<h4 style = "font-size:14px"><strong><span class="glyphicon glyphicon-tags"></span> </strong>'
							          + '<a href= javascript:; onclick = macco.nav.setAnchorEvents(1)> #All </a> '   // we want all upcoming events on the platform
                                      + '<a href= javascript:; onclick = macco.nav.setAnchorEvents(2)> #Near_Me </a> ';   //we want only event close to my location 
        
		for(var j = 0; j < list[i].tags.length; j++)
        {
            display = display + '<a href="javascript:; onclick = macco.main.setAnchorSearchEvents(' +i+ ',' +j+ ')"> #' +list[i].tags[j]+ ' </a> ';
        }

        display = display + '</h4></div>';
		// end new
		
        // first write the event
        display = display + '<!-- Project One -->'
                                  + '<article>'
                                     + '<div class="row container-post">'
                                        + '<div class="col-md-5 entry-thumbnail">'
                                           + '<a  data-toggle="collapse" href="#collapseExample" aria-expanded="false" aria-controls="collapseExample">';

        // set the image for this event
        if((list[i].image === undefined) || (list[i].image === null) || (list[i].image === ""))
        {
            display = display + '<img class="img-responsive" src="http://www.ucarecdn.com/746f7c30-95ed-49c5-b9f4-c8bd40bb24f3/-/resize/470x286/" alt="">';
        }
        else
        {
            display = display + '<img class="img-responsive" src="' +list[i].image+ '-/resize/470x286/" alt="">';
        }

        // continue
        display = display + '<div class="bg-active">'
                               + formatTitleBoard(list[i].title)
                               + '<h4>' +moment(list[i].startDate).format('llll')+ '</h4>'
                          + '</div>'
                          + '<div class="hover">'
                               + '<h3 onclick = macco.main.setAnchorViewEvent(' +i+ ') id = "view_event">VIEW DETAILS</h3>'
							   + '<h4>'
							       + 'Share | <i class="fa fa-envelope" aria-hidden="true" onclick = macco.main.shareModalOpen("#_' +i+ '")></i>'
								   // + ' | <i class="fa fa-facebook-square" aria-hidden="true"></i>'	// never delete these comments							   
								   // + ' | <i class="fa fa-google-plus" aria-hidden="true"></i>'    // never delete these comments
								   // + ' | <i class="fa fa-twitter" aria-hidden="true"></i>'
							   + '</h4>'
                               + '<span>0</span>'
                          + '</div>'
                      + '</a>'
                   + '</div>'
                   + '<div class="col-md-7">'
                       + '<header class="entry-header">'
                       + '<span>Posted by </span>';

        // verify who posted it
        if((list[i].profileId === undefined) || (list[i].profileId === null))
        {
            display = display + '<a href= "javascript:;" onclick = macco.main.setAnchorProfileNoname()>Noname</a>';
        }
        else
        {
            display = display + '<a href = "javascript:;" onclick = macco.main.setAnchorProfileOther(' +i+ ') id = "nnnn-' +i+ '" >' +list[i].profileName+ '</a>';
        }
        // continue
        display = display + '<span> (' +moment(list[i].postedOn, "YYYYMMDD").fromNow()+ ')</span>'
                       + '</header>'
                       + '<div class="entry-summary">'
                             + formatDetailsBoard(list[i].details, list[i].link, i, list[i]._id)
                       + '</div>'
                       + '<footer class="entry-meta">'
                              + '<div class="col-md-5 col-sm-5 nopadding" id = "timer_' +i+ '">'
                                    + macco.counter.getString(i)
                              + '</div>'
                       + '<div class="col-md-6  col-sm-7 col-xs-12 info col-md-offset-1 nopadding">'
                              + '<div class="col-md-6 col-sm-5 col-xs-4 nopadding">'
                                    + '<h5>When:</h5>'
                                    // + '<a href="#">'
                                         + '<ul class="nopadding">'
                                               + '<li><strong>' +moment(list[i].startDate).format('dddd MMM D YYYY')+ '</strong></li>'
                                               + '<li><strong>Begins: ' +moment(list[i].startDate).format('h:mm:ss a')+ '</strong></li>'
                                               + '<li><strong>Ends: ' +moment(list[i].endDate).format('h:mm:ss a')+ '</strong></li>'
                                               + '<li><strong>Duration: ' +duration(moment(list[i].endDate).toDate() - moment(list[i].startDate).toDate())+ '</strong></li>'
                                         + '</ul>'
                                    // + '</a>'
                              + '</div>'
                              + '<div class="col-md-6 col-sm-5 col-xs-5 nopadding">'
									+ '<h5>Where:</h5>'
                                    // + '<a href="#">'
                                         + '<ul class="nopadding">'
                                             + '<li><strong>' +list[i].location+ '</strong></li>'
                                            //   + '<li><strong>' +list[i].street+ '</strong></li>'
                                             + '<li><strong>' +list[i].city+ '</strong></li>'
                                             + '<li><strong>' +list[i].state+ '</strong></li>'
                                         + '</ul>'
                                    // + '</a>'
                              + '</div>'
                       + '</div>'
                       + '</footer>'
              // + '<div id = "tags_' +i+ '"></div>'
                   + '</div>'
              //+ '<div id = "tags_' +i+ '"></div>'
              + '</article>'
              + '<div id = "tags_' +i+ '"></div>';

     }
	 
	 // arrange the modals
	 for(i = 0; i < list.length; i++)
	 {
		 display = display + '<!--Pop up Followers-->'
                       + '<div class="modal fade" id="_' +i+ '">'
                             + '<div class="modal-dialog" role="document">'
                                    + '<div class="modal-content">'
                                          + '<div class="modal-header">'
                                                 + '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'
                                                    + '<span aria-hidden="true">&times;</span>'
                                                 + '</button>'
                                                 + '<h4 class="modal-title"><center>Email this event (' +list[i].title+ ')</center></h4>'
                                          + '</div>'
                                          + '<div class="modal-body">'
                                                + '<form>'
				                                    + '<div class="col-md-12 text-center">'
				                                         + '<div class="form-group text-left">'
				                                             + '<label for="Email">E-mail:</label>'
															 + '<div id = "send-event-email-message_' +i+ '"></div>'
				                                             + '<input class="form-control" id="share_emails_' +i+ '" placeholder="Enter email addresses here">'
															 + '<input class="form-control" id="share_from_' +i+ '" placeholder="from...">'
                                                             + '<textarea name="text" class="form-control" id="share_short_message_' +i+ '" placeholder="add a short message..." ></textarea>'
				                                          + '</div>'
														  + '<button type="button" class="btn  btn-lg btn-three" id="email-share-button_' +i+ '" onclick = macco.main.shareEventEmail(' +i+ ')>Share</button>'
													+ '</div>'
												+ '</form>'
                                          + '</div>'
                                          + '<div class="modal-footer">'
                                          + '</div>'
                                    + '</div><!-- /.modal-content -->'
                             + '</div><!-- /.modal-dialog -->'
                       + '</div><!-- /.modal -->'
	 };
	 
	 display = display + '<div class="row text-center">'
						     + '<div class="col-lg-12">'
									+ '<ul class="pagination">'
										  + '<li class="active">'
											     + '<a href="#"></a>'
										  + '</li>'
										  + '<li>'
											     + '<a href="#"></a>'
										  + '</li>'
										  + '<li>'
											     + '<a href="#"></a>'
										  + '</li>'
									+ '</ul>'
						     + '</div>'
					    + '</div><!-- /.row -->';
	 
	 
     stateMap.$container.html(String() +display);
	 

     macco.counter.startTimer();

     return;

};


changeBoardHeader = function(message)
{
	$("#board-header").text(message);	
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name: listTagsOnBoard
//
// Arguments: event_index - the interger index of the specific event we want list the tags for.
//
// Return type: None
//
// This function is used to generate the list of tags associated with an event//
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
listTagsOnBoard = function(event_index)
{
    var event = macco.counter.getEvent(event_index);

    if((event_index < 0) || (event === undefined) || (event === null))
       return;

    // get the tages and write the message

    var tags = '<div class="alert alert-info" id = "display-event-tag' +event_index+ '">'
                    + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                        + '<center><h4 style = "font-size:18px"><strong>Filter by : </strong>';

    for(var i = 0; i < event.tags.length; i++)
    {
        tags = tags + '<a href="javascript:;" onclick = macco.main.setAnchorSearchEvents(' +event_index+ ',' +i+ ')> #' +event.tags[i]+ ' </a> ';
    }

    tags = tags + '</h4></center></div>';

    $("#tags_" +event_index).html(tags);

    console.log(" list tags executed at : " +tags);
};




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name : displayEvent
//
// Arguments : eventId - the id of the event we whish to display
//
// Return type : None
//
// This function is used to display the details of an even on the screen
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
displayEvent = function(eventId)
{
    var event = null;
    var list = macco.counter.getEventsList();  // note how this is used.
    var len = list.length;
    var index = 0;

    for(var i = 0; i < len; i++)
    {
        if(list[i]._id === eventId)
        {
            event = list[i];
            index = i;
            break;
        }
    }

    if((event === undefined) || (event === null))
       return;

    // if we have an index   ////////////////////////////////////////////////////////////////////////////

    console.log(" we are in displayEvent() now ");

    // now we start compiling markup
    var display = '<div class="container ">'
                       + '<div class="col-md-12 col-sm-12 col-xs-9">'
                             + '<!-- Page Heading -->'
                                 + '<div class="row">'
                                    + '<div class="col-lg-12">'
                                        + '<h1 class="page-header">Event Details</h1>'
                                            + '<div class="col-xs-4 col-sm-4 col-md-4 pull-right nopadding">'
                                                + '<form class="navbar-form nopadding" role="search" onsubmit="return macco.main.setAnchorTopSearch()">'
                                                    + '<div class="input-group">'
                                                        + '<input type="text" class="form-control" placeholder="Search" id="events-board-search">'
                                                            + '<div class="input-group-btn">'
                                                                + '<button class="btn btn-default" type="submit"><i class="glyphicon glyphicon-search" onclick=macco.main.setAnchorTopSearch()></i></button>'
                                                            + '</div>'
                                                    + '</div>'
                                                + '</form>'
                                            + '</div>'
                                    + '</div>'
                                 + '</div>'
                              + '<!-- /.row -->';

     display = display + '<div>' // class="row container-post">'           // "col-md-12 col-xs-12 container-map-ep">'  //    "row container-post">'
                           + '<h4 style = "font-size:14px"><strong><span class="glyphicon glyphicon-tags"></span> </strong>'
						        + '<a href="javascript:; onclick = macco.nav.setAnchorEvents()"> #All </a> ';

    for(var j = 0; j < event.tags.length; j++)
    {
        display = display + '<a href="javascript:; onclick = macco.main.setAnchorSearchEvents(' +index+ ',' +j+ ')"> #' +list[i].tags[j]+ ' </a> ';
    }

     display = display + '</h4></div>';


    // writing the markup for each event
        // first write the event
        display = display + '<!-- Project One -->'
                                  + '<article>'
                                     + '<div class="row container-post">'
                                        + '<div class="col-md-5 entry-thumbnail">'
                                           + '<a  data-toggle="collapse" href="#collapseExample" aria-expanded="false" aria-controls="collapseExample">';

        // set the image for this event
    //  var event = macco.counter.getEvent(index);
    if((event.image === undefined) || (event.image === null) || (event.image === ""))
    {
       display = display + '<img class="img-responsive" src="http://www.ucarecdn.com/746f7c30-95ed-49c5-b9f4-c8bd40bb24f3/-/resize/470x286/" alt="">';
    }
    else
    {
       display = display + '<img class="img-responsive" src="' +event.image+ '-/resize/470x286/" alt="">';
    }

    // continue
    display = display + '<div class="bg-active">'
                               + formatTitleBoard(event.title)
                               + '<h4>' +moment(event.startDate).format('llll')+ '</h4>'
                          + '</div>'
                          + '<div class="hover">'
                               + '<h3>PIN THIS</h3>'
                               + '<h4>'
							       + 'Share | <i class="fa fa-envelope" aria-hidden="true" onclick = macco.main.shareModalOpen("#_' +index+ '")></i>'
								   //+ ' | <i class="fa fa-facebook-square" aria-hidden="true"></i>'	// never delete these							   
								   //+ ' | <i class="fa fa-google-plus" aria-hidden="true"></i>'    // never delete these
								   //+ ' | <i class="fa fa-twitter" aria-hidden="true"></i>'         // never detel
							   + '</h4>' 
                               + '<span>0</span>'
                          + '</div>'
                    + '</a>'
                   + '</div>'
                   + '<div class="col-md-7">'
                       + '<header class="entry-header">'
                       + '<span>Posted by </span>';

    // verify who posted it
    if((event.profileId === undefined) || (event.profileId === null))
    {
        display = display + '<a href= "javascript:;" onclick = macco.main.setAnchorOtherProfile(null)>Noname</a>';
    }
    else
    {
        display = display + '<a href = "javascript:;" onclick = macco.main.setAnchorProfileOther(' +index+ ')>' +event.profileName+ '</a>';
    }
    // continue
    display = display + '<span> (' +moment(event.postedOn, "YYYYMMDD").fromNow()+ ')</span>'
                       + '</header>'
                       + '<div class="entry-summary">'
                            + '<p>'
                                + list[i].details
                            + '</p>'
                            + '<p>'
                                + formatDetailsBoard("", list[i].link, i, list[i]._id)    // make sure this does not give an error
                            + '</p>'
                       + '</div>'
                       + '<footer class="entry-meta">'
                              + '<div class="col-md-5 col-sm-5 nopadding" id = "timer_' +index+ '">'
                                    + macco.counter.getString(index)
                              + '</div>'
                       + '<div class="col-md-6  col-sm-7 col-xs-12 info col-md-offset-1 nopadding">'
                              + '<div class="col-md-6 col-sm-5 col-xs-4 nopadding">'
                                    + '<h5>Starts:</h5>'
                                    //+ '<a href="#">'
                                         + '<ul class="nopadding">'
                                             + '<li><strong>' +moment(event.startDate).format('dddd MMM D YYYY')+ '</strong></li>'
                                               + '<li><strong>Time : ' +moment(event.startDate).format('h:mm:ss a')+ '</strong></li>'
                                               // + '<li><strong>Ends: ' +moment(event.endDate).format('h:mm:ss a')+ '</strong></li>'
                                               + '<li><strong>Duration: ' +duration(moment(event.endDate).toDate() - moment(event.startDate).toDate())+ '</strong></li>'
                                         + '</ul>'
                                    //+ '</a>'
                              + '</div>'
                              + '<div class="col-md-6 col-sm-5 col-xs-5 nopadding">'
                                    + '<h5>Ends:</h5>'
                                    //+ '<a href="#">'
                                         + '<ul class="nopadding">'
                                               + '<li><strong>' +moment(event.endDate).format('dddd MMM D YYYY')+ '</strong></li>'
                                               // + '<li><strong>Begins: ' +moment(event.startDate).format('h:mm:ss a')+ '</strong></li>'
                                               + '<li><strong>Time : ' +moment(event.endDate).format('h:mm:ss a')+ '</strong></li>'
                                               // + '<li><strong>Duration: ' +duration(moment(event.endDate).toDate() - moment(event.startDate).toDate())+ '</strong></li>'
                                         + '</ul>'
                                    //+ '</a>'
                              + '</div>'
                       + '</div>'
                       + '</footer>'
                   + '</div>'
              + '</article>';

     display = display + '<h4><strong><span class="glyphicon glyphicon-map-marker"></span></strong>'
                             +event.location+ ' - ' +event.street+ ', ' +event.city+ ', ' +event.state
                       + '</h4>';

     display = display + '<div class="col-md-12 col-xs-12 container-map-ep" id = "pin">'
                       + '</div>'
					   + '<!--Pop up Followers-->'
                       + '<div class="modal fade" id="_' +index+ '">'
                             + '<div class="modal-dialog" role="document">'
                                    + '<div class="modal-content">'
                                          + '<div class="modal-header">'
                                                 + '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'
                                                    + '<span aria-hidden="true">&times;</span>'
                                                 + '</button>'
                                                 + '<h4 class="modal-title"><center>Email this event (' +event.title+ ')</center></h4>'
                                          + '</div>'
                                          + '<div class="modal-body">'
                                                + '<form>'
				                                    + '<div class="col-md-12 text-center">'
				                                         + '<div class="form-group text-left">'
				                                             + '<label for="Email">E-mail:</label>'
															 + '<div id = "send-event-email-message_' +index+ '"></div>'
				                                             + '<input class="form-control" id="share_emails_' +index+ '" placeholder="Enter email addresses here">'
															 + '<input class="form-control" id="share_from_' +index+ '" placeholder="from...">'
                                                             // + '<textarea name="text" class="form-control" id="share_short_message_' +index+ '" placeholder="add a short message..." ></textarea>'
															 + '<div id = "share_event_message"></div>'
				                                          + '</div>'
														  + '<button type="button" class="btn  btn-lg btn-three" id="email-share-button" onclick = macco.main.shareEventEmail(' +index+ ')>Share</button>'
													+ '</div>'
												+ '</form>'
                                          + '</div>'
                                          + '<div class="modal-footer">'
                                          + '</div>'
                                    + '</div><!-- /.modal-content -->'
                             + '</div><!-- /.modal-dialog -->'
                       + '</div><!-- /.modal -->'
					   + '</div>';  

     
     stateMap.$container.html(String() +display);
            
     macco.util.locationMap(list[i].lat, list[i].lng, event.title);   // attach the map

     macco.counter.startTimer();

     return;

};

shareModalOpen = function(modal_id)
{
	$(modal_id).modal('show'); 
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
shareEventEmail = function(event_index)
{
	console.log("we are in share_event_mail === " +event_index);
	
	var email_list = document.getElementById('share_emails_' +event_index).value;
		
	if((email_list === undefined) || (email_list === null) || (email_list === ""))  // if nothing was included in the email space
	{
		// print error message on screen
        $("#send-event-email-message_" +event_index).html('<div class="alert alert-warning" id = "messages">'
			                                            + '<center><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                                        + '<p> <strong style = "font-size:15px">Include at least one email to send to.</strong> </p>'
                                                        + '<p style = "font-size:15px"> Do make sure you include valid emails to send this event to.' 
													    + '<br>Emails should be separated by a space or comma.</p></center>'
                                                + '</div>');												
	    return;	
	}
	var from_message = document.getElementById('share_from_' +event_index).value + ' thought that you would be interested in the following event:';
	
	if((from_message === undefined) || (from_message === null) || (from_message === ""))
	{
		from_message = 'Someone thought that you would be interested in the following event';
	}
	
	// var short_message = document.getElementById('share_short_message_' +event_index).value;
		
	// spilt the emails
	var emails = email_list.split(/ |,/g);   // split by space and comma
	console.log("split emails === " +emails);
		
	var list = [];
		
	//get list of valid emails
	for(var i = 0; i < emails.length; i++)
	{			
		if(validateEmail(emails[i]) === true)
		   list.push(emails[i]);
	}
		
	console.log("new email list === " +list+ " length === " +list.length);
		
	if(list.length === 0)
	{
		// print error message on screen
        $("#send-event-email-message_" +event_index).html('<div class="alert alert-warning" id = "messages">'
			                                    + '<center><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                                + '<p> <strong style = "font-size:15px">Valid email addresses required</strong> </p>'
                                                + '<p style = "font-size:15px"> Do make sure you include valid emails to send this event to.' 
											    + '<br>Emails should be separated by a space or comma.</p></center>'
                                             + '</div>');		
	    console.log("we are in list.length if block !!!!-----");
											 
	    return;
	}
	
	var event_to_send = macco.counter.getEvent(event_index);
	
	if((event_to_send === undefined) || (event_to_send === null))
	{
		console.log("the event to send is undefined or null");
		return;
	}
	
	//construct the email here
	var message = '<!DOCTYPE html>'
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
							   + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;">'
							      +from_message
			                   + '</p>'
						  + '</div>'
						  + '<div class="entry-summary">'
                               + '<center><p style="font: 300 20px \'Roboto Condensed\', sans-serif;">' +event_to_send.title+ '</p></center>'
                          + '</div>'
                          + '<div class="entry-summary">'
                               + '<p style="font: 300 16px \'Roboto Condensed\', sans-serif;">' +event_to_send.details+ '</p>'
                          + '</div>'							   
                          + '<div class="entry-summary">'
                               + '<center>'
                                   + '<h4><strong style="font-weight: 700;">Location:</strong>' +event_to_send.location+ ', ' +event_to_send.street+ ', ' +event_to_send.city+ ', ' +event_to_send.state+ '</h4>'
								   + '<h4><strong style="font-weight: 700;">Date:</strong>' +moment(event_to_send.startDate).format('dddd MMM D YYYY')+ '</h4>'
                                   + '<h4><strong style="font-weight: 700;">Starts:</strong>' +moment(event_to_send.startDate).format('h:mm:ss a')+  '</h4>'
                                   + '<h4><strong style="font-weight: 700;">Ends:</strong>' +moment(event_to_send.endDate).format('h:mm:ss a')+  '</h4>'
                                   + '<h4><strong style="font-weight: 700;">Duration:</strong> <a class="time green  nopadding" href="#" style="background-color: transparent; color: #8A9D28; padding: 0;">' +duration(moment(event_to_send.endDate).toDate() - moment(event_to_send.startDate).toDate())+ '</a></h4>'
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
	
		
	macco.model.shareEventViaEmail({email: list, sharing : message, event_id : macco.counter.getEvent(event_index)._id});
	return;
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name : shareEventResponse
//
// Arguments : response - this is a JSON object that contains information about the event you tried to send and the status falgs of the operation.
//
// Return Type: None.
//
// This function is used to display on the browser the outcome of an attempt to share an event.
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
shareEventResponse = function(response)
{

        if(response.status === 'success')
        {
            $("#share_event_message").html('<div class="alert alert-success">'
			                                    + '<center><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                                + '<p> <strong style = "font-size:15px">Success !!...</strong> </p>'
                                                + '<p style = "font-size:15px"> This event has been sent to your chosen recipients.' 
											    + '</p></center>'
                                             + '</div>');
			return;
        }
							  
        if(response.status === 'share_event_via_email_event_not_found')
	    {
            $("#share_event_message").html('<div class="alert alert-warning">'
			                                    + '<center><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                                + '<p> <strong style = "font-size:15px">Event not Found...</strong> </p>'
                                                + '<p style = "font-size:15px"> Our apologies.' 
											    + '<br>The event you are trying to share does not appear to be in our database. Perhaps the the owner deleted it before you were able to share it. </p></center>'
                                             + '</div>');
            return;											 
	    }
							  
	    if(response.status === 'error_sending_event')
		{
            $("#share_event_message").html('<div class="alert alert-warning">'
			                                    + '<center><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                                                + '<p> <strong style = "font-size:15px">Amm.... An error sharing the event.</strong> </p>'
                                                + '<p style = "font-size:15px"> Our apologies. We have experienced an error is attempting to share the event.' 
											    + '<br>Try sharing again and see what happens.</p></center>'
                                             + '</div>');	
       
            return;	   
		}
							  									 	
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name : formatDetailsBoard
//
// Arguments : details - A string - the text describing the details of an event.
//
//             link - A string - the link to the web-page were we can get more details.
//
//             index - Number - the index of the event to which this information pertains.
//
//             id - ?
//
// Return type: String - the formatted html of the details and the link for an event to be displayed on the eventsBoard.
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
formatDetailsBoard = function(details, link, index, id)
{
    var display = '<p>';

    if((details === undefined) || (details === null) || (details === ""))
    {
       display = display + '</p>';
       // return display;
    }
    else if(details.length > 200)
    {
       display = display + details.substring(0, 200);
       display = display + '...<a href= "javascript:;" onclick = macco.main.setAnchorViewEvent(' +index+ ')> (More Details)</a>';
       display = display + '</p>';
    }
    else
       display = display + details + '...<a href= "javascript:;" onclick = macco.main.setAnchorViewEvent(' +index+ ')> (More Details)</a></p>';
	
	if((link === undefined) || (link === null) || (link === ""))
		return display;

    if(link.length < 40)
       display = display + '<p><strong>Link: </strong><a href = ' +link+ ' target = "_blank">' +link+ '</a></p>';
    else
       display = display + '<p><strong>Link: </strong><a href = ' +link+ ' target = "_blank">' +link.substring(0,55)+ '</a></p>';

    return display;

};








	
	getEventsResponse = function(msg)
	{
            if((msg.status !== 'success') && (msg.status !== 'success_on') && (msg.status !== 'success_by'))
            {
                 console.log('getEventsResponse = ' +msg.status);
                 return;
            }

                        
            // compiling markup for the events list
            var list = '<div class="container ">' 
                       + '<div class="col-md-12 col-sm-12 col-xs-9">'
                             + '<!-- Page Heading -->'
                                 + '<div class="row">'
                                    + '<div class="col-lg-12">'
                                        + '<h1 class="page-header">Upcoming Events</h1>'
		                            + '<div class="col-xs-4 col-sm-4 col-md-4 pull-right nopadding">'
		                                + '<form class="navbar-form nopadding" role="search">'
		                                    + '<div class="input-group">'
		                                        + '<input type="text" class="form-control" placeholder="Search" name="q">'
		                                            + '<div class="input-group-btn">'
		                                                + '<button class="btn btn-default" type="submit"><i class="glyphicon glyphicon-search"></i></button>'
		                                            + '</div>'
		                                    + '</div>'
		                                + '</form>'
		                            + '</div>'    
		                    + '</div>'
                                 + '</div>'
                              + '<!-- /.row -->';

              // writing the markup for each event
              for(var i = 0; i < msg.events.length; i++)
              {
                   // first write the event
                   list = list + '<!-- Project One -->'
		                  + '<article>'
		                     + '<div class="row container-post">'
		                        + '<div class="col-md-5 entry-thumbnail">'
		                           + '<a  data-toggle="collapse" href="#collapseExample" aria-expanded="false" aria-controls="collapseExample">';

                   // set the image for this event
                   if((msg.events[i].image === undefined) || (msg.events[i].image === null) || (msg.events[i].image === ""))
                   {
                        list = list + '<img class="img-responsive" src="images/x-full-size.png" alt="">';
                   }
                   else
                   {
                        list = list + '<img class="img-responsive" src="' +msg.events[i].image+ '" alt="">';
                   }

                   // continue
                   list = list + '<div class="bg-active">'
		                                    + '<h3>' +msg.events[i].title+ '</h3>'
		                                    + '<h4>' +moment(msg.events[i].startDate).format('llll')+ '</h4>'
		                                 + '</div>'
		                                 + '<div class="hover">'
		                                    + '<h3>TRACK THIS</h3>'
		                                    + '<h4>SHOW COMMENTS</h4>'
		                                    + '<span>2</span>'
		                                 + '</div>'
		                           + '</a>'
		                       + '</div>'
		                       + '<div class="col-md-7">'
		                           + '<header class="entry-header">'
		                               + '<span>Created by </span>';

                   // verify who posted it
                   if((msg.events[i].postedBy === undefined) || (msg.events[i].postedBy === null))
                   {
                        list = list + '<a href="#">Noname</a>';
                   }
                   else
                   {
                        list = list + '<a href="#">' +msg.events[i].postedBy+ '</a>';
                   }

                   // continue
                   list = list + '<span> on (' +moment(msg.events[i].postedOn).format('ll')+ ')</span>'
		                           + '</header>'
		                       + '<div class="entry-summary">'
		                           + '<p>' +msg.events[i].details+ '</p>'
		                       + '</div>'
		                       + '<footer class="entry-meta">'
		                           + '<div class="col-md-5 col-sm-5 nopadding">'
                                              + eventProgressString(moment(msg.events[i].startDate), moment(msg.events[i].endDate))
		                              + '<p>Days</p><p>Hours</p><p>Mins</p>'
		                           + '</div>'
		                           + '<div class="col-md-6  col-sm-7 col-xs-12 info col-md-offset-1 nopadding">'
		                              + '<div class="col-md-6 col-sm-5 col-xs-4 nopadding">'
		                                 + '<h5>Where:</h5>'
		                                 + '<a href="#">'
		                                    + '<ul class="nopadding">'
		                                       + '<li>' +msg.events[i].location+ '</li>'  
		                                       + '<li>' +msg.events[i].street+ '</li>'
		                                       + '<li>' +msg.events[i].city+ '</li>'
		                                       + '<li>' +msg.events[i].state+ '</li>'
		                                    + '</ul>'
		                                 + '</a>'
		                              + '</div>'
		                           + '<div class="col-md-6 col-sm-5 col-xs-5 nopadding">'
		                              + '<h5>When:</h5>'   
		                                 + '<a href="#">'
		                                    + '<ul class="nopadding">'
		                                       + '<li>' +moment(msg.events[i].startDate).format('dddd MMM D YYYY')+ '</li>'  
		                                       + '<li>Begins: ' +moment(msg.events[i].startDate).format('h:mm:ss a')+ '</li>'
		                                       + '<li>Ends: ' +moment(msg.events[i].endDate).format('h:mm:ss a')+ '</li>'
		                                       + '<li>Duration: ' +duration(moment(msg.events[i].endDate).toDate() - moment(msg.events[i].startDate).toDate())+ '</li>'
		                                    + '</ul>'
		                                 + '</a>'
		                          + '</div>'
		                          + '</div>'
		                       + '</footer>'
		                    + '</div>'
                                  + '</article>';

              }
	
              stateMap.$container.html(String() +list);
	
	      return;
	};
	
	
	generateMap = function(what, where, when, ltlg)
	{
               var map_list = '<span class="label label-primary" style = "font-size:15px">' +what+ '</span>'						
                                      + '<div class="panel panel-default" style = "font-size:15px"><br> _@ ' +where+ '</div>'
                                      + '<div id = "map1" style = "background:#D8D8D8"></div>'
	                              + '<br><span class="label label-primary" style = "font-size:15px">on (' +when+ ')</span>';
				  
	        stateMap.$container.html(String() +map_list); // update html					  
	   
		// try to centre the map on the first event location
		map = L.mapbox.map('map1', 'jachian.j95jpfjd').setView(ltlg, 15);
		
		/* myLayer = L.mapbox.featureLayer().addTo(map);
		
		features = [];
		
		features[0]  = { type: 'Feature', 
				 properties: { title: what,
					       description: where,
                                               'marker-color': '#f86767',
                                               'marker-size': 'large',
                                               'marker-symbol': 'marker',
                                                url: 'http://en.wikipedia.org'},
                                 geometry: { type: 'Point',
                                             coordinates: ltlg }
                               };
			    
                geojson = { type: 'FeatureCollection',
                            features: features
                          };
				  
	        myLayer.setGeoJSON(geojson); */


                var marker = L.marker(new L.LatLng(ltlg[0], ltlg[1]), { icon: L.mapbox.marker.icon({'marker-color': 'CC0033'}),
                                                  });

                marker.bindPopup(where);
                marker.addTo(map);
        };	
	
	// UTILITY METHODS /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	
	
	
		// DOM METHODS /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// These methods/functions that create and manipulate page elements, the DOM
	//
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// Name : setJqueryMap
	// Arguments : none
	// Returns : none
    // This is used to Cache jQuery collections - this should be in every shell and feature module we produce. this is used to reduce the
    // number of jQuery document traversals and improve performance	
	setJqueryMap = function()
	{
	    var $container = stateMap.$container;
		
		jqueryMap = { $container : $container};
		
		// $logo : $container.find('#logo'),	
	};
	
	








    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Change form one profile to another
    //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    changeProfile = function(index)
    {
        if((profilesList === null) || (profilesList === undefined))
           return;

        if(index < 0) // we want to use the anonymous profile
        {
            macco.model.changeProfile(JSON.stringify({pName : "Anonymous", details : "", address : "", website : "", email : "", phone : ""}));
            return;
        }    

        var new_profile = JSON.stringify(profilesList[index]);

        console.log("trying to change the profile :" +new_profile);

        macco.model.changeProfile(new_profile);
    };







    postEvent = function(event_index)
    {

         var event_title = document.getElementById('post-event-name').value;

         if((event_title === null) || (event_title === undefined) || (event_title === "")) //if user has not filled in this field
         {

              // print error message on screen
              $("#post-event-message-top").html('<div class="alert alert-warning" id = "messages">' 
                                                     + '<p> <strong style = "font-size:15px">Event title required</strong> </p>'
                                                     + '<p style = "font-size:15px"> You forgot to fil in the name or title for your event. </p>'
                                                + '</div>');

              $("#post-event-message-bottom").html('<div class="alert alert-warning" id = "messages">'
                                                     + '<p> <strong style = "font-size:15px">Event title required</strong> </p>'
                                                     + '<p style = "font-size:15px"> You forgot to fil in the name or title for your event. </p>'
                                                + '</div>');

              return;
          }



          var event_date = document.getElementById('post-event-date').value;

          console.log("event date = " +event_date);

          if((event_date === null) || (event_date === undefined) || (event_date === ""))   // if the event's date was not included
          {
              // print error message on screen
              $("#post-event-message-top").html('<div class="alert alert-warning" id = "messages">'
                                                     + '<p> <strong style = "font-size:15px">Event date required</strong> </p>'
                                                     + '<p style = "font-size:15px"> You left the date blank. <br> Do say when this event is to take place.</p>'
                                                + '</div>');

              $("#post-event-message-bottom").html('<div class="alert alert-warning" id = "messages">'
                                                     + '<p> <strong style = "font-size:15px">Event date required</strong> </p>'
                                                     + '<p style = "font-size:15px"> You left the date blank. <br> Do say when this event is to take place.</p>'
                                                + '</div>');


              return;
          }



          var event_time = document.getElementById('post-event-start-time').value;

          console.log("start time = " +event_time);

          
          if((event_time === null) || (event_time === undefined) || (event_time === ""))   // if the starting time was not included
          {

              // print error message on screen
              $("#post-event-message-top").html('<div class="alert alert-warning" id = "messages">'
                                                     + '<p> <strong style = "font-size:15px">Event start time required</strong> </p>'
                                                     + '<p style = "font-size:15px"> You left the staring time blank. <br> Do say what time the even is suppose to start.</p>'
                                                + '</div>');

              $("#post-event-message-bottom").html('<div class="alert alert-warning" id = "messages">'
                                                     + '<p> <strong style = "font-size:15px">Event start time required</strong> </p>'
                                                     + '<p style = "font-size:15px"> You left the staring time blank. <br> Do say what time the even is suppose to start.</p>'
                                                + '</div>');

              return;
          }

          var event_end_date = document.getElementById('post-event-end-date').value;
          var event_end_time = document.getElementById('post-event-end-time').value;

/*
          console.log("End time = " +event_end_time);

          if((event_end_time === null) || (event_end_time === undefined) || (event_end_time === ""))   // if the starting time was not included
          {

              // print error message on screen
              $("#post-event-message-top").html('<div class="alert alert-warning" id = "messages">'
                                                     + '<p> <strong style = "font-size:15px">Event end time required</strong> </p>'
                                                     + '<p style = "font-size:15px"> You forgot to let us know what time the event is supposed to end. <br> Do make sure to fill out the end time.</p>'
                                                + '</div>');

              $("#post-event-message-bottom").html('<div class="alert alert-warning" id = "messages">'
                                                      + '<p> <strong style = "font-size:15px">Event end time required</strong> </p>'
                                                     + '<p style = "font-size:15px"> You forgot to let us know what time the event is supposed to end. <br> Do make sure to fill out the end time.</p>'
                                                + '</div>');

              return;
          }

*/

          var event_location = document.getElementById('post-event-location').value;
/*

          if((event_location === null) || (event_location === undefined) || (event_location === ""))   // if the event's date was not included
          {
              // print error message on screen
              $("#post-event-message-top").html('<div class="alert alert-warning" id = "messages">'
                                                     + '<p> <strong style = "font-size:15px">Event location required</strong> </p>'
                                                     + '<p style = "font-size:15px"> You left the location blank. <br> Do say where the event will take place.</p>'
                                                + '</div>');

              $("#post-event-message-bottom").html('<div class="alert alert-warning" id = "messages">'
                                                     + '<p> <strong style = "font-size:15px">Event location required</strong> </p>'
                                                     + '<p style = "font-size:15px"> You left the location blank. <br> Do say where the event will take place.</p>'
                                                + '</div>');

              return;
          }
*/

          var event_street = document.getElementById('post-event-street').value;
          if((event_street === null) || (event_street === undefined) || (event_street === ""))   // if the event's date was not included
          {
              // print error message on screen
              $("#post-event-message-top").html('<div class="alert alert-warning" id = "messages">'
                                                     + '<p> <strong style = "font-size:15px">Street address required</strong> </p>'
                                                     + '<p style = "font-size:15px"> You left the location blank. <br> Do say where the event will take place.</p>'
                                                + '</div>');

              $("#post-event-message-bottom").html('<div class="alert alert-warning" id = "messages">'
                                                     + '<p> <strong style = "font-size:15px">Street address required</strong> </p>'
                                                     + '<p style = "font-size:15px"> You left the location blank. <br> Do say where the event will take place.</p>'
                                                + '</div>');

              return;
          }


          var event_city = document.getElementById('post-event-city').value;
          if((event_city === null) || (event_city === undefined) || (event_city === ""))   // if the event's date was not included
          {
              // print error message on screen
              $("#post-event-message-top").html('<div class="alert alert-warning" id = "messages">'
                                                     + '<p> <strong style = "font-size:15px">City required</strong> </p>'
                                                     + '<p style = "font-size:15px"> Do say in which city the event will take place.</p>'
                                                + '</div>');

              $("#post-event-message-bottom").html('<div class="alert alert-warning" id = "messages">'
                                                     + '<p> <strong style = "font-size:15px">City required</strong> </p>'
                                                     + '<p style = "font-size:15px"> Do say in which city the event will take place.</p>'
                                                + '</div>');

              return;
          }


          var event_state = document.getElementById('post-event-state').value;
          if((event_state === null) || (event_state === undefined) || (event_state === ""))   // if the event's date was not included
          {
              // print error message on screen
              $("#post-event-message-top").html('<div class="alert alert-warning" id = "messages">'
                                                     + '<p> <strong style = "font-size:15px">State required</strong> </p>'
                                                     + '<p style = "font-size:15px"> You left the State/Country blank. <br> Do say where the event will take place.</p>'
                                                + '</div>');

              $("#post-event-message-bottom").html('<div class="alert alert-warning" id = "messages">'
                                                     + '<p> <strong style = "font-size:15px">State required</strong> </p>'
                                                     + '<p style = "font-size:15px"> You left the State/Country blank. <br> Do say where the event will take place.</p>'
                                                + '</div>');

              return;
          }
 
          

          // deal with the link
          var event_link = document.getElementById('post-event-link').value;


          /*
          if((event_link !== undefined) && (event_link !== null) && (event_link !== ""))
          {
              var test = macco.util.isValidWebLink(event_link);
              console.log(" testing event_link regular expression = " +test);

              if(test === false)
              {
                  // print error message on screen
                  $("#post-event-message-top").html('<div class="alert alert-warning" id = "messages">'
                                                     + '<p> <strong style = "font-size:15px">Improperly formated url</strong> </p>'
                                                     + '<p style = "font-size:15px"> Do make sure that if you include a web link or url that it is properly formated.</p>'
                                                + '</div>');

                  $("#post-event-message-bottom").html('<div class="alert alert-warning" id = "messages">'
                                                     + '<p> <strong style = "font-size:15px">Improperly formated url</strong> </p>'
                                                     + '<p style = "font-size:15px"> Do make sure that if you include a web link or url that it is properly formated.</p>'
                                                + '</div>');

                  return;
              }
          }     */

               

          // organise the tags
          var tags = document.getElementById('post-event-tags').value;

          if((tags !== null) && (tags !== undefined))
          {
              tags = tags.split(",");
              //trim the white spaces form the string
              for(var i = 0; i < tags.length; i++)
                  tags[i] = tags[i].trim();
          }

          var post = {title : event_title,
                      details : document.getElementById('post-event-details').value,
                      sdate : new Date(event_date + " " + event_time),
                      edate : new Date(event_end_date + " " + event_end_time), // sdatestring : moment(startd).format("ddd MMM D, YYYY"), edatestring : moment(endd).format("ddd MMM D, YYYY"),
                      stime : event_time,
                      etime : event_end_time,
                      location : event_location,
                      street : event_street,
                      city : event_city,
                      state : event_state,
                      link : event_link,
                      lat : macco.util.latlong[0],
                      lng : macco.util.latlong[1],
                      tags : tags,
                      image : document.getElementById('post-event-image').value };

          if(event_index === null)   // we want to post a new event
		  {				 
             macco.model.postEvent(post); 
		  }
          else
          {
             var event_id = macco.model.getProfileEvents()[event_index]._id;
             macco.model.editEvent(event_id, post);
             console.log("unstringifued id: " +event_id);
          } 
		  
		  console.log("Image location @@@@@@@@@@@@@@@@@@@ = " +post.image);
    };
	




    postEventResponse = function(message)
    {
        var need_to_login =  '<div class="alert alert-warning" role="alert">'
                                + '<p> <strong style = "font-size:12px">Your login has expired....</strong></p>'
                                + '<p style = "font-size:12px"> please do login again so that you can post an event.'
                                + '</p> </div>';


        var success =  '<div class="alert alert-success" role="alert">< Success ! - Loggin in.'
                            + '<p style = "font-size:15px"> You can now login to your account and use the advance features of MaCCO. <br> Enjoy !</p>'
                        + '</div>';


        if(message.status === 'success')
        {
             //display success message and then go to the user's event list with the new event at the top
             macco.nav.setAnchorMyProfile();
             return;

        }

    };

    saveProfileResponse = function(message)
    {

    };

    createProfileResponse = function(message)
    {
        var profile_already_exists = '<div class="alert alert-warning" id = "messages">'
                                        + '<p> <strong style = "font-size:15px">Profile Name Already Taken</strong> </p>'
                                        + '<p style = "font-size:12px"> The profile name you selected is already taken by someone else. <br> Do try another name.</p>'
                                   + '</div>';

        var error_message = '<div class="alert alert-warning" id = "messages">'
                                        + '<p> <strong style = "font-size:15px">Our apologies</strong> </p>'
                                        + '<p style = "font-size:12px">Our cloud experienced a challenge saving your new profile. <br> Please do try to create the profile again.</p>'
                                   + '</div>';

        if(message.status === 'success')
        {
            console.log("create profile success");

            macco.nav.setAnchorMyProfile();
            return;
        }

        if(message.status === 'name_already_exists')
        {
            $("#messages").html(profile_already_exists);
            return;
        }

        if(message.status === 'error_saving_message')
        {
            $("#messages").html(error_message);
            return;
        }

        $("#messages").html(error_message);

    };    








    getLocationsResponse = function(message)
    {
         if(message === null || message.locations === null)
            return;

         // first sort the locations by state name
         var locations = message.locations.sort(function(a, b)
                                                {
                                                    if(a.state < b.state)
                                                       return -1;
                                                    if(a.state > b.state)
                                                       return 1;
                                                    return 0;
                                                });

         // generate the html that will be displayed.
         var list = '<p><strong style = "font-size:20px">Select the location for your primary view</strong></p>'
	             + '<table class="table table-striped" style = "font-size:12px">'
	                 + '<thead>' 
	                    + '<tr>' 
	                       + '<th>State</th><th>City/Town</th>' 
	                    + '</tr>' 
	                 + '</thead>' 
	                 + '<tbody>';

         for(var i = 0; i < locations.length; i++)
         {
             list = list + '<tr>' 
		            + '<td>' + locations[i].state + '</td>' 
		            + '<td>'
		                + '<a href="javascript:;" id = "' +locations[i].state+ '" value = "' +locations[i].state+ '"> All ' +locations[i].state + '</a>';

             // now sort the cities
             var cities = locations[i].cities.sort(function(a, b)
                                                   {
                                                      if(a.num < b.num)
                                                         return -1;
                                                      if(a.num > b.num)
                                                         return 1;
                                                      return 0;
                                                   });

             for(var j = 0; j < cities.length; j++)
             { 
		  list = list + '<br> <a href="javascript:;" id = "' +cities[j].city+ '' +j+ '" onclick = macco.main.setAnchorLocation(' +cities[j]+ ')>' +cities[j].city+ '</a>';
             }
             
             list = list + '</td></tr>';
         }

         list = list + '</tbody></table>';

         if(locations.length <= 0)
            return;

         
         stateMap.$container.html(String() + list);

         return;    

    };

	
	// PUBLIC METHODS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // This is where Publicly available methods are defined.
    //
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// Name: configModule
	// Agruments : A map of settable keys and values
	//             * color_name - color to use
	// Settings :
	//             * configMap.settable_map declares allowed keys
	// Returns : true
	// Throws : none
	//
	// This is used to adjust the configuration of allowed keys
	//configModule = function(input_map)
	//{
	    //macco.util.setConfigMap( {input_map : input_map,
		                          //settable_map : configMap.settable_map,
								  //config_map : configMap});
		
		//return true;
	//};
    
    // Name: initModule
    // Arguments : $Container
    // Returns : none
    // This method is used to initialise the module
    initModule = function($container)
    {
        
	L.mapbox.accessToken = 'pk.eyJ1IjoiamFjaGlhbiIsImEiOiJJMGRHVDAwIn0.ZlSs8k77M_idkyNqnOA4DA';  // set access token for map
	
	// $container.html(String());

        stateMap.$container = $container;
        setJqueryMap();

        // macco.model.getEventsByProfile(); // get the evetns for the current prrofile
	
        // macco.model.getEvents(null, "Trinidad & Tobago", null, null);
        
        //macco.nav.setAnchorMyProfile();
        //macco.nav.setAnchorEvents();
        //macco.nav.setAnchorMyProfile();
        //macco.nav.setAnchorEvents();


        //macco.model.getEventsMyLocation(true);
        //macco.nav.setAnchorAbout();

        // macco.nav.setAnchorEvents();



        // macco.model.changeProfile(macco.model.getUserIndex());   //this is a hack to get the events list leaded 

        // macco.nav.setAnchorEvents();  // immediately go to the events page.
		 
	// stateMap.$container = $container;
        // setJqueryMap();
        // macco.model.getEventsByAccount(); // try to update Cache of events created by this profile
		
		

			
	console.log("macco.main initialised.....");
    }


       // end PUBLIC methods /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	return { //configModule : configModule,
	         initModule : initModule, 
	         getLocation : getLocation,
	         profilePage : profilePage,
                 profilePageOther : profilePageOther,
                 editProfilePage : editProfilePage,
	         loginPage : loginPage,
	         signUpPage : signUpPage,
	         aboutPage : aboutPage,
	         signupSuccessPage : signupSuccessPage, 
	         forgotPasswordPage : forgotPasswordPage,
                 createEventPage : createEventPage,
                 postEventForm : postEventForm,
                 editEventForm : editEventForm,
                 deleteEvent : deleteEvent,
                 deleteEventForm : deleteEventForm,
                 deleteEventFormNo : deleteEventFormNo,
                 deleteEventResponse : deleteEventResponse,
                 listTags : listTags,
				 profileEventsFilter : profileEventsFilter,
				 profileEventsFilterOther : profileEventsFilterOther,
				 profileEventsFilterSearch : profileEventsFilterSearch,
                 settingsPage : settingsPage,
                 createProfilePage : createProfilePage,
	         validateEmail : validateEmail,
	         login : login,
			 login_facebook,
			 login_auth0,
                 forgotPassword : forgotPassword,
	         signUp : signUp,
                 postEvent : postEvent,
                 postEventResponse : postEventResponse,
                 getEventsResponse : getEventsResponse,
                 signupResponse : signupResponse,
                 loginResponse : loginResponse,
                 codeResponse : codeResponse,
                 forgotPasswordResponse : forgotPasswordResponse,
                 getLocationsResponse : getLocationsResponse,
                 saveProfileResponse : saveProfileResponse,
                 updateProfileResponse : updateProfileResponse,
				 saveNewPassword : saveNewPassword,
				 changePasswordResponse : changePasswordResponse,
                 saveAsNewForm : saveAsNewForm,
                 saveProfileChangesForm : saveProfileChangesForm,
                 newProfileCancel : newProfileCancel,
                 newProfile : newProfile,
				 newProfileModalYes : newProfileModalYes,
                 newProfileResponse : newProfileResponse,
				 savePasswordModalYes : savePasswordModalYes,
                 savePasswordModalNo : savePasswordModalNo,
                 deleteProfileYes : deleteProfileYes,
				 deleteProfileNo : deleteProfileNo,
		 listEventsOn : listEventsOn,
                 listTagsOnBoard : listTagsOnBoard,
	         setAnchorProfile : setAnchorProfile,
	         setAnchorWhen : setAnchorWhen,
	         setAnchorWhere : setAnchorWhere,
                 setAnchorLocation : setAnchorLocation,
                 setAnchorCreateProfile : setAnchorCreateProfile,
                 setAnchorPostEvent : setAnchorPostEvent,
                 setAnchorEditEvent : setAnchorEditEvent,
                 setAnchorViewEvent : setAnchorViewEvent,
				 setAnchorSearchEvents : setAnchorSearchEvents,
				 setAnchorTopSearch : setAnchorTopSearch,
                 setAnchorProfileOther : setAnchorProfileOther,
				 setAnchorProfileNoname : setAnchorProfileNoname,
                 setLocation : setLocation,
                 saveProfile : saveProfile,
				 shareModalOpen : shareModalOpen,
				 shareEventResponse : shareEventResponse,
				 changeBoardHeader : changeBoardHeader,
	         generateMap : generateMap,
                 verify : verify,
                 getVerificationCode : getVerificationCode,
                 getVerificationCodeResponse : getVerificationCodeResponse,
                 latlong : latlong,
                 changeProfile : changeProfile,
				 saveChangesModalYes,
                 deleteProfile : deleteProfile,
                 deleteProfileResponse : deleteProfileResponse,
                 updateEventsBoard : updateEventsBoard,
                 displayEvent : displayEvent,
				 shareEventEmail : shareEventEmail,
				 global_search_list : global_search_list
	       };  //export public methods explicitly by returning them in a map.
	
}());
