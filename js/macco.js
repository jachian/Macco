/*
 * macco.js
 * Root namespace module
 */
 
/*jslint               browser : true,      continue : true,
  devel : true,        indent : 2,          maxerr : 50,
  newcap : true,       nomen : true,        plusplus : true,
  regexp : true,       sloppy : true,       vars : false,
  white : true
*/

/*global $, macco */
var macco = (function () 
{
    'use strict';

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Name: initModule
    // Arguments : jquery reference to the core html container
    // return type : None
    //
    // Used to intialise this module and sets up the Model and the shell
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
    var initModule = function ( $container ) 
    {
	// macco.model.initModule();    // initialise the model
        macco.util.initModule();     // initialise the the util module
        macco.counter.initModule();  // initialise the counter module
        macco.model.initModule();




	macco.shell.initModule($container);    // initialise the shell - this module initialises all modules that display content to the browser and that control content on screen
        // macco.model.initModule();
		       
	console.log("macco.js initialised.........");

        //macco.model.getEventsMyLocation(true);
        // macco.nav.setAnchorEvents();

        // macco.model.router(); // start the router

        //window.onkeypress = window.onkeyup = window.onkeydown = function( event ) 
        //{
           //event.preventDefault();
           // or, in this case: 
           //return false;
        //};
    };
	
    return { initModule: initModule };


}());
