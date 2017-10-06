import {
  Meteor,
} from 'meteor/meteor';
import {
  DocHead,
} from 'meteor/kadira:dochead';
import {
  SubsManager,
} from 'meteor/thelohoadmin:subs-manager';
import {
  Notifications,
} from 'meteor/gfk:notifications';
import {
  Template,
} from 'meteor/templating';
import {
  flatten,
  uniq,
  union,
  filter,
  map,
  intersection,
} from 'lodash';
import moment from 'moment';
import {
  userLog,
} from '../../../api/users/users';
import '../../components/upload/upload';
import {
  Revisions,
} from '../../../api/revisions/revisions';
import {
  getAllUsers,
  registerUser,
  userAssignRole,
  userUnassignRole,
  userRemove,
  userSendResetPasswordEmail,
} from '../../../api/users/methods';
import '../../components/history/history';
import '../../components/unauthorized/unauthorized';
import './users.html';
import { importScheme } from './import';
import {
  resetTemporary,
} from '../../../api/parse/methods';

const importers = ['NAICM', 'cargografias'];

const userLogSub = new SubsManager({
  cacheLimit: 50
});

Template.userDash.onCreated(function(){
  const self = this;
  DocHead.setTitle('QQW - User Dash');
  self.ready = new ReactiveVar(false);
  self.userData = new ReactiveVar(false);
  self.flow = new ReactiveVar(false);
  self.autorun(() => {
    const userData = Meteor.user();
    if (userData) {
      self.ready.set(true);
    }
    self.userData.set(userData);
  });
});

Template.userDash.helpers({
  userInfo: () => Template.instance().userData.get(),
  ready: () => Template.instance().ready.get(),
  flowHelper(importOptions) {
    const instance = Template.instance();
    return {
      importOptions,
      importFlow: instance.flow.get(),
      onFlowChange(flow) {
        instance.flow.set(flow);
      },
    };
  },
});

Template.userDetails.events({
  'click .js-open-user-admin-modal': function (event, templateInstance) {
    event.preventDefault();
    templateInstance.$('#userAdminModal').modal();
    templateInstance.$(".js-select-role").select2({
      dropdownParent: $("#userAdminModal"),
      theme: 'bootstrap',
      tags: true,
      allowClear: true,
    });
  },
});

Template.import.onCreated(function(){
  const self = this;
  self.flow = new ReactiveVar(false);
  self.options = new ReactiveVar(false);
  self.autorun(() => {
    const userData = Meteor.user();
    if (userData) {
      const inter = intersection(importers, userData.roles);
      self.options.set(inter)
      self.flow.set(inter[0])
    }
  });
})

Template.import.helpers({
  importOptions() {
    return Template.instance().options.get();
  },
  importFlow() {
    return Template.instance().flow.get();
  },
});

Template.import.events({
  'change .js-import-flow-control': function (event, templateInstance) {
    event.preventDefault();
    const flow = $(event.target).val();
    templateInstance.flow.set(flow);
  },
});

Template.uploadCSV.onCreated(function () {
  const self = this;
  self.importing = new ReactiveVar(false);
});

Template.uploadCSV.helpers({
  importing() {
    return Template.instance().importing.get();
  },
});

Template.uploadCSV.events({
  'change [name="uploadCSV"]': function uploadCsvEvent(event, templateInstance) {
    const flow = templateInstance.data.importFlow;
    const file = event.target.files[0];
    templateInstance.importing.set(true);

    if (file) {
      resetTemporary.call({ reset: true }, (error, result) => {
        if (error) {
          Notifications.error(error)
        }
        if (result) {
          console.log('temporary reset!'); // eslint-disable-line no-console
          importScheme(file, flow, templateInstance);
        }
      });
    }
  },
});

Template.userAdminModalBody.onCreated(function() {
  let self = this;
  self.users = new ReactiveVar(false);
  self.roles = new ReactiveVar(false);

  self.autorun(() => {
    getAllUsers.call(( error, result ) => {
      if ( error ) console.log(error); // eslint-disable-line no-console

      if (result) {
        let roles = result.map((user)=>{
          return user.roles;
        })
        .filter((role)=>{
          return (role)
        });

        let options = uniq(flatten(roles))

        self.users.set(result);
        self.roles.set(options);
      }
    });
  });

});

Template.userAdminModalBody.events({
  'submit .js-user-assign-role': function ( event, templateInstance ) {
    event.preventDefault();
    let defaultRoles = templateInstance.roles.get();
    let users = templateInstance.users.get();
    const target = event.target;
    const selected = filter(target.roles.options, 'selected')
    const roles = map(selected, 'value');
    const rowData = $(event.target).parents('tr').data();
    const user_id = rowData.userId;
    defaultRoles = union(defaultRoles, roles);
    const userRoles = union( users[rowData.userIndex].roles, roles );
    users[ rowData.userIndex ].roles = userRoles;

    userAssignRole.call( { roles, user_id }, ( error ) => {
      if (error) {
        Notifications.error(error);
      }

      templateInstance.roles.set( defaultRoles );
      templateInstance.users.set( users );
      $(event.target).val(null);
    });
  },

  'submit .js-user-unassign-role': function ( event, templateInstance ) {
    event.preventDefault();
    let users = templateInstance.users.get();
    const role = event.target.role.value;
    const rowData = $(event.target).parents('tr').data();
    const user_id = rowData.userId;
    const userRoles = users[rowData.userIndex].roles.filter((r)=>{
      return ( r !== role )
    });
    users[ rowData.userIndex ].roles = userRoles;

    userUnassignRole.call( { role, user_id }, ( error ) => {
      if (error) {
        Notifications.error(error)
      }

      templateInstance.users.set( users );

    })
  },

  'click .js-user-remove': function ( event, templateInstance ) {
    event.preventDefault();
    let users = templateInstance.users.get();
    const rowData = $(event.target).parents('tr').data();
    const user_id = rowData.userId;
    users.splice( rowData.userIndex, 1 );

    userRemove.call( { user_id }, ( error ) => {
      if (error) {
        Notifications.error(error)
      }

      templateInstance.users.set( users );
    })
  },

  'click .js-user-reset-pass': function ( event ) {
    event.preventDefault();
    const rowData = $(event.target).parents('tr').data();
    const user_id = rowData.userId;

    userSendResetPasswordEmail.call( { user_id }, ( error, result ) => {
      if (error) {
        Notifications.error(error)
      }

      if (result) {
        Notifications.success('Email Sent');
      }

    })
  }
})

Template.userAdminModalBody.helpers({
  users() {
    return Template.instance().users.get();
  },
  roles() {
    return Template.instance().roles.get();
  },
});


Template.newUserForm.events({
  'submit .new-user-form': function ( event ) {
    event.preventDefault();
    const target = event.target;
    const email = target.newUserEmail.value;
    registerUser.call( { email }, ( error ) => {
      if (error) {
        Notifications.error(error)
      }
    });
  },
});

Template.userLogTmpl.onCreated(function(){
  let self = this;
  self.ready = new ReactiveVar(false);
  self.userLog = new ReactiveVar(false);
  self.autorun(() => {
    let data = Template.currentData();
    let userData = data.userInfo;
    if (userData) {
      let handle = userLogSub.subscribe('userLog', userData._id, {
        onReady: function(){
          let actions = userLog.find({ user_id: userData._id }, {sort:{date: -1}});
          self.userLog.set(actions);
        }
      })
      self.ready.set(handle.ready());
    }

  });

})

Template.userLogTmpl.helpers({
  userLog: () => Template.instance().userLog.get(),

  ready() {
    return Template.instance().ready.get();
  }

});

Template.logEntry.helpers({
  icon(entry) {
    let action = entry.action;
    if (action === 'update'){
      return 'pencil'
    }
    if (action === 'remove'){
      return 'times'
    }
    if (action === 'insert'){
      return 'plus'
    }
    if (action === 'import'){
      return 'upload'
    }
  },
  isFile(string) {
    return ( string === 'files' )
  },
  isOrg(string) {
    return ( string === 'organizations' )
  },
  isPerson(string) {
    return ( string === 'persons' )
  },
  revision() {
    let data = Template.currentData();
    let entry = data.entry;
    return Revisions.findOne({ _id: entry.dId })
  },
  fromNow(date) {
    return moment(date).fromNow();
  },

});
