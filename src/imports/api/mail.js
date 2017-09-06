import { contactFormSchema } from './contact.js';
import { isNil } from 'lodash';

Meteor.startup(function () {
  Accounts.config({
    sendVerificationEmail: true
  })
  Accounts.emailTemplates.from = "Quién es Quién Wiki <qqw@rindecuentas.org>"
  Accounts.emailTemplates.verifyEmail.subject = function (user) {
    return "Verify email address"
  }
  Accounts.emailTemplates.resetPassword.subject = function (user) {
    return "Reset your password"
  }
});

Meteor.methods({
  sendEmail: function(doc) {
    // Important server-side check for security and data integrity
    check(doc, contactFormSchema);

    // Build the e-mail text
    var text = "Name: " + doc.name + "\n\n"
            + "Email: " + doc.email + "\n\n\n\n"
            + doc.message;

    this.unblock();

    // Send the e-mail
    if (isNil(doc.antispam)) {
      Email.send({
          to: "info@quienesquien.wiki",
          from: doc.email,
          subject: "[QQW contact] " + doc.subject,
          text: text
      });
    }
  }
});
