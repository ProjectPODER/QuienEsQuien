import { AutoForm } from 'meteor/aldeed:autoform';
import { DocHead } from 'meteor/kadira:dochead';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';
import i18n from 'meteor/universe:i18n';
import { Notifications } from 'meteor/gfk:notifications';
import { Persons } from '../../../api/persons/persons.js';
import Memberships from '../../../api/memberships/memberships.js';
import {ContractsOCDS} from '../../../api/contracts_ocds/contracts_ocds.js';
// import {contractsMinMax}  from '../../../api/contracts/methods.js';
import '../../components/memberships/memberships.js';
import '../../components/visualizations/viz.js';
import '../../components/similar/similar.js';
import '../../components/history/history.js';
// import '../../components/contracts/contracts.js';
import '../../components/detail/detail.js';
import '../../components/image/image.js';
import '../../components/upload/upload.js'
import '../../components/subscribe/subscribe.js';
import './persons.html';

AutoForm.hooks({
  updatePersonForm: {
    after: {
      'method-update': function(error, result) {
        if (error){
          Notifications.error('Error', error.message);
        }
        if (result){
          Notifications.success(i18n.__('success'), i18n.__("person successfully updated"));
        }
      },
      'method': function(error, result) {
        if (error){
          Notifications.error('Error', error.message);
        }
        if (result){
          Notifications.success(i18n.__("success"), i18n.__("person successfully created"));
        }
      }
    }
  }
});

Template.showPersonWrapper.onCreated(function () {
  const self = this;

  self.person = new ReactiveVar(false);
  self.contracts = new ReactiveVar(false);
  self.contracts_summary = new ReactiveVar(false);
  self.memberships = new ReactiveVar(false);
  self.ready = new ReactiveVar(false);

  const id = FlowRouter.getParam('_id');
  DocHead.setTitle(`QuienEsQuien.wiki - ${id}`);

  const handle = self.subscribe('person', id, {
    onReady() {
      const person = Persons.findOne({
        $or: [{ _id: id }, { simple: id }, { name: id }, { names: id }],
      });
      Session.set('currentDocumentId', person._id);
      self.person.set(person);
    },
  });
  const handlec = self.subscribe('contracts-by-supplier-ocds', id, {
    onReady() {
      console.log("onready");
      const contracts = ContractsOCDS.find({
        $or: [{ "contracts.0.supplies": id }],
      }, {limit: 3});
      self.contracts.set(contracts.fetch());
      console.log(self.contracts.get())

      self.ready.set(handlec.ready());
    },
  });

  const handlem = self.subscribe('memberships', id, {
    onReady() {
      const memberships = Memberships.find({
        $or: [{ sob_org: id }, { person_id: id }],
      });

      self.memberships.set(memberships.fetch());
      self.ready.set(handlem.ready());
    },
  });
});

Template.showPersonWrapper.onRendered(function() {
  const self = this;
  self.autorun(function() {
    if (self.ready.get() == true) {
      Template.loading.onRendered(function() {
        console.log("hide",$(".loading-container"));
        $(".loading-container").hide();
      });
    }
    else {
      Template.loading.onRendered(function() {
        console.log("show",$(".loading-container"));
        $(".loading-container").show();
      });
    }
  })

})

Template.showPersonWrapper.helpers({
  ready: function() {
    return Template.instance().ready.get();
  },
  contracts: function() {
    return Template.instance().contracts.get();
  },
  // total_contract_amount: function() {
  //   return Template.instance().contracts_summary.get()["amount_max"];
  // },
  memberships: function() {
    return Template.instance().memberships.get();
  },
  selectedPersonDoc: function() {
    var person = Template.instance().person.get();
    person.collection = 'persons';
    person.document = person;
    person.names = [person.name];
    return person;
  },

});

Template.person_update_form.helpers({
  personsCollection: function() {
    return Persons
  }
});
