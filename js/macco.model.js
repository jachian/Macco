/*
* macco.model.js
* Model module
*/
/*jslint browser : true, continue : true,
devel : true, indent : 2, maxerr : 50,
newcap : true, nomen : true, plusplus : true,
regexp : true, sloppy : true, vars : false,
white : true
*/
/*global TAFFY, $, macco */
macco.model = (function ()
{ 
   'use strict';
   // Initialisation functions //////////////////////////////////////////////////////////////////////////
   var initModule;
   var sock;
   var signup;
   var router; // this will be used to listen for incoming socket messages and then call the requisite functions to produce the appropriate responses
   
                  						  					   
   
   // Model Functions and Services ////////////////////////////////////////////////////////////////////////////
   var getEvents;
   var getEvent;
   var getEventsPosted;
   var getEventsByAccount;

   var getEventsByProfile;
   var getEventsMyLocation;
   var getEventsLatLong;
   var getEventsByTags;

   var getEventsOn;
   var getCities;
   var getStates;
   var getUsers;
   
   var getLocations;
   var setEvent;
   var setCities;
   var setStates;
   var setUser;

   var postEvent;
   var editEvent;
   var deleteEvent;
   var shareEventViaEmail;
   var getPosts;
   var saveProfile;
   
   // functions to get services from the server  //////////////////////////////////////////////////////////////////
   var login;
   var logout;
   var getVerificationCode;
   var verifyAccount;
   var forgotPassword;

   
   var createUser;     // create a user account
   var createAnonyous;      // create an anonymous user. A user that does not need to login in order use the patform
   var newProfile;        // used to create a new profile
   var updateProfile;
   var deleteProfile;   // used to deltete the current profile
   var changePassword;  // used to change the user's password
   
   var deleteEvent;
   var deleteCity;
   var deleteState;
   var deleteUser;
   
   var searchEvents;
  
   
   // state maintenance ////////////////////////////////////////////////////////////////////////////////////////////////////////
   var changeProfile; // this function is used to change the current profile that the user is using to anothone
	
   var getCurrentUser; // function for getting the above.
   var getMyProfilesList;  // function ffor getting profiles.
   var getCurrentProfile;
   var getBrowserLocation;    // this function is used to get the browser object to viewing.


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

   var userToken; // this is the local storage token that the user will need to access logged in features/services

   // user information when a user is logged in ?? User state information
   var currentUser;                  // current user object
   var nullProfile;                  // used to track whethet you ae using an anonymous profile or not
   var profileId;                    // id of current user
   var myProfilesList;               // list of profiles the user has
   var profileEventsList;            // the list of the events that were created by the current profile
   
   // current location information
   var browser_location;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// Global variables for Caching Events //////////////////////////////////////////////////////////////////////////////
   var eventsListCache;                     // the list of events to happen returned by the server
   var accountEventsCache;               // the list of events that this profile has created and posted.



   // methods to get the above 3 values globally
   var getList;
   var getProfileId;
   var getUser;
   var getUserIndex;              // used to get the index of the current user
   var getProfileEvents;
   var getProfileOther;


  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // getters for global variables - user state information
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getList = function()
  {
     return myProfilesList;
  }; 

  getProfileId = function()
  {
     return profileId;
  };


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // This is used to get the current Profile's
  //
  // Return null if there is no profile or an Anonymous profile in use
  // Returns a valid profile if one is in use
  //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getUser = function()
  {
     if((currentUser < 0) || (myProfilesList === undefined) || (myProfilesList === null))
        return null;

     return myProfilesList[currentUser];
  };

  getProfileEvents = function()
  {
      return profileEventsList;
  };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   

   
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Router - used for responding to messages from the server
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router = function()
{
    // await response

    sock.on('browser_load', function(msg)
                            {
                                console.log('browser_load message recieved = ' +msg.status);
                                // getEventsMyLocation(true);
                            });

    sock.on('get_events', function(msg)
                          {
                               console.log('get events response : ' + msg.status);
                               macco.main.getEventsResponse(msg);
                          });


    // - looked at /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    sock.on('get_events_by_account', function(msg)
                          {
                               console.log('get events_by_account response : ' + msg.status);
                               // if success then store the events list in the Cache
                               if(msg.status === 'success')
                               {
                                  accountEventsCache = msg.events;
                                  console.log(accountEventsCache);
                               }

                               if(msg.status === 'token_expired')   // we need to reset everything and go to the login page
                               {
                                  macco.model.logout();
                               }
                          });

    // - looked at /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    sock.on('get_events_by_profile', function(msg)
                          {
                               console.log('get events_by_profile response : ' + msg.status);
                               // if success then store the events list in the Cache
                               if(msg.status === 'success')
                               {
                                  profileEventsList = JSON.parse(msg.events);
                                  console.log(profileEventsList);
                               }

                               if(msg.status === 'token_expired')   // we need to reset everything and go to the login page
                               {
                                  macco.model.logout();
                               }
                          });

    sock.on('get_events_my_location', function(msg)
                                      {
                                          console.log('get events_my_location response : ' + msg.status + " ...... " +msg.board);

                                          if(msg.status === 'success')
                                          {
                                              console.log(msg.list);
                                              // macco.counter.setCounters(msg.list);        // this sets up the storage and thee counters for the events list
                                              macco.main.updateEventsBoard(msg.list, false, null);     // is actually generates the markup and displays the events 

                                              return;
                                              
                                          }
                               
                                      });

    sock.on('get_events_all', function(msg)
                                      {
                                          console.log('get events_all response : ' + msg.status + " ...... " +msg.board);

                                          if(msg.status === 'success')
                                          {
                                              console.log(msg.list);
                                              // macco.counter.setCounters(msg.list);        // this sets up the storage and thee counters for the events list
                                              macco.main.updateEventsBoard(msg.list, false, null);     // is actually generates the markup and displays the events 

                                              return;                                             
                                          }
                               
                                      });									  


    //sock.on('get_events_on', function(msg)
    //                      {
      //                         console.log('get events response : ' + msg.status);
        //                       macco.main.getEventsResponse(msg);
          //                });


    //sock.on('get_events_by', function(msg)
      //                    {
        //                       console.log('get events response : ' + msg.status);
          //                     macco.main.getEventsResponse(msg);
            //              });
   
    //sock.on('get_locations', function(msg)
      //                       {
        //                         console.log('recieved a locations list');
          //                       macco.main.getLocationsResponse(msg);
            //                 });

    // - looked at ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    sock.on('post_event', function(msg)
                          {
                              console.log('post_event response :' +msg.status);
                              console.log('post_event response :' +msg.myEvents);


                              if(msg.status === 'success')
                              {
                                   profileEventsList = msg.myEvents;
                                   // accountEventsCache = msg.myEvents;       // unpdate the my events Cache
                                   macco.nav.setAnchorMyProfile();          // update page to the profile page
                                   return; 
                              }
                              else // no token available we will need to sign in again
                              {
                                  macco.model.logout();
                                  return;
                              }

                              macco.main.postEventResponse(msg);
                           });

    // - looked at ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    sock.on('edit_event', function(msg)
                          {
                              if(msg.status === 'edit_event_success')
                              {
                                  getEventsByAccount();    // update my events list
                                  macco.nav.setAnchorMyProfile();          // update page to the profile page

                                  console.log("edit event success in the model");
                                  return;
                              }
                              console.log("edit event failure");
                              
                              if((msg.status === 'edit_event_error_getting_token') || (msg.status === 'edit_event_invalid_token'))    // server could not verify the token - we must sign in again   
                              {
                                  macco.model.logout();

                                  return;
                               }
                             
							 
                              if(msg.status === 'success')
                              {
                                   profileEventsList = msg.myEvents;
                                   // accountEventsCache = msg.myEvents;       // unpdate the my events Cache
                                   macco.nav.setAnchorMyProfile();          // update page to the profile page
                                   return; 
                              }
                              else // no token available we will need to sign in again
                              {
                                  macco.model.logout();
                                  return;
                              }

                              macco.main.editEventResponse(msg);							 
							 														 
							 //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
							 
                               // the rest of errors let main deal with
                               macco.main.editEventResponse(msg);
                                   
                              // if we are here an error occured - send message to macco.main (editEventResponse())
                          });
						  
	    sock.on('share_event_via_email', function(msg)
                                         {
                                             console.log('share_event_via_email response :' +msg.status);
                                             console.log('share_event_via_email response :' +msg.myEvents);
							  
							                 //if((msg.status === 'share_event_via_email_no_token_given') || (msg.status === 'share_event_via_email_invalid_token'))
							                 //{
								                //macco.model.logout();
                                                //return;
							                 //}
							   
						                     macco.main.shareEventResponse(msg);							  
                                         });

    // - looked at //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    sock.on('delete_event', function(msg)
                          {
                              if(msg.status === 'delete_event_success')
                              {
                                  console.log(msg.status);
                                  // deleting the deleted event from oue list of account events
                                  // var list = JSON.parse(accountEventsCache);
                                  var index = null;

                                  for(var i = 0; i < profileEventsList.length; i++)
                                  {
                                      if(profileEventsList[i]._id === msg.event._id)
                                      {
                                           index = i;
                                           break;
                                      }
                                  }

                                  if(index !== null)
                                     profileEventsList.splice(index, 1);

                                  // accountEventsCache = JSON.stringify(list);

                                  // getEventsByAccount();    // update my events list
                                  macco.nav.setAnchorAbout();
                                  macco.nav.setAnchorMyProfile();          // update page to the profile page

                                  // console.log("delete event success in the model");
                                  return;
                              }

                              console.log("edit event failure");

                              // if we are here an error occured - send message to macco.main (editEventResponse())
                          }); 

    // - looked at //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    sock.on('search_events', function(msg)
                             {
							     console.log(msg.status);
                                 if(msg.status === 'search_events_success')
                                 {
                                     console.log(msg.results);
									 macco.main.updateEventsBoard(msg.results, true, msg.search_list);     // is actually generates the markup and displays the events
                                     return;
                                 }								
                                 console.log("search event failure");
                                 // if we are here an error occured - send message to macco.main (editEventResponse())
								 
								 if(msg.status === 'empty_search_list')
								 {
									 // macco.main.changeBoardHeader('No search results available...');									 
								 }
									 
								 if((msg.status === 'error_finding_events_tags') || (msg.status === 'error_finding_events'))
								 {
									 // macco.main.changeBoardHeader('Server Error');
								 }
									 
                          });



    // - looked at //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    sock.on('change_profile_events', function(msg)
                                     {
                                         console.log("change_profile_events = " +msg.status);
                                         console.log(msg.events_list);


                                         if(msg.status === 'success')
                                         {
                                             profileEventsList = msg.events_list;       // update the events list
                                             macco.nav.setAnchorMyProfile();     // go to the profile list
                                             return;
                                         }

                                         macco.nav.setAnchorMyProfile();
                                     });
                                    
    sock.on('signup', function(msg)
                      {
                          console.log('singup response : ' + msg.status);
                          macco.main.signupResponse(msg);
                      });

    sock.on('forgot_password', function(msg)
                      {
                          console.log('forgot password response : ' + msg.status);
                          macco.main.forgotPasswordResponse(msg);
                      });
					  

    sock.on('change_password', function(msg)
                               {
                                  console.log('change Passord response : ' + msg.status);
								  
								  if((msg.status === 'change_password_error_getting_token') || (msg.success === 'change_password_token_expired')) 
								  {
								      macco.model.logout();
                                      return;
								  }
								  
								  macco.main.changePasswordResponse(msg.status);
								  return;
                               });

    sock.on('get_verification_code', function(msg)
                      {
                          console.log('get verifcation code status: ' + msg.status);
                          macco.main.getVerificationCodeResponse(msg);
                      });



    sock.on('codeVerify', function(msg)
                          {
                              console.log('code verification response :' +msg.status);
                              macco.main.codeResponse(msg);
                          });

    // - looked at //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    sock.on('login', function(msg)
                          {
                              console.log('login response' +msg.status+ ' '+ msg.myProfiles + '  type of = ' +typeof(msg.myProfiles));

                              if(msg.status === "success")
                              {
                                  userToken = msg.macco; // get the token from the message

                                  // this is today's addition
                                  if((msg.myProfiles !== null) && (msg.myProfiles !== undefined) && (msg.myProfiles !== '[]'))
                                  {
                                      // get the current user
                                      myProfilesList = JSON.parse(msg.myProfiles);
                                      currentUser = 0;  // set to the first profile

                                  }
                                  else
                                  {
									  console.log(" $$$$$$$$$ just logined in we have no profiles");
                                      currentUser = -99;
                                      myProfilesList = null;
									  getEventsByProfile();     // get the list of events that have been created by this user
                                  }
								   
                                   if(localStorage)
                                   {
                                       localStorage.setItem("maccoToken", userToken); // store the token inlocal storage
                                       localStorage.setItem("currentUser", currentUser);    // store the current User always
                                       localStorage.setItem("profiles", msg.myProfiles);

                                       getEventsByProfile();     // get the list of events that have been created by this user
                                   }								   
                              }
                              else
                              {
                                  userToken = null;
                                  myProfilesList = null;
                                  currentUser = -99;
                              }
                                                                                                                                                                               
                              macco.main.loginResponse(msg);
                              
                          });


    // - Looked at /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    sock.on('get_my_profiles_list', function(msg)
                                    {                                    
                                        console.log("get my profiles list " +msg.status);

                                        if(msg.status === "success")
                                        {
                                             console.log("get my profiles list " +msg.status+ ' profile list = ' +msg.myProfiles);

                                             if((msg.myProfiles !== null) && (msg.myProfiles !== undefined))
                                             {
                                                 myProfilesList = JSON.parse(msg.myProfiles);
                                             }
                                        }
                                    });

    //sock.on('get_current_profile', function(msg)
      //                      {
        //                      // set the profiles
          //                    if(msg.status === 'success')
            //                  {
              //                     currentUser = JSON.parse(msg.pro);
//
  //                                 profileId = JSON.parse(msg.pro)._id;
//
  //                                 localStorage.setItem("currentUser", msg.pro);
    //                               localStorage.setItem("profileId", JSON.stringify(profileId));
//
  //                            }
    //                          else
      //                        {
        //                           macco.nav.displayLoggedOutPage();
          //                    }
//
  //                           });


    //sock.on('save_profile', function(msg)
      //                     {
        //                      console.log('got save_profiles response');
//
  //                            // set the profiles
    //                          if(msg.status === 'success')
      //                        {
//
  //                            }
    //                          // send the response to main for processing
      //                        macco.main.saveProfileResponse(msg);
//
  //                         });


    sock.on('new_profile', function(msg)
                           {
                                  console.log('got back new_profile response status = ' +msg.status);

                                  // update the profiles list
                                  if(msg.status === 'new_profile_success')
                                  {
                                      console.log("updated profile list = " +msg.profiles);
                                      console.log("current profile = " +msg.current);

                                      // update the current profile list
                                      myProfilesList = JSON.parse(msg.profiles);   // add the new profile to your list

                                      // set the currentUser and the profileId information
                                      for(var i = 0; i < myProfilesList.length; i++)
                                      {
                                          if(myProfilesList[i].handle ===  msg.current.handle)
                                          {
                                             currentUser = i;
                                             break;
                                          }   
                                      }
									  
									  profileEventsList = null;  ///// newly added

                                      if(localStorage)
                                      {
                                         localStorage.setItem("currentUser", currentUser);
                                         localStorage.setItem("profiles", msg.profiles);
                                      }

                                      macco.nav.setAnchorMyProfile();
                                      return;
                                  }

                                  if((msg.status === 'new_profile_error_getting_token') || (msg.status === 'new_profile_null_token_recieved') || (msg.status === 'new_profile_error_decoding_token'))
                                  {
                                      macco.model.logout();
                                      return;
                                  }
                                  
                                  // if we reach here we let themain module deal with the messages and ask the user to contiunue
                                  macco.main.newProfileResponse(msg);

                             });

    sock.on('update_profile', function(msg)
                              {
                                    console.log('profile update  response : ' + msg.status);
                           

                                    if(msg.status === 'update_profile_success')    // success message
                                    {
                                      console.log("updated profile = " +msg.update);

                                      // update the current profile list
                                      if((myProfilesList !== null) && (myProfilesList !== undefined))
                                      {
                                          // set the currentUser and the profileId information
                                          for(var i = 0; i < myProfilesList.length; i++)
                                          {
                                              if(myProfilesList[i]._id ===  msg.update._id) // we update the information
                                              {
                                                  myProfilesList[i].name = msg.update.name;
                                                  myProfilesList[i].handle = msg.update.handle;
                                                  myProfilesList[i].about = msg.update.about;
                                                  myProfilesList[i].address = msg.update.address;
                                                  myProfilesList[i].email = msg.update.email;
                                                  myProfilesList[i].phone = msg.update.phone;
                                                  myProfilesList[i].image = msg.update.image;

                                                  // now we will update the current user
                                                  currentUser = i;

                                                  if(localStorage)  // update the local storage
                                                  {
                                                     localStorage.setItem("currentUser", currentUser);
                                                     localStorage.setItem("profiles", JSON.stringify(myProfilesList));
                                                  }

                                                  break;  // break out of the loop
                                              }
                                          }
                                      }

                                      macco.nav.setAnchorMyProfile();
                                      return;
                                   }

                                   if((msg.status === 'update_profile_null_token_recieved') || (msg.status === 'update_profile_error_getting_token') || (msg.status === 'update_profile_error_decoding_token'))
                                   {
                                      macco.model.logout();

                                      return;
                                   }

                                   macco.main.updateProfileResponse(msg);    // we deal with the other errors - let main deal with these     
                           
                              });


    sock.on('delete_profile', function(msg)
                              {
                                    console.log('------ response status = ' + msg.status);


                                    if(msg.status === 'delete_profile_success')    // success message
                                    {
                                       console.log('profile id of deleted = ' + msg.profile_id);

                                      // update the current profile list
                                      if((myProfilesList !== null) && (myProfilesList !== undefined))
                                      {
                                          // set the currentUser and the profileId information
                                          for(var i = 0; i < myProfilesList.length; i++)
                                          {
                                              if(String(myProfilesList[i]._id) ===  String(msg.profile_id)) // we update the information
                                              {
                                                  myProfilesList.splice(i, 1); // delete this entry

                                                  // now we will update the current user
                                                  currentUser = 0;

                                                  if(localStorage)  // update the local storage
                                                  {
                                                     localStorage.setItem("currentUser", currentUser);
                                                     localStorage.setItem("profiles", JSON.stringify(myProfilesList));
                                                  }

                                                  break;  // break out of the loop
                                              }
                                          }
                                      }

                                      macco.nav.setAnchorMyProfile();
                                      return;
                                   }

                                   if((msg.status === 'delete_profile_null_token_recieved') || (msg.status === 'delete_profile_error_getting_token') || (msg.status === 'delete_profile_error_decoding_token'))
                                   {
                                      macco.model.logout();

                                      return;
                                   }

                                   macco.main.deleteProfileResponse(msg);    // we deal with the other errors - let main deal with these

                              });

    sock.on('get_profile_other', function(msg)
                                 {
                                    console.log(' get profile other response status = ' + msg.status);
                                    console.log(msg.profile);
                                    console.log(msg.events);

                                    if(msg.status === 'get_profile_other_success')
                                    {
                                        macco.main.profilePageOther(msg.profile, msg.events);
                                        return;
                                    }
                                 });

    sock.on('is_profile_handle_taken', function(msg)
                                       {
                                           if(msg.status === 'handle_not_taken')
                                           {
                                               console.log("profile handle taken (current token) == " +userToken);
                                               console.log("profile handle taken (token from server) == " +msg.token);
                                           
                                               sock.emit('update_profile', {token : userToken, user_id : msg.user_id, profile : msg.profile, profile_id : msg.profile_id});
                                               return;
                                           }

                                           macco.main.updateProfileResponse({status : 'update_profile_handle_already_taken'});

                                       });

// sock.emit('update_profile', {token : userToken, user_id : currentUser._id, profile : profile, profile_id : currentUser._id});

							   
};

   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Name: Signup
   //
   // Arguments: email - the proposed email address of the account
   //            password - The proposed password of the account
   //            verification - the tyrpe of verification that is requested by the user (email - email verification requested)
   //                                                                                   (sms - sms verification requested)
   // Return Type: none
   //
   // This function is called when a user submits credentials for creating an account. This function then makes a request to the server with the arguments
   // 
   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   signup = function(email, password, verification)
   {	
      sock.emit('signup', { email : email, password : password, verification : verification});
   };



   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Name: getVerificationCode
   //
   // Arguments: email - the email of the account we wish tp get the verifcation code for
   //
   // Return Type: None
   //
   // This is used to request that the server resend us our verification code
   // 
   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   getVerificationCode = function(email)
   {
       sock.emit('get_verification_code', {email : email});
       console.log("request for verifaction code sent to server with = " +email);
   };



   verifyAccount = function(code)
   {
      // submit verification code to server
      sock.emit('validate', { code : code });
   };


   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // 
   //   Name: forgotPassword
   //
   //   Arguments: email - the email address of the account that the user forgot
   //
   //   Return Type: None
   //
   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   forgotPassword = function(email)
   {
       // submit the email address of the account forgot
       sock.emit('forgot_password', { email : email });

   };

   
   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Name: login
   //
   // Arguments: email address (string)
   //            password (string)
   //            service (string) - this specified the service we wish to use to log in with. "xivents", "facebook", "google", "twitter", etc.
   //            response - (json) - this is the object containg the login requirments for the service. - facebook or other service responses.
   //
   // Return Type: A user object ({"id":4,"username":"jachian", "email":"jachian@gmail.com", "password":"Password1234"}) in an array [].
   //
   // This function is used when then shell wishes to log into an account. the function is called with the email address and password of
   // the user trying to log-in. If the user is successfull a valid object is returned. if the user is not successful and invalid object is returned like the
   // following: {"id":-999.99,"username":"failed", "email":"failed", "password":"failed"}
   //
   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   login = function(email, password, service, response)
   {
	   var city = null;
	   var country = null;
	   var hostname = null;
	   var ip = null;
	   var latlong = null;
	   var org = null;
	   
	   if((browser_location !== undefined) && (browser_location !== null))  // if we have the brosers location information
	   {
		  var location = JSON.parse(browser_location);  // get the location
		   
		  city = location.city;
		  country = location.country;
		  hostname = location.hostname;
		  ip = location.ip;
		  latlong = location.loc;
		  org = location.org;
		   
	   }
	   
	   //check which service we want to use to login with
	   if(service === "facebook")
	   {
           console.log("we have a facebook login to process the response from facebook was = " +response);
           sock.emit('login_facebook', { token : response.authResponse.accessToken, user : response.authResponse.userID,  
		                                 location : { ip : location.ip, hostname : location.hostname, city : location.city, country : location.country, latlong : location.loc, org : location.org }});

           return;										    
	   }
	   
	   if(service === "google/twitter")
	   {
			console.log("login response google/twitter = " +JSON.stringify(response));
			//console.log("login successful profile = " +JSON.stringify(profile));
			
			if(response.token.idTokenPayload.sub.indexOf("google") > -1)   // we signed in with google
			{
				console.log("we have a google login to process.........");
				
				sock.emit('login_google', { user_id : response.profile.user_id, token : response.token.accessToken, email : response.profile.email, name : response.profile.name,  
		                                    location : { ip : location.ip, hostname : location.hostname, city : location.city, country : location.country, latlong : location.loc, org : location.org }});
											
				return;
			}
			
		    console.log("we have a twitter login to process.........");
				
			sock.emit('login_twitter', { user_id : response.profile.user_id, token : response.token.accessToken, name : response.profile.name, screen_name : response.profile.screen_name,  
		                                 location : { ip : location.ip, hostname : location.hostname, city : location.city, country : location.country, latlong : location.loc, org : location.org }});
											
		    return;

	   }
	   
	   //
       //if((browser_location === undefined) || (browser_location === null))
       //{
           //console.log("browser_location undefined");
           //sock.emit('login', { email : email, password : password, location : {city : null, country : null, hostname : null, ip : null, latlong : null, org : null }});
           //return;
       //}

       //console.log("browser_location defined = " +browser_location);
       //var location = JSON.parse(browser_location);
  
       sock.emit('login', { email : email, password : password, location : { ip : location.ip, hostname : location.hostname, city : location.city, country : location.country, latlong : location.loc, org : location.org }});	   
   };


   
   logout = function()
   {
       // destroy state variables
       currentUser = -99;   //destroy current user
       // profiles = null;
       // currentp = 0;
       // profileId = null;

       myProfilesList = null;

       userToken = null;  // destroy user token

       accountEventsCache = null; //clear user account cache
	   
       if(localStorage)    // destroy everything in local storage
       {
          localStorage.removeItem("maccoToken");
          localStorage.removeItem("currentUser");
          localStorage.removeItem("profiles");
       }
       
       // go to the login page
       macco.nav.displayLoggedOutPage();
       macco.nav.setAnchorLogin(); // display the login page
		   
   };
   

   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Name: changeProfile 
   // 
   // Arguments: index - this is the index into the myProfilesList[] arrary to the user we want to go to
   //
   // Return Type: None
   //
   // This function is used to change form one profile to another.
   //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   changeProfile = function(index)
   {
       if(index < 0)
       {
           currentUser = -99;
           localStorage.removeItem("currentUser");
           sock.emit('change_profile_events', {token : userToken, profile_id : null});
 
           // macco.nav.setAnchorMyProfile();
           
           return;
       }

       currentUser = index;

       localStorage.setItem("currentUser", currentUser);
       sock.emit('change_profile_events', {token : userToken, profile_id : myProfilesList[currentUser]._id});

       // display mu profile pages  //////////////////////////
       // macco.nav.setAnchorMyProfile();
   };
   

   // we will use this to get the current logged in user's information
   getCurrentUser = function()
   {
       sock.emit('current_user', {token : userToken});
   };

///////////////////////////////////////////////////////////////////////////
//
// This is used to get the index of the current user
//
//////////////////////////////////////////////////////////////////////////////
getUserIndex = function()
{
    return currentUser;
};


   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Name: postEvent
   //
   // Arguments: post - a JSON that lists the parameters for an event
   //
   // Return type: None
   //
   // This function sends a 'post_event' message to the server. 
   // This message must contain the user's Token, which identifies who the user is and the event itself as an JSON object.
   //
   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   postEvent = function(post)
   {
       var location;

       if((browser_location === undefined) || (browser_location === null))
       {
           location = { ip : null, hostname : null, city : null, country : null, lat : null, lng : null, org : null };
       }
       else
       {
           var loc = JSON.parse(browser_location);
           var latlong = loc.loc.split(',');

           location = { ip : loc.ip, hostname : loc.hostname, city : loc.city, country : loc.country, lat : latlong[0], lng : latlong[1], org : loc.org };
       }



       if((currentUser < 0) || (myProfilesList === undefined) || (myProfilesList === null) || (myProfilesList === []))    // (user === undefined) || (user === null))
       {
           sock.emit('post_event', {token : userToken, profileId : null, profileName : "Noname", handle : "noname", eve : post, location : location});
           return;
       }
	   
	   console.log("current profile === " +currentUser+ " profileslist === " +myProfilesList);
	   
	   var user = myProfilesList[currentUser];          
       sock.emit('post_event', {token : userToken, profileId : user._id, profileName : user.name, handle : user.handle, eve : post, location : location});
       
   };

   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Name: editEvent
   //
   // Arguments: event_id - the _id of the event we wish to edit.
   //           post - a JSON that lists the parameters for an event
   //
   // Return type: None
   //
   // This function sends an 'edit_event' message to the server.
   // This message must contain the user's Token, which identifies who the user is, the id of the event we wish to edit and the event itself as an JSON object.
   //
   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   editEvent = function(event_id, post)
   {
       var location = null;

       if((browser_location === undefined) || (browser_location === null))
       {
           location =  { ip : null, hostname : null, city : null, country : null, lat : null, lng : null, org : null };
       }
       else
       {
           var loc = JSON.parse(browser_location);
           var latlong = loc.loc.split(',');

           location = { ip : loc.ip, hostname : loc.hostname, city : loc.city, country : loc.country, lat : latlong[0], lng : latlong[1], org : loc.org };
       }


       sock.emit('edit_event', {token : userToken, eventId : event_id, eve : post, location : location});
   };
   
   
   //////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // This is in active use
   //
   //////////////////////////////////////////////////////////////////////////////////////////////////////
   shareEventViaEmail = function(share_details)
   {
	   console.log("this is our share info === " +share_details);
	   console.log(share_details);
	   
	   sock.emit('share_event_via_email', {token : userToken, details : share_details});  
   };




   deleteEvent = function(event_id, event_index)
   {
       sock.emit('delete_event', {token : userToken, eventId : event_id, eventIndex : event_index});
   };






   getPosts = function()
   {
       return accountEventsCache;
   };

   getBrowserLocation = function()
   {
       return browser_location;
   };

   saveProfile = function(profile)
   {
       // sock.emit('save_profile', {token : userToken, proId : profile[currentp]._id, pro : profile});
   };

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name: getEventsMyLocation
//
// Arguments: board - A boolean that is used to tell the system whether the result is to be printed to the 'Events' - part of the page - ie the public board or if the result is to be returned to a public place for further processing
//            if true - then the result is intended for display on the public events board
//
//            if False - then the result is intended for storage for some other reason
//
//            range - a string. this lets us know specifically which events are being requested.
//            if 'All' - we want all the upcoming events posted
//            if 'Near_me' - we want only the upcoming events happening close to me
//
// Return Type - None
//
// This function is used to request a list of events that may be happening close to my browser's current location.
//
// This action does not require a token. Any device can access this data with the right call. --- This may be a problem for security or business as we want only our app to be able to do this.
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
getEventsMyLocation = function(board, range)
{
     var location = null;

     if((browser_location === undefined) || (browser_location === null))
     {
        // location =  { ip : null, hostname : null, city : null, country : null, lat : null, lng : null, org : null };
		sock.emit('get_events_all', {board : board});   // we dont have our location so just get all upcoming events
		
        return;
     }
     else
     {
		 if(range === 'Near_Me')
		 {
            var loc = JSON.parse(browser_location);
            var latlong = loc.loc.split(',');

            location = { ip : loc.ip, hostname : loc.hostname, city : loc.city, country : loc.country, lat : latlong[0], lng : latlong[1], org : loc.org };
	    
		    sock.emit('get_events_my_location', {my_location : location, board : board});  /// we want evets at my location

            return;			
		 }
     }
	 
	 sock.emit('get_events_all', {board : board});   // we dont have our location so just get all upcoming events
}; 


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name: searchEvents
//
// Arguments: tag - (String) the keyword or hashtag that we wish to filter the events list by
//            destination - the name of the list that we want to filter or the destination. it should be one of the following
//                   my - the list of events created by the user currently logged in.
//                   other - the list of events created by another profile on the system
//                   public - from the list on the public events page.
//
// Return Type: None 
//
// This function is used to request a list of events that are taged with the specific keyword contain in the 'tag' argument.
// This is used for filtering lists of events 
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////                  
searchEvents = function(tags_list)
{
	console.log("search_events = " +tags_list);
    sock.emit('search_events', {search_list : tags_list});
    
    // show loading page
    macco.main.changeBoardHeader("searching ...");	
};



   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Name: getEventsByAccount
   //
   // Arguments : None
   //
   // Return type: None
   //
   // This function requests the list of all events posted by this acccount from the server.
   //
   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   getEventsByAccount = function()
   {
       sock.emit('get_events_by_account', {token : userToken});
   };


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Name: getEventsByProfile
   //
   // Arguments : None
   //
   // Return type: None
   //
   // This function requests the list of all events posted by this acccount from the server.
   //
   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   getEventsByProfile = function()
   {
       if((currentUser < 0) || (myProfilesList === undefined) || (myProfilesList === null))
       {
           sock.emit('get_events_by_profile', {token : userToken, profile_id : null});
           return;
       }
       var pro = myProfilesList[currentUser];

       if((pro === undefined) || (pro === null))
           sock.emit('get_events_by_profile', {token : userToken, profile_id : null});
       else
           sock.emit('get_events_by_profile', {token : userToken, profile_id : myProfilesList[currentUser]._id});
   };


   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // This is used to get events from the server
   //
   // If (token === null) then we assume that the user is not logged in and return to him in the context of not- logged in.
   // If (city and state) are both null then we assume that the user is requesting events from anywhere - but perhaps looking for his closest location
   // 
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   getEvents = function(city, state, startDateString, postedBy)
   {
       if(startDateString !== null) // postedOn is not null then we are interested in getting back events posted on that date
       {
           sock.emit('get_events_on', {token : userToken, city : city, state : state, startDateString : startDateString, postedBy : postedBy});
           return;
       }

       if(postedBy !== null) // if postedBy is not null then we are interested in getting back events posted by this user (userId)
       {
           sock.emit('get_events_by', {token : userToken, city : city, state : state, startDateString : startDateString, postedBy : postedBy});
           return;
       }

       // if we reach here then the above statements are null and we just want to get all the events at the given location

       sock.emit('get_events', {token : userToken, city : city, state : state});
       
       return;
       // return eventsDB({city:city}, {country:state}).get();
   };

   getLocations = function()
   {
      sock.emit('get_locations', {token : userToken});
   };



   getMyProfilesList = function()
   {
       sock.emit('get_my_profiles_list', {token : userToken});
   };

   getCurrentProfile = function(profileId)
   {
       sock.emit('get_current_profile', {token : userToken, id : profileId});
   };

   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Name : newProfile
   // Agruments : profile - a JSON object of the new profile to be created.
   //
   // Return Type: None
   //
   // This function is used to call the server in order to create a create a new profile
   //
   //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   newProfile = function(profile, update)
   {
       if(update === false)  // if we want create a new profile we will do this
       {
          sock.emit('new_profile', {token : userToken, profile : profile});
          return;
       }

       // if we want to update  a current profile we do the below
       sock.emit('update_profile', {token : userToken, user_id : myProfilesList[currentUser]._id, profile : profile, profile_id : myProfilesList[currentUser]._id});
       // sock.emit('update_profile', {token : userToken, user_id : currentUser._id, profile : profile, profile_id : currentUser._id});
   };

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// This function is used to change the user's password
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////   
changePassword = function(password)
{
    sock.emit('change_password', {token : userToken, password : password});
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name : deleteProfile
//
// Arguments : none
//
// Return Type: None
//
// This function requests that the current profile be deleted
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
deleteProfile = function()
{
    if((currentUser < 0) || (myProfilesList === undefined) || (myProfilesList === null))
      return;

    sock.emit('delete_profile', {token : userToken, profile_id : myProfilesList[currentUser]._id});
};



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Name : getProfileOther
//
// Arguments : profileId - the id of the profile we wish to get
//
// Return type : None
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
getProfileOther = function(profileHandle)
{
    sock.emit('get_profile_other', { handle : profileHandle });
						console.log("get profuile other handle = " +profileHandle);
};

 	
   
   initModule = function()
   {
           sock = io();
		   
		   // sock = io.connect('https://159.203.106.44:3000', {secure: true});

           // initialise the state variables to null
           userToken = null;
           currentUser = -99;     // this is the index of current user
           myProfilesList = null;    // this was null before and might be a problem later on

           eventsListCache = null;
           accountEventsCache = null;
           profileEventsList = null;


           // Doing local storage stuff including getting and setting user tokens and loggins  //////////////////////////////////////////////////////////////////////////
           if(localStorage)  // this browser does have local storage
           {
               userToken = localStorage.getItem("maccoToken");

               currentUser = localStorage.getItem("currentUser");    // used to store the current profile index

               if(isNaN(currentUser) === false)
                  currentUser = parseInt(currentUser);
               else
                  currentUser = -99;
               
               myProfilesList = localStorage.getItem("profiles");

               if((myProfilesList !== undefined) && (myProfilesList !== null))
                  myProfilesList = JSON.parse(myProfilesList);
               else
                  myProfilesList = null; 
           }


           // get browser location information
           $.get("http://ipinfo.io", function(response)
                                     {
                                         browser_location = JSON.stringify(response);
                                         console.log(browser_location);

                                         macco.nav.setAnchorEvents();   // crucial
                                     }, "jsonp");

           router();

           // getMyProfilesList();   // get the profiles list

           // getEventsByAccount();    //try to get the list of events posted by this user.
           //if(currentUser > -1)
           getEventsByProfile();   // this return after macco.main finishes.

           console.log("macco.model.js initialised .............");
   };
   
   
   return {initModule: initModule,
           getEvents: getEvents,
           getEvent: getEvent,
           getEventsByAccount : getEventsByAccount,
           getEventsByProfile : getEventsByProfile,
           getEventsMyLocation : getEventsMyLocation,
           getEventsPosted: getEventsPosted,
           getEventsOn: getEventsOn,
           getUsers: getUsers,
           getLocations : getLocations,
           getCities: getCities,
           getStates: getStates,
	       getCurrentUser : getCurrentUser,
           getUserIndex : getUserIndex,
           getMyProfilesList : getMyProfilesList,
           getList : getList,
           getProfileId : getProfileId,
           getProfileOther : getProfileOther,
           getUser : getUser,
           getProfileEvents : getProfileEvents,
           getVerificationCode : getVerificationCode,
           getBrowserLocation : getBrowserLocation,
           newProfile : newProfile,
           router : router,
           signup : signup,
           login : login,
           logout: logout,
           changeProfile : changeProfile,
		   changePassword : changePassword,
           deleteProfile : deleteProfile,
           postEvent : postEvent,
           editEvent : editEvent,
		   shareEventViaEmail : shareEventViaEmail,
           deleteEvent : deleteEvent,
		   searchEvents : searchEvents,
           getPosts : getPosts,
           saveProfile : saveProfile,
           verifyAccount : verifyAccount,		   
           getCurrentProfile : getCurrentProfile,
           eventsListCache : eventsListCache,                     // the list of events to happen returned by the server
           accountEventsCache : accountEventsCache,               // the list of events that this profile has created and posted.
           forgotPassword : forgotPassword}; 
}());
