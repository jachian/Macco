/*
 * macco.shell.js
 * The shell module. This is used to control all the shell components
 *
 * The Shell is responsible for the following:
 * 1) Rendering and managing the feature containers
 * 2) Managing the application state
 * 3) Coordinating feature modules
 *
 */
 
/*jslint               browser : true,      continue : true,
  devel : true,        indent : 2,          maxerr : 50,
  newcap : true,       nomen : true,        plusplus : true,
  regexp : true,       sloppy : true,       vars : false,
  white : true
*/

/*global $, macco */

macco.shell = (function()
{
    // Module Scope Variables --- variables that are available across the macco.shell namespace ///////////////////////////////////////
	var configMap = { main_html : String()
	                  + '<nav class="navbar navbar-inverse navbar-top" role="navigation" id ="macco-navigation"> </nav>'
			  + '<div id ="macco-main"> </div>'
			};   // static configuration values go in here. The first is the top navbar the second is the body of the site
					
	var stateMap = { $container : null
					 }; // Used for dynamic information shared across the module in here
	
	var jqueryMap = {};  //used to Cache jQuery collections in jqueryMap
	
	// module scope variables in this section  //////////////////////////////////////////////////////////////////////////////////////////////////
	var copyAnchorMap;
	var changeAnchorPart;
	var onHashchange;
	
	// logins & logouts These functions are uses to login and logout of the platform
	var login;
	var logout;
	
	// these variables are used to maintain the login state.
	var currentUser = null;   // if this is null it means that no-one is logged in. if not null then someone is logged in
    var profiles = null;     // this is an array of profiles that the current user has. null means that no-one is logged in
    var currentp = 0;        // is is used to store the profile index of the current profile, or the last profile tat the user is using
               // this is the email address of the current user logged-in.
			   
	// this is used to keep track the current url that the user is on.
	var current_url = '';
	
	
	//getters
	var getCurrentUser;
	
	
	var setJqueryMap;  
	var initModule;
	// End module Scope Variables ---//////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
	login = function(email, password)
	{
	    var find = macco.model.login(email, password);
		
		if(find === null)
		{
		    currentUser = null;
			return false;
	    }
		
		currentUser = find;
		
		// next we update the local storage (analogous to cookies) // we will need to re-implement this because this is not secure for production use	   
		return true;
	};
	
	logout = function()
	{
	   currentUser = null; //destroy current user
	   
	   macco.model.logout();
	};
	   	   		
		
		
        getCurrentUser = function()
        {
            return currentUser;
        };		
	
	
	// UTILITY METHODS /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// End UTILITY METHODS  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// this function returns a copy of stored anchor map; minimizes overhead
 
	
	
	// DOM METHODS /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// These methods/functions that create and manipulate page elements, the DOM
	//
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// Name : setJqueryMap     
	// Agruments : none
	// Returns : none
    // This is used to Cache jQuery collections - this should be in every shell and feature module we produce. this is used to reduce the
    // number of jQuery document traversals and improve performance	
	setJqueryMap = function()
	{
	    var $container = stateMap.$container;
		
		jqueryMap = { $container : $container,
		              $nav : $('#macco-navigation'),                   // $container.find('.navbar navbar-inverse navbar-top'),
			      $main : $('#macco-main'),                        // container.find('.container ')
			    };
	};
	
	// END DOM METHODS /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Things that change and manipulate the DOm go here
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	clickNews = function()
	{
	   jqueryMap.$nav.hide();
	};
	
	// EVENT HANDLERS ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	//onClickNews = function(event)
	//{
        //jqueryMap.$nav.click(clickNews)	  
	//};
	
	onHashChange = function(event)
	{
	    var anchor = $.uriAnchor.makeAnchorMap();
		
		if(anchor === null)
		{
		    console.log("anchor returned null");
			return;
		}
		if(anchor.log === 'login')  // if the login page was asked for
		{
		    macco.main.loginPage("");
			
			return;
		}
		if(anchor.log === 'signup')  // if the sign up page was sought was log
		{
			macco.main.signUpPage();

			return;
		}
		if(anchor.log === 'about')  // if the about page page was asked for
		{
		    macco.main.aboutPage();
			
			return;
		}
		if(parseInt(anchor.log) === 4)  // if an actual user is logged in    // leave this as is
		{
		    // macco.main.aboutPage();
	            macco.nav.displayLoggedInPage();     // change navigation pannel
                    macco.nav.setAnchorEvents();                        
                        // macco.model.getEvents(null, 'Trinidad & Tobago', null, null); //list the events of the user's location - this will need to be updated as we develop
			return;
		}
                if(parseInt(anchor.log) === 5) // if the post event page is requested
                {
                    macco.main.postEventForm();
                    return;
                }
                if(parseInt(anchor.log) === 6) // if the location link is clicked
                {
                    macco.model.getLocations();
                    return;
                }
                if(parseInt(anchor.log) === 7)  // if someone tried to change the location of events
                {
                    console.log("the shell has got setLocation request");
                    macco.nav.setLocation(anchor.loc);
                    return;
                }
                if(anchor.log === 'profile')
                {
                    console.log("The profile page has been requested");
                    // call the macco.main function that displays the profile page
                    macco.main.profilePage();
                    return;

                }
                if(anchor.log === 'settings')           // if the Settings page was requested.
                {
                    console.log("The settings page has been requested");
                    // call the macco.main function that displays the profile page
                    macco.main.settingsPage();
                    return;

                }
                if(parseInt(anchor.log) === 10)
                {
                  
                    macco.main.createProfilePage();
                    return;

                }

                if(anchor.log === 'events')   // we want to display the events page
                {				
                   $("#board-header").html('<center><p style = "font-size:15px"><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></p></center>'); 
				   macco.model.getEventsMyLocation(true, anchor.range);
					
                    return;
                }

                if(anchor.log === 'event')   // we want to display the events page
                {
                    // macco.model.getEvents(null, "Trinidad & Tobago", null, null);
					$("#board-header").html('<center><p style = "font-size:15px"><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></p></center>'); 
                    macco.main.displayEvent(anchor.id);
                    return;
                }

                if(anchor.log === 'event-search')   // we want to run a search for events
                {
					$("#board-header").html('<center><p style = "font-size:15px"><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></p></center>'); 
					console.log([anchor.query]);  // "type of anchor.query = " +typeof([anchor.query]));
					
                    macco.model.searchEvents([anchor.query]);
                    return;
                }	

                if(anchor.log === 'search')   // we want to run a search for events
                {
					$("#board-header").html('<center><p style = "font-size:15px"><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></p></center>'); 
					console.log("type of anchor.query = " +typeof(anchor.query));					
                    macco.model.searchEvents(macco.main.global_search_list);
                    return;
                }				

                if(anchor.log === 'post')
                {
	                $("#post-event-message-top").html('<center><p style = "font-size:15px"><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></p></center>');
		            $("#post-event-message-bottom").html('<center><p style = "font-size:15px"><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></p></center>');			
					
                    macco.main.postEventForm(parseInt(anchor.id));
                    return;
                }

                if(anchor.log === 'edit')   // we want to display the edit event form
                {
                    macco.main.editEventForm(parseInt(anchor.id));     // load the edit event form to the right index
                    return;
                }			

                if(anchor.log === 'profile-o')
                {
                    var id = anchor.id;
					
					console.log("id =========== " + id.localeCompare("Noname"));

                    macco.model.getProfileOther(id);     // try to get the other id
					console.log("set anchor other INDEX shell << anchor = " +anchor.id);
                    return;
                }
				
                if(anchor.log === 'noname')   // we want to display the edit event form
                {
                    console.log("set anchor other INDEX shell << 0ffffffffff");
					
                    var pro = {image : "images/profile_pic.gif", name : "Noname", handle : "noname", address : "737 Nowhere Street, Nowhere City, Earth",
                               website : "xivents.co", email : "info@xivent.co", phone : "+1 868 788 5499", 
						       about : "This is the generaic profile used for anonyously posting events. All anonyously posted events are represented by this profile regardless of who posts them and where they are posted from."};						
                    
					// do something and then return
                    macco.main.profilePageOther(pro, null);
                        
				    return;
                }					
	    		
	};
	    

    // end Event Handlers ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    // PUBLIC METHODS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // This is where Publicly available methods are defined.
    //
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    // Name: initModule
    // Arguments : $Container
    // Returns : none
    // This method is used to initialise the module
    initModule = function($container)
    {
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setJqueryMap();
		
        macco.nav.initModule(jqueryMap.$nav); //content for nav
        macco.main.initModule(jqueryMap.$main);   // content for main

        // macco.model.getMyProfilesList(); // get the model to fill in the list of profiles for this user
		
       $(window).bind('hashchange', onHashChange);
		
       // bind event handlers	
       console.log("shell initialised....");		
    };

    // end PUBLIC methods /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	return { initModule : initModule,
             getCurrentUser : getCurrentUser,
             currentUser : currentUser,
             profiles : profiles,
             currentp : currentp,
		     current_url : current_url,
		     login : login };  //export public methods explicitly by returning them in a map.
}());	

//
//defining standard anchor
//
// log : (0 if public user who is not logged in, 1 if logged in) 
// pro : ('pub' for the public page, else it takes the name of the profile that user is viewing such as 'NAPA', 'MaCCO', 'login', 'signin', signout', 'location' etc)
// wt : ("" (empty string if not applicable), else will contain the name of the event).
// wn : ( "" (empty string if not applicable), else will contain the date of the events listed eg July 7, 2014)
// wr : ( "" (empty string if not applicable), else will contain and address))
// lt : ("" (empty string if not applicable), else contains a number))
// lg : ("" (empty string if not applicable), else contains a number))
//
//
					


