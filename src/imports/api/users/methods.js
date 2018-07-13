import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

export const getAllUsers = new ValidatedMethod({
  name: 'Users.methods.getAll',

  validate: null,

  run() {
    this.unblock();
    const loggedInUser = Meteor.user()
    if (!loggedInUser || !Roles.userIsInRole(loggedInUser, ['admin'])) {
      throw new Meteor.Error(403, "Access denied")
    }
    return Meteor.users.find({}, {
      fields: {
        username: 1,
        roles: 1,
        emails: 1
      }
    }).fetch();
  }
});

export const registerUser = new ValidatedMethod({
  name: 'Users.methods.register',

  validate: new SimpleSchema({
    email: {
      type: String,
      regEx: SimpleSchema.RegEx.Email
    }
  }).validator(),

  run({ email }) {
    this.unblock();
    const loggedInUser = Meteor.user()
    if (!loggedInUser || !Roles.userIsInRole(loggedInUser,
      ['admin'] )) {
      throw new Meteor.Error(403, "Access denied")
    }

    if (Meteor.isServer) {
      let id = Accounts.createUser({ email: email });
      Accounts.sendEnrollmentEmail(id);
      return 'success';
    }
  }
});

export const registerUserNewsletter = new ValidatedMethod({
  name: 'Users.methods.registerNewsletter',

  validate: new SimpleSchema({
    email: {
      type: String,
      regEx: SimpleSchema.RegEx.Email
    }
  }).validator(),

  run({ email }) {
    this.unblock();
    const loggedInUser = Meteor.user()

    if (Meteor.isServer) {
      let id = Accounts.createUser({ email: email });
      return 'success';
    }
  }
});

export const userAssignRole = new ValidatedMethod({
  /**
  * update a user's permissions
  *
  * @param {Object} targetUserId Id of user to update
  * @param {Array} roles User's new permissions
  */
  name: 'Users.methods.assignRole',

  validate: new SimpleSchema({
    user_id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    roles: {
      type: Array,
    },
    'roles.$': String,
  }).validator(),

  run({ roles, user_id }) {
    this.unblock();
    const loggedInUser = Meteor.user()
    if (!loggedInUser || !Roles.userIsInRole(loggedInUser,
      ['admin'] )) {
      throw new Meteor.Error(403, "Access denied")
    }
    if (Meteor.isServer) {
      Roles.addUsersToRoles( user_id, roles );
      return true;
    }
  }
});

export const userUnassignRole = new ValidatedMethod({
  /**
  * update a user's permissions
  *
  * @param {Object} targetUserId Id of user to update
  * @param {Array} roles User's new permissions
  */
  name: 'Users.methods.unassignRole',

  validate: new SimpleSchema({
    user_id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    role: {
      type: String,
    }
  }).validator(),

  run({ role, user_id }) {
    this.unblock();
    const loggedInUser = Meteor.user()
    if (!loggedInUser || !Roles.userIsInRole(loggedInUser,
      ['admin'] )) {
      throw new Meteor.Error(403, "Access denied")
    }
    if (Meteor.isServer) {
      Roles.removeUsersFromRoles( user_id, role );
      return true;
    }
  }
});

export const userRemove = new ValidatedMethod({
  /**
  * update a user's permissions
  *
  * @param {Object} targetUserId Id of user to update
  * @param {Array} roles User's new permissions
  */
  name: 'Users.methods.remove',

  validate: new SimpleSchema({
    user_id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),

  run({ user_id }) {
    this.unblock();
    const loggedInUser = Meteor.user()
    if (!loggedInUser || !Roles.userIsInRole(loggedInUser,
      ['admin'] )) {
      throw new Meteor.Error(403, "Access denied")
    }
    if (Meteor.isServer) {
      return Meteor.users.remove({ _id: user_id })
    }
  }
});

export const userSendResetPasswordEmail = new ValidatedMethod({
  /**
  * update a user's permissions
  *
  * @param {Object} targetUserId Id of user to update
  * @param {Array} roles User's new permissions
  */
  name: 'Users.methods.sendResetPasswordEmail',

  validate: new SimpleSchema({
    user_id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),

  run({ user_id }) {
    this.unblock();
    const loggedInUser = Meteor.user()
    if (!loggedInUser || !Roles.userIsInRole(loggedInUser,
      ['admin'] )) {
      throw new Meteor.Error(403, "Access denied")
    }
    if (Meteor.isServer) {
      Accounts.sendResetPasswordEmail(user_id);
      return true
    }
  }
});
