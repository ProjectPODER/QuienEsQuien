import moment from 'moment';
import { AutoForm } from 'meteor/aldeed:autoform';
import { DocHead } from 'meteor/kadira:dochead';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import i18n from 'meteor/universe:i18n';
import { Notifications } from 'meteor/gfk:notifications';
import { Persons } from '../../../api/persons/persons.js';
import { Orgs } from '../../../api/organizations/organizations.js';
import '../../helpers.js';
import '../../components/memberships/memberships.js';
import '../../components/visualizations/viz.js';
import '../../components/similar/similar.js';
import '../../components/history/history.js';
import '../../components/contracts/contracts.js';
import '../../components/detail/detail.js';
import '../../components/image/image.js';
import { prepareSubArray } from '../../components/visualizations/relations.js';
import '../../components/upload/upload.js'
import './persons.html';

const LIMIT = 1000;

AutoForm.hooks({
  updatePersonForm: {
    after: {
      'method-update': function(error, result) {
        if (error){
          Notifications.error('Error', error);
        }
        if (result>0){
          Notifications.success(i18n.__('success'), i18n.__("person successfully updated"));
        }
      },
      'method': function(error, result) {
        if (error){
          Notifications.error('Error', error);
        }
        if (result){
          Notifications.success(i18n.__("success"), i18n.__("person successfully created"));
        }
        Session.set('activeTab', 'read');
        FlowRouter.go(`/persons/${result}#read`);

      }
    }
  }
});

Template.showPersonWrapper.onCreated(function showPersonWrapperCallback() {
  const self = this;

  self.person = new ReactiveVar(false);
  self.ready = new ReactiveVar(false);

  self.autorun(() => {
    const id = FlowRouter.getParam('_id');
    DocHead.setTitle(`QQW - ${id}`);
    const handle = self.subscribe('person', id, {
      onReady() {
        const person = Persons.findOne({
          $or: [{ _id: id }, { simple: id }, { name: id }, { names: id }],
        });
        Session.set('currentDocumentId', person._id);
        self.person.set(person);
      },
    });
    self.ready.set(handle.ready());
  });
});

Template.showPersonWrapper.helpers({
  ready: function() {
    return Template.instance().ready.get();
  },
  selectedPersonDoc: function() {
    var person = Template.instance().person.get();
    person.collection = 'persons';
    return person;
  }

})

Template.person_update_form.helpers({
  personsCollection: function() {
    return Persons
  }
});
