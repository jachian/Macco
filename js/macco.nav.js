/*
 * macco.nav.js
 * Navigation bar feature module for Macco
 */
 
/*jslint               browser : true,      continue : true,
  devel : true,        indent : 2,          maxerr : 50,
  newcap : true,       nomen : true,        plusplus : true,
  regexp : true,       sloppy : true,       vars : false,
  white : true
*/

/*global $, macco */
macco.nav = (function()
{
    // Module Scope Variables --- variables that are available across the macco.nav namespace ///////////////////////////////////////
	
	// Module Variables//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var constant = '<div class="container">'
                       + '<!-- Brand and toggle get grouped for better mobile display -->'
                       + '<div class="navbar-header">'
				           + '<div class="container-date col-md-4 pull-left">'
					          + '<img src="images/icon-calendare.png" alt="icon-calendar"/>'
					          + '<h4 id="nav-date">April 18, 2015</h4>'
				           + '</div>'
				           + '<div class="pull-right" id="nav_var">'
					           + '<ul class="menu-top">'
						          + '<li>'
							        + '<a href="/events" id="nav-home">Home</a>'
						          + '</li>'
						          + '<li>'
							        + '<a href="#" id="nav-abouta">About</a>'
						          + '</li>'
						          + '<li>'
							        + '<a href="/events/register.html" id="nav-signup">Sign up</a>'
						          + '</li>'
						          + '<li>'
							        + '<a href="/events/login.html" id="nav-login">Login</a>'
						          + '</li>'
					           + '</ul>'
				           + '</div>'
                        + '</div>'
                        + '<!-- Collect the nav links, forms, and other content for toggling -->'
                        + '<!-- /.navbar-collapse -->'
                    + '</div>';
		
	var configMap = { main_html : String(),
					  settable_map : {}
					};   // static configuration values go in here.
					
	var stateMap = { $container : null }; // Used for dynamic information shared across the module in here
	
	var jqueryMap = {};  //used to Cache jQuery collections in jqueryMap
	
	// Module Functions//////////////////////////////////////////////////////////////////////////////////////////////////
        var loggedOut;    // used to generate the navbar options for a logged out user
        var loggedIn;     // used to generate the navbar options for a logged In user

	var setJqueryMap;   // setting the jQuery map
		



        // anchor changes for state changes ////////////////////////////////////////////////////////
        var setAnchorLogin;
        var setAnchorSignUp;
        var setAnchorLocation;
	var setAnchorAbout;
        var setAnchorLogout;
        var setAnchorMyProfile;
        var setAnchorSettings;

	// Dom methods  ///////////////////////////////////////////////////////////////////////////////////////
	var displayLoggedInPage;
        var displayLoggedOutPage;
  	
	

	
	var initModule;
	// End module Scope Variables ---//////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
	
	
	// UTILITY METHODS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//  Name : loggedOut
	//  Arguments : none
	//  Returns: (String) - Markup for the logged out profile
	//
	//  Description: This function is used to generate the nav bar content for a user that is not logged in
	//
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    loggedOut = function()
    {
        return '<div class="container" id = "nav-container">'
                   + '<!-- Brand and toggle get grouped for better mobile display -->'
                   + '<div class="navbar-header">'				   
                       + '<div class="container-date col-md-4 pull-left">'   //
					        + '<a href="http://159.203.106.44:3000/">'
                                + '<img src="images/x-Logo-black-frontpage.png" alt="icon-calendar"/>'
                                + '<h4 id = "nav-date"> | </h4>'							
					            + '<img src="images/Logo-xivents-black-frontpage.png" alt="icon-calendar"/>'
							+ '</a>'
                            // + '<h4 id = "nav-date">XiVents</h4>'
                       + '</div>'
                       + '<div class="pull-right" id="nav-options">'
                            + '<ul class="menu-top">'
                                 //+ // '<li>'
                                     // + '<a href="javascript:;" id="nav-about" onclick = macco.nav.setAnchorAbout()>About</a>'
                                 //+ // '</li>'
                                 + '<li>'
                                     + '<a href="javascript:;" id="nav-events" onclick = macco.nav.setAnchorEvents()>Events</a>'
                                 + '</li>'
                                 + '<li>'
                                     + '<a href="javascript:;" id="nav-signup"onclick = macco.nav.setAnchorSignUp()>Sign up</a>'
                                 + '</li>'
                                 + '<li>'
                                     + '<a href="javascript:;" id="nav-login" onclick = macco.nav.setAnchorLogin()>Login</a>'
                                 + '</li>'
                            + '</ul>'
                       + '</div>'
                   + '</div>'
                   + '<!-- Collect the nav links, forms, and other content for toggling -->' 
                   + '<!-- /.navbar-collapse -->'
                + '</div>';

    };

	
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    //  Name : loggedIn
    //  Arguments : none
    //  Returns: (String) - Markup for the logged In profile
    //
    //  Description: This function is used to generate the nav bar content for a user that is logged in
    //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    loggedIn = function()
    {
        return '<div class="container" id = "nav-container">'
                   + '<!-- Brand and toggle get grouped for better mobile display -->'
                   + '<div class="navbar-header">'
                       + '<div class="container-date col-md-4 pull-left">'   //
					   		+ '<a href="http://159.203.106.44:3000/">'
                                + '<img src="images/x-Logo-black-frontpage.png" alt="icon-calendar"/>'	
                                + '<h4 id = "nav-date"> | </h4>'							
					            + '<img src="images/Logo-xivents-black-frontpage.png" alt="icon-calendar"/>'
						    + '</a>'
                            // + '<h4 id = "nav-date">XiVents</h4>'
                       + '</div>'
                       + '<div class="pull-right" id="nav-options">'
                            + '<ul class="menu-top">'
                                 // + '<li>'
                                    //  + '<a href="javascript:;" id="nav-about" onclick = macco.nav.setAnchorAbout()>About</a>'
                                 // + '</li>'
                                 + '<li>'
                                     + '<a href="javascript:;" id="nav-event-stream" onclick = macco.nav.setAnchorEvents()>Events</a>'
                                 + '</li>'
                                 + '<li>'
                                     + '<a href="javascript:;" id="nav-profile" onclick = macco.nav.setAnchorMyProfile()><span class="glyphicon glyphicon-user"></span></a>'
                                 + '</li>'
                                 + '<li>'
                                     + '<a href="javascript:;" id="nav-settings"  onclick = macco.nav.setAnchorSettings()><span class="glyphicon glyphicon-cog"></span></a>'
                                 + '</li>'
                                 + '<li>'
                                     + '<a href="javascript:;" id="nav-logout"  onclick = macco.model.logout()>Logout</a>'
                                 + '</li>'
                            + '</ul>'
                       + '</div>'
                   + '</div>'
                   + '<!-- Collect the nav links, forms, and other content for toggling -->'
                   + '<!-- /.navbar-collapse -->'
                + '</div>';
                               
    };



    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// Name: displayLoggedInPage
	// Arguments: None
	// Returns: Nothing
	//
	// Description : This function is used to change the options on the navigation bar. The options are different depending up whether you are logged in
	//               or no. In this case it is used to set the options for users that are logged in
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	displayLoggedInPage = function()
	{
            stateMap.$container.html( String() + loggedIn());
            
        };
	
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// Name: displayLoggedOutPage
	// Arguments: None
	// Returns: Nothing
	//
	// Description : This function is used to change the options on the navigation bar. The options are different depending up whether you are logged in
	//               or no. In this case it is used to set the options for users that are logged in
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        displayLoggedOutPage = function()
        {
            stateMap.$container.html( String() + loggedOut());
        };
		   
	
	// End UTILITY METHODS  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
	// DOM METHODS /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// These methods/functions that create and manipulate page elements, the DOM
	//
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// Name : setJqueryMap
	// Arguments : none
	// Returns : none
	//
    // This is used to Cache jQuery collections - this should be in every shell and feature module we produce. this is used to reduce the
    // number of jQuery document traversals and improve performance
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
	setJqueryMap = function()
	{
	    var $container = stateMap.$container;
		
		jqueryMap = { $container : $container,
		              $logo : $('#nav-logo'),            // the logo
	                  $date : $('#nav-date'),			 // the date (document.getElementById('time').innerHTML,)		  
                      $options : $('#nav-options'),
		              $home : $('#nav-home'),       // the link to the home page
                      $events : $('#nav-events'),
		              $about : $('#nav-about'),     // link to the about page
			          $login : $('#nav-login'),     // link to the about page 
			          $event_stream: $('#nav-event-stream'),    // link to the event stream page
                      $event_map: $('#nav-event-map'),    // link to the map page page
                      $profile: $('#nav-profile'),    // link to the profile page
                      $settings: $('#nav-settings'),    // link to the settings page
                      $logout: $('#nav-logout'),    // link to the sign up page
                    }; // check on this....
	};
	
	// END DOM METHODS /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// EVENT HANDLERS ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
	// URI Anchor changers //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// Name: setAnchorLogin
	// Arguments : None
	// Returns: Nothing
	//
	// Description: Used to change the uri anchor when the user click on the 'Login' link on the nav-bar.
	//              used to tell the shell that we need to load the login page.
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    setAnchorLogin = function()
    {
         macco.counter.stopTimer();
	     $.uriAnchor.setAnchor({log : 'login'}, null, true); // log = 1 means we want to go to the login page

         history.pushState(null, null, '/macco.html#!log=login');
		 
		 // macco.shell.current_url = '/macco.html#!log=login';
    };	
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// Name: setAnchorSignUp
	// Arguments : None
	// Returns: Nothing
	//
	// Description: Used to change the uri anchor when the user click on the 'Sign up' link on the nav-bar.
	//              used to tell the shell that we need to load the singup page.
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    setAnchorSignUp = function()
    {
        macco.counter.stopTimer();
        // history.pushState(null, null, '/macco.html#!log=signup');

	    $.uriAnchor.setAnchor({log : 'signup'}, null, true);

        history.pushState(null, null, '/macco.html#!log=signup');
		
		// macco.shell.current_url = '/macco.html#!log=signup';
    };

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// Name: setAnchorAbout
	// Arguments : None
	// Returns: Nothing
	//
	// Description: Used to change the uri anchor when the user clicks on the 'About' link on the nav-bar.
	//              used to tell the shell that we need to load the About page.
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    setAnchorAbout = function()
    {
        macco.counter.stopTimer();
        // return history.pushState(null, null, '/macco.html#!log=about');

	    $.uriAnchor.setAnchor({log : 'about'}, null, true);

        history.pushState(null, null, '/macco.html#!log=about');

        // macco.shell.current_url = '/macco.html#!log=about';	
			
    };

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// Name: setAnchorLocation
	// Arguments : None
	// Returns: Nothing
	//
	// Description: Used to change the uri anchor when the user clicks on the 'Location' link on the nav-bar.
	//              used to tell the shell that we need to load the login page.
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    setAnchorLocation = function()
    {
            macco.counter.stopTimer();
            return $.uriAnchor.setAnchor({log : 6, // 6 meams select location page
                                          pro : -21}, null, true);
    };	

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// Name: setAnchorMyProfile
	// Arguments : None
	// Returns: Nothing
	//
	// Description: Used to change the uri anchor when the user click on the 'My Profile' link on the nav-bar.
	//              used to tell the shell that we need to load the Profile page.
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    setAnchorMyProfile = function()
    {
            macco.counter.stopTimer();
            $.uriAnchor.setAnchor({log : 'profile'}, null, true); // 8 means set my profile page.

            history.pushState(null, null, '/macco.html#!log=profile');
			
			//macco.shell.current_url = '/macco.html#!log=profile';
    };

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// Name: setAnchorSettings
	// Arguments : None
	// Returns: Nothing
	//
	// Description: Used to change the uri anchor when the user clicks on the 'Settings' link on the nav-bar.
	//              used to tell the shell that we need to load the login page.
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    setAnchorSettings = function()
    {
        macco.counter.stopTimer();
        $.uriAnchor.setAnchor({log : 'settings'}, null, true);

        history.pushState(null, null, '/macco.html#!log=settings');
			
		//macco.shell.current_url =  '/macco.html#!log=settings';
    };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Name: setAnchorEvents
        // Arguments : Gobal - takes an int (1=== we want all upcoming events on the platform) (2=== we want only events near to my current location)
        // Returns: Nothing
        //
        // Description: Used to change the uri anchor when the user clicks on the 'Events' or 'Events Stream' link on the nav-bar.
        //              used to tell the shell that we need to load the login page.
        //
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    setAnchorEvents = function(global)
    {
		// $("#loading-icon").html('<center><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></center>');   // loading icon
		// macco.main.changeBoardHeader('<center><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></center>');
		macco.counter.stopTimer();
		
		if(parseInt(global) === 1)
		{
           $.uriAnchor.setAnchor({log : 'events', range : 'All'}, null, true);   // becuase this is one twice that is why I click twice to go back. resolve this
           history.pushState(null, null, '/macco.html#!log=events&range=All');
		}
		else
		{
           $.uriAnchor.setAnchor({log : 'events', range : 'Near_Me'}, null, true);
           history.pushState(null, null, '/macco.html#!log=events&range=Near_Me');			
		}			
	    /// macco.shell.current_url = '/macco.html#!log=events';
    };



    // end Event Handlers ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Name: initModule
    // Arguments : $container - the jQuery reference to the html code that this module controls
    // Returns : none
    //
    // This method is used to initialise this module
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    initModule = function($container)
    {
        // var current_user = macco.model.getCurrentUser();    // get current user information
		
        // $container.html( String() + constant);

        if(localStorage && localStorage.getItem("maccoToken")) // if a user is logged in
        {
            $container.html( String() + loggedIn());

        }
        else                                               // if a user is not logged in
        {
            $container.html( String() + loggedOut());
        }

        stateMap.$container = $container;
        setJqueryMap();
			
	    
        console.log("macco.nav initialised.....");
     
    };

    // end PUBLIC methods /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	return { //configModule : configModule,
	         initModule : initModule,
	         displayLoggedInPage : displayLoggedInPage,
                 displayLoggedOutPage : displayLoggedOutPage,
                 setJqueryMap : setJqueryMap,
	         setAnchorLogin : setAnchorLogin,
	         setAnchorSignUp : setAnchorSignUp,
	         setAnchorAbout : setAnchorAbout,
                 setAnchorLocation : setAnchorLocation,
                 setAnchorMyProfile : setAnchorMyProfile,
                 setAnchorSettings : setAnchorSettings,
                 setAnchorEvents : setAnchorEvents	 
	       };  //export public methods explicitly by returning them in a map.
}());
