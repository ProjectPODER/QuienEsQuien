import moment from 'moment';
import { intersection, keys } from 'lodash';
import i18n from 'meteor/universe:i18n';

moment.locale(i18n.getLocale());

export default function isAdmin() {
  const user = Meteor.user();
  if (user) {
    const roles = user.roles;
    return (_.indexOf(roles, 'admin') !== -1);
  }
  return false;
}

function isPrivladgedUser() {
  const user = Meteor.user();
  if (user) {
    const roles = user.roles;
    return (intersection(roles, ['admin', 'editor']).length > 0);
  }
  return false;
}

Template.registerHelper('is_admin', isAdmin);

Template.registerHelper('isPrivladged', isPrivladgedUser);

Template.registerHelper('objectToPairs', function(object) {
  return _.map(object, function(value, key) {
    return {
      key,
      value,
    };
  });
});

Template.registerHelper('fromNow', function(date) {
  return moment(date).fromNow();
});

Template.registerHelper('arrayify', function(obj) {
  const result = [];
  keys(obj).forEach((key) => {
    result.push({
      name: key.replace('_', ' '),
      value: obj[key],
    });
  });
  return result;
});

Template.registerHelper('notZero', function(string) {
  return (parseFloat(string) > 0);
});

Template.registerHelper('authInProcess', function() {
  return Meteor.loggingIn();
});

Template.registerHelper('right_pad', function(value) {
  return value.toFixed(2);
});

Template.registerHelper('moment_L', function(date) {
  return moment(date).format('L');
});

Template.registerHelper('moment_ll', function(date) {
  return moment(date).format('ll');
});
