var nodemailer = require('nodemailer');
var jade = require('jade');
var path = require('path');
var sys = require('sys');

// Create a SMTP transport object
var transport = nodemailer.createTransport("SMTP", {
  auth: {
      user: "node@example.com",
      pass: "example"
  }
});

    
//Email
exports.emails = {
  send: function(template, mailOptions, templateOptions) {
    jade.renderFile(path.join(__dirname, 'views', 'mailer', template), templateOptions, function(err, text) {
      // Add the rendered Jade template to the mailOptions
      mailOptions.body = text;

      console.log('[SENDING MAIL]', sys.inspect(mailOptions));

        transport.sendMail(mailOptions,
          function(err, result) {
            if (err) {
              console.log(err);
            }
          }
        );
      
    });
  },

  sendWelcome: function(user) {
    this.send('welcome.jade', { to: user.email, from: 'nodepad@example.com', subject: 'Welcome to Nodepad'}, {user: user});
  }
};