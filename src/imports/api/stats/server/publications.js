import { Roles } from 'meteor/alanning:roles';
import Stats from '../stats.js';

Meteor.publish("statistics", function() {
  check(arguments, [Match.Any]); // template.subscribe is sending arguments :/
  if (Roles.userIsInRole(this.userId, 'admin')) {
    return Stats.find();
  } else {
    this.stop();
    return this.ready();
  }
});
