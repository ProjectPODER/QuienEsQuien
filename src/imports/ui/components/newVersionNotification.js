import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor'
import {
  registerUserNewsletter,
} from '../../api/users/methods';

Template.newVersionNotification.events({
  "click .newVersionNotification_close,.newVersionNotification_access": function() {
    $(".newVersionNotification").hide();
  },
  'submit form#newUserForm': function ( event ) {
    event.preventDefault();

    const target = event.target;
    const email = target.newUserEmail.value;
    try {
      error = registerUserNewsletter.call({email: email});
      $(".newVersionNotification").hide();
      Notifications.info("Gracias", error);

    } catch (e) {
      Notifications.warn("Perdón", e.message);
    }


    return false;
  },
});
