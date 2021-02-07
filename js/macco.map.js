/*
 * macco.news.js
 * Main content panel for macco
 */
 
/*jslint               browser : true,      continue : true,
  devel : true,        indent : 2,          maxerr : 50,
  newcap : true,       nomen : true,        plusplus : true,
  regexp : true,       sloppy : true,       vars : false,
  white : true
*/

/*global $, macco */

macco.map = (function ()
{ 
    var configMap = { main_html : String(),
					  settable_map : {}
					};   // static configuration values go in here.
					
	var stateMap = { $container : null     // Used for dynamic information shared across the module in here
	               }; 
	
	var jqueryMap = {};  //used to Cache jQuery collections in jqueryMap

        var displayButton;  // used to display the create event button
        var undisplayButton; // used to undisplay the create event button
	

        // uri anchor functions
        var setAnchorPostEvent;
	
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
	
	    // PUBLIC METHODS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // This is where Publicly available methods are defined.
    //
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // This function is used display the Create event button at the top left of the webpage
        //
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        displayButton = function()
        {
            jqueryMap.$container.html('<button type="button" class="btn btn-primary" style = "font-size:12px" id = "create" onclick = macco.map.setAnchorPostEvent()><span class="glyphicon glyphicon-plus"></span> Post Event</button>');
             
        };

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // This function is used display the Create event button at the top left of the webpage
        //
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        unDisplayButton = function()
        {
            jqueryMap.$container.html('');

        };


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Functions for setting uri-anchors
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    setAnchorPostEvent = function()
    {
         return $.uriAnchor.setAnchor({log : 5,
                                       pro : -4456}, null, true);
    };

				  
	
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
        stateMap.$container = $container;

        if(localStorage && localStorage.getItem("maccoToken")) // if a user is logged in
        {
            $container.html(String() + '<button type="button" class="btn btn-primary" style = "font-size:12px" id = "post_event" onclick = macco.map.setAnchorPostEvent()><span class="glyphicon glyphicon-plus"></span> Post Event</button>');
        }
        else                                               // if a user is not logged in
            $container.html(String() + '');


        setJqueryMap();
			
		console.log("macco.map initialised.....");
	};


    // end PUBLIC methods /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	return { //configModule : configModule,
	         initModule : initModule,
                 displayButton : displayButton,
                 unDisplayButton : unDisplayButton,
                 setAnchorPostEvent : setAnchorPostEvent 
	       };  //export public methods explicitly by returning them in a map.
   
   
}());
