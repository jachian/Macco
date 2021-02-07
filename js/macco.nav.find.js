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
	var configMap = { main_html : String()
			          + '<nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">'
                      + '</nav>',
					  settable_map : {}
					};   // static configuration values go in here.
					
	var stateMap = { $container : null }; // Used for dynamic information shared across the module in here
	
	var jqueryMap = {};  //used to Cache jQuery collections in jqueryMap
	
	// module scope variables in this section  //////////////////////////////////////////////////////////////////////////////////////////////////
	var setJqueryMap;
    // var	configModule;
	var initModule;
	// End module Scope Variables ---//////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
	// UTILITY METHODS /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// End UTILITY METHODS  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
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
		
		jqueryMap = { $container : $container,
				      $header : $container.find('navbar navbar-inverse navbar-fixed-top')}; // check on this....
	};
	
	// END DOM METHODS /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// EVENT HANDLERS ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    
    // Name: initModule
    // Arguments : $Container
    // Returns : none
    // This method is used to initialise the module
    initModule = function($container)
    {
        $container.html(configMap.main_html);
		stateMap.$container = $container;
        setJqueryMap();
		
		return true;
    };

    // end PUBLIC methods /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	return { //configModule : configModule,
	         initModule : initModule 
		   };  //export public methods explicitly by returning them in a map.
}());