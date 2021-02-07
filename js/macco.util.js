/*
* macco.util.js
* General JavaScript utilities
*
* Michael S. Mikowski - mmikowski at gmail dot com
* These are routines I have created, compiled, and updated
* since 1998, with inspiration from around the web.
*
* MIT License
*
*/

/*jslint browser : true, continue : true,
devel : true, indent : 2, maxerr : 50,
newcap : true, nomen : true, plusplus : true,
regexp : true, sloppy : true, vars : false,
white : true
*/
/*global $, macco */

macco.util = (function()
{
     // util variables

     var imageCloud = null;
     var uploadcare_public_key = "93cf6e6db066ca916dfa";
     
     var map;
     var marker;

     // var myLayer;
     // var geojson;
     // var features = [];
     var latlong = [0,0];
	 
     
     // function declarations
     var initModule;
     var initiateMap;
     var locationMap;
     var initiateImageCloud;

     // validators for regular expressions
     var isValidWebLink;    




     // function definitions ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
     initiateMap = function(lat, lng)
     {
         // default [10.444253, -61.269378]
         L.mapbox.accessToken = 'pk.eyJ1IjoiamFjaGlhbiIsImEiOiJLdjFWYWdnIn0.MjzhVA7pywnhGzLE4s_d0Q';
         map = L.mapbox.map('pin', 'jachian.n1nmcdil').setView([lat, lng], 12);


         marker = L.marker([lat, lng], { icon: L.mapbox.marker.icon({'marker-color': '#f86767'}), draggable : true });

         marker.bindPopup('This marker is draggable! Pin the location of your event.');
         marker.addTo(map);

         // update public latlong
         latlong[0] = lat;
         latlong[1] = lng;

         //my code
       
         marker.on('dragend', function(e)
                              {
                                 console.log(e.target._latlng);
                                 latlong[0] = e.target._latlng.lat;
                                 latlong[1] = e.target._latlng.lng;
                              });
         
     };



     // function definitions ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
     locationMap = function(lat, lng, message)
     {
         // default [10.444253, -61.269378]
         L.mapbox.accessToken = 'pk.eyJ1IjoiamFjaGlhbiIsImEiOiJLdjFWYWdnIn0.MjzhVA7pywnhGzLE4s_d0Q';
         map = L.mapbox.map('pin', 'jachian.n1nmcdil').setView([lat, lng], 15);   // it was 16 before   


         marker = L.marker([lat, lng], { icon: L.mapbox.marker.icon({'marker-color': '#f86767'}), draggable : false });

         marker.bindPopup(message);
         marker.addTo(map);

         // update public latlong
         latlong[0] = lat;
         latlong[1] = lng;

         //my code

         //marker.on('dragend', function(e)
            //                  {
              //                   console.log(e.target._latlng);
                //                 latlong[0] = e.target._latlng.lat;
                  //               latlong[1] = e.target._latlng.lng;
                    //          });

     };



     ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
     //
     // Name: initiateImageCloud
     //
     // Arguments: None
     //
     // Return Type : None
     //
     // This function is used to initiate the cloudera cloud for storing and retieving images for the application
     //
     //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
     initiateImageCloud = function()
     {
         // imageCloud =  $.cloudinary.config({cloud_name : 'du6qtyth5', api_key : '115869926127335'});
         imageCloud = $('#upload-form').transloadit({ wait: true,
                                                      params: { auth: { key: "9884cfc03f8111e5b4786575fced7f47" },
                                                                steps: { resize_to_75: { robot: "/image/resize",
                                                                                         use: ":original",
                                                                                         width: 472,
                                                                                         height: 286
                                                                                       }
                                                                       }
                                                              }
                                                    });
     };



var isValidWebLink = function(link)
{
    var regEx =/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;


    if(regEx.test(link))
       return true;

    return false;

};

     

     initModule = function()
     {
		 
         console.log("Macco.util.js is now initialised  .... ");
		 																		   
         
     };
     

    return {map : map,
            uploadcare_public_key : uploadcare_public_key,
            imageCloud : imageCloud,
            latlong : latlong,
            initiateMap : initiateMap,
            locationMap : locationMap,
            initiateImageCloud : initiateImageCloud,
            isValidWebLink : isValidWebLink,
            initModule : initModule};

}());
			 
				  
   

