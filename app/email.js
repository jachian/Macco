/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// This module will be used to send verification emails, etc.
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = function(reciever, code, sock)
{

    const nodemailer = require("nodemailer");

    const smtpTransport = nodemailer.createTransport({ service: "Gmail",  // sets automatically host, port and connection security setting
                                                                        auth: { user: "eventsmacco@gmail.com",
                                                                                pass: "izajinjuni721" }
                                                             });

    smtpTransport.sendMail( {  //email options
                              from: "MaCCo", // sender address.  Must be the same as authenticated user if using Gmail.
                              to: reciever, // receiver
                              subject: "MaCCo Email Verification", // subject
                              html: '<p>This is your verification code: </p> <br>' +code+ '</br>' // body
                            }, function(error, response)
                               {  //callback
                                  if(error)
                                  {
                                     console.log("failed to send verification email to " +reciever+ " ... " +error);
                                     sock.emit('signup response', {email : email, password : password, status : "error"});
                                  }
                                  else
                                  {
                                     console.log("Message sent: " + response.message);
                                  }
   
                                  smtpTransport.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
                               });

};
