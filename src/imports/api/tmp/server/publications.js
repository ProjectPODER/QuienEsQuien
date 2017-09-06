import { Tmp } from '../tmp.js';

Meteor.publish("tmp", function() {
  check(arguments, [Match.Any]); // template.subscribe is sending arguments :/ 
  if (Roles.userIsInRole(this.userId, 'admin')) {
    return Tmp.find();
  } else {
    this.stop();
    return this.ready();
  };
});
