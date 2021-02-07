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

macco.counter = (function()
{
    // counter variables
    var display_list = []; // this will be used to hold the array of events that are cuurrently to be displayed on the public events list
    var counter_list = []; // this will be used to hold the array of counters for each event. (display_list[i] corresponds to counter_list[i]).
    var counter_string = [];     // this will be used to store countdoen strings for display

    var timer; // the timer.

    // function variables
    var setCounters;
    var setCounterPast;
    var setCounterCurrent;
    var setCounterFuture;
    var startTimer;
    var stopTimer;
    var updateCounters;


    var getCounterList;
    var getCounter;
    var getEventsList;
    var getEvent;
    var getCounterString;
    var getString;


    // function declarations

    // function definitions ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    setCounters = function(list)
    {
        // console.log("we are in macco.counter.setCounters()");

        if((list === undefined) || (list === null) || (list === []))
        {
            return;
        }

        display_list = list;   // update the array of events.
        counter_string = [];
        counter_list = [];

        for(var i = 0; i < list.length; i++)
        {
            var now = moment();

            if((now >= moment(list[i].startDate)) && (now <= moment(list[i].endDate)))   // event is currently happening
            {
                setCounterCurrent(now, list[i]);
            }
            else if(now > moment(list[i].endDate))    // test for past event
            {
                setCounterPast(now,list[i]);
            }
            else
            {
                setCounterFuture(now, list[i]);
            }      
        } 
        
    };

    setCounterPast = function(now, event)
    {
            var time_difference = now - moment(event.endDate);      // we have reached here

            var duration = moment.duration(time_difference);

            var years = duration.years();

            if(years > 0)
            {
               duration = moment.duration(duration._milliseconds % 31558464000); // get the remaining milliseconds
            }

            var months = duration.months();

            if(months > 0)
            {
               duration = moment.duration(duration._milliseconds % 2628000000);  // get the remaining milliseconds
            }

            var weeks = duration.weeks();

            if(weeks > 0)
            {
                duration = moment.duration(duration._milliseconds % 604800000);
            }

            var days = duration.days();

            if(days > 0)
            {
                duration = moment.duration(duration._milliseconds % 86400000);
            }

            var hours = duration.hours();

            if(hours > 0)
            {
                duration = moment.duration(duration._milliseconds % 3600000);
            }

            var minutes = duration.minutes();

            if(minutes > 0)
            {
                duration = moment.duration(duration._milliseconds % 60000);
            }

            var seconds = duration.seconds();


            // add entry to the counter list
            var count = counter_list.length;
            counter_list[count] = [years, months, weeks, days, hours, minutes, seconds];
            var i = 0;

           // set up display strings
           for(i = 0; i < 4; i++)
           {
               if(counter_list[count][i] > 0)
               {   							         
		           console.log("type of count = " +typeof(counter_list[count][i]));
                   break;
               }
           }

           var index = ["Yrs","Mths","Wks","Days","Hrs","Mins","Secs"];
           var display = '<h4>Ended:</h4>'
                             + '<a href="#" class="time red  nopadding">';
							      if(counter_list[count][i] < 10)
									  display = display + '0' + counter_list[count][i];
								  else
									  display = display + counter_list[count][i];
								  
								  if(counter_list[count][i+1] < 10)
									  display = display + ' : 0' + counter_list[count][i+1];
								  else
									  display = display + ' : ' + counter_list[count][i+1];
								  
								  if(counter_list[count][i+2] < 10)
									  display = display + ' : 0' + counter_list[count][i+2];
								  else
									  display = display + ' : ' + counter_list[count][i+2];
                                  // +counter_list[count][i]+ ' : ' +counter_list[count][i+1]+ ' : ' +counter_list[count][i+2]
                             
							 display = display + '</a>'
                             + '<p style="margin-left: 10px">' +index[i]+ '</p><p>' +index[i+1]+ '</p><p>' +index[i+2]+ '</p>';

           counter_string[counter_string.length] = display;  // input in counter string
    };



    setCounterCurrent = function(now, event)
    {
            var time_difference = now - moment(event.startDate);      // we have reached here

            var duration = moment.duration(time_difference);

            var years = duration.years();

            if(years > 0)
            {
               duration = moment.duration(duration._milliseconds % 31558464000); // get the remaining milliseconds
            }

            var months = duration.months();

            if(months > 0)
            {
               duration = moment.duration(duration._milliseconds % 2628000000);  // get the remaining milliseconds
            }

            var weeks = duration.weeks();

            if(weeks > 0)
            {
                duration = moment.duration(duration._milliseconds % 604800000);
            }

            var days = duration.days();

            if(days > 0)
            {
                duration = moment.duration(duration._milliseconds % 86400000);
            }

            var hours = duration.hours();

            if(hours > 0)
            {
                duration = moment.duration(duration._milliseconds % 3600000);
            }

            var minutes = duration.minutes();

            if(minutes > 0)
            {
                duration = moment.duration(duration._milliseconds % 60000);
            }

            var seconds = duration.seconds();


            // add entry to the counter list
            // add entry to the counter list
            // add entry to the counter list
            var count = counter_list.length;
            counter_list[count] = [years, months, weeks, days, hours, minutes, seconds];
            var i = 0;

           // set up display strings
           for(i = 0; i < 4; i++)
           {
               if(counter_list[count][i] > 0)
               {
                   break;
               }
           }

           var index = ["Yrs","Mths","Wks","Days","Hrs","Mins","Secs"];
           var display = '<h4>Happening Now:</h4>'
                             + '<a href="#" class="time orang  nopadding">';
							      if(counter_list[count][i] < 10)

									  display = display + '0' + counter_list[count][i];
								  else
									  display = display + counter_list[count][i];
								  
								  if(counter_list[count][i+1] < 10)
									  display = display + ' : 0' + counter_list[count][i+1];
								  else
									  display = display + ' : ' + counter_list[count][i+1];
								  
								  if(counter_list[count][i+2] < 10)
									  display = display + ' : 0' + counter_list[count][i+2];
								  else
									  display = display + ' : ' + counter_list[count][i+2];
								  
                             display = display + '</a>'
                             + '<p style="margin-left: 10px"> ' +index[i]+ '</p><p>' +index[i+1]+ '</p><p>' +index[i+2]+ '</p>';

           counter_string[counter_string.length] = display;  // input in counter string


    };



    setCounterFuture = function(now, event)
    {
            var time_difference = moment(event.startDate) - now;      // we have reached here

            var duration = moment.duration(time_difference);

            var years = duration.years();

            if(years > 0)
            {
               duration = moment.duration(duration._milliseconds % 31558464000); // get the remaining milliseconds
            }

            var months = duration.months();

            if(months > 0)
            {
               duration = moment.duration(duration._milliseconds % 2628000000);  // get the remaining milliseconds
            }

            var weeks = duration.weeks();

            if(weeks > 0)
            {
                duration = moment.duration(duration._milliseconds % 604800000);
            }

            var days = duration.days();

            if(days > 0)
            {
                duration = moment.duration(duration._milliseconds % 86400000);
            }

            var hours = duration.hours();

            if(hours > 0)
            {
                duration = moment.duration(duration._milliseconds % 3600000);
            }

            var minutes = duration.minutes();

            if(minutes > 0)
            {
                duration = moment.duration(duration._milliseconds % 60000);
            }

            var seconds = duration.seconds();


            // add entry to the counter list
            var count = counter_list.length;
            counter_list[count] = [years, months, weeks, days, hours, minutes, seconds];
            var i = 0;

           // set up display strings
           for(i = 0; i < 4; i++)
           {
               if(counter_list[count][i] > 0)
               {
                   break;
               }
           }

           var index = ["Yrs","Mths","Wks","Days","Hrs","Mins","Secs"];
           var display = '<h4>Starts in:</h4>'
                             + '<a href="#" class="time green  nopadding">';
							      if(counter_list[count][i] < 10)
									  display = display + '0' + counter_list[count][i];
								  else
									  display = display + counter_list[count][i];
								  
								  if(counter_list[count][i+1] < 10)
									  display = display + ' : 0' + counter_list[count][i+1];
								  else
									  display = display + ' : ' + counter_list[count][i+1];
								  
								  if(counter_list[count][i+2] < 10)
									  display = display + ' : 0' + counter_list[count][i+2];
								  else
									  display = display + ' : ' + counter_list[count][i+2];
                             
							 display = display + '</a>'
                             + '<p style="margin-left: 10px"> ' +index[i]+ '</p><p>' +index[i+1]+ '</p><p>' +index[i+2]+ '</p>';

           counter_string[counter_string.length] = display;  // input in counter string

    };


    startTimer = function()
    {

        // console.log("yimer update");

         if((display_list === undefined) || (display_list === null) || (display_list === []))
            return;

         timer = setInterval(updateCounters, 2000);


    };

    stopTimer = function()
    {
        if((timer !== undefined) && (timer !== null))
           clearInterval(timer);

        timer = null;           
    };


    updateCounters = function()
    {
        // start counting
        setCounters(display_list);

        for(var i = 0; i < counter_string.length; i++)
        {
            $("#timer_" +i).html(counter_string[i]);
            // document.getElementById("timer_" +i).innerHTML = counter_string[i];
        }

        // console.log("yimer update");
   
    };



    getCounterList = function()
    {
        return counter_list;
    };

    getEventsList = function()
    {
        return display_list;
    };

    getCounterString = function()
    {
        return counter_string;
    };



    getCounter = function(index)
    {
        if((counter_list === undefined) || (counter_list === null) || (index < 0))
          return [];

        if(index >= counter_list.length)
          return [];

        return counter_list[index];
    };

    getEvent = function(index)
    {
        if((event === undefined) || (event === null) || (index < 0))
          return null;

        if(index >= display_list.length)
          return null;

        return display_list[index];
    };

    getString = function(index)
    {
        if((event === undefined) || (event === null) || (index < 0))
          return [];

        if(index >= counter_string.length)
          return [];

        return counter_string[index];
    };


    initModule = function()
    {
        counter_list = [];
        display_list = [];
        counter_string = [];
    };



    return { setCounters : setCounters,
             getCounterList : getCounterList,
             getCounter : getCounter,
             getEventsList : getEventsList,
             getEvent : getEvent,
             getCounterString : getCounterString,
             getString : getString,
             startTimer : startTimer,
             stopTimer : stopTimer,
             initModule : initModule };

}());
