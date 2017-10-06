import { isEmpty, isArray } from 'lodash';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Template } from 'meteor/templating';
import { Notifications } from 'meteor/gfk:notifications';
import i18n from 'meteor/universe:i18n';
import Memberships from '../../../api/memberships/memberships';
import '../../components/spin/spinner.html';
import './memberships.html';

const LIMIT = 1000;

AutoForm.hooks({
  updateMembershipForm: {
    after: {
      'method-update': function(error, result) {
        if (error){
          Notifications.error('Error', error.message);
        }
        if (result){
          Notifications.success(i18n.__('success'), i18n.__("membership successfully updated"));
        }
      },
      'method': function(error, result) {
        if (error){
          Notifications.error('Error', error.message);
        }
        if (result){
          Notifications.success(i18n.__("success"), i18n.__("membership successfully created"));
        }
      }
    }
  }
});

function getPubForCollection(collectionName) {
  return (collectionName === 'persons') ? 'membersOfPerson' : 'membersOfOrganization';
}

Template.Memberships.onCreated(function() {
  const self = this;
  self.ready = new ReactiveVar(false);
  self.memberships = new ReactiveVar(false);
  self.board = new ReactiveVar(false);
  self.shares = new ReactiveVar(false);
  self.shareholders = new ReactiveVar(false);
  self.limit = new ReactiveVar(10);
  self.autorun(() => {
    const data = Template.currentData();
    const pub = getPubForCollection(data.collectionName());
    const sub = self.subscribe(pub, data.simple,
      self.limit.get(), {
        onReady() {
          self.board.set(data.board());
          self.shares.set(data.shares());
          if (data.collectionName() === 'organizations') {
            self.shareholders.set(data.shareholders());
          }
          if (self.limit.get() < LIMIT) {
            self.limit.set(LIMIT);
          }
        },
      });
    self.ready.set(sub.ready());
  });
});

Template.editMemberships.onCreated(function() {
  const self = this;
  self.ready = new ReactiveVar(false);
  self.memberships = new ReactiveVar(false);
  self.limit = new ReactiveVar(10);
  self.autorun(() => {
    const data = Template.currentData().doc;
    const pub = getPubForCollection(data.collectionName());
    const sub = self.subscribe(pub, data.simple,
    self.limit.get(), {
      onReady() {
        self.memberships.set(data.allMemberships());
        if (self.limit.get() < LIMIT) {
          self.limit.set(LIMIT);
        }
      },
    });
    self.ready.set(sub.ready());
  });
});

Template.Memberships.helpers({
  ready() {
    return Template.instance().ready.get();
  },
  board() {
    return Template.instance().board.get();
  },
  shares() {
    return Template.instance().shares.get();
  },
  shareholders() {
    return Template.instance().shareholders.get();
  },
  isOrganization() {
    return (Template.instance().data.collectionName() === 'organizations');
  },
  isPerson() {
    return (Template.instance().data.collectionName() === 'persons');
  },
  isEmpty(array) {
    if (isArray(array)) {
      return isEmpty(array);
    }
    return isEmpty(array.fetch());
  },
});

Template.editMemberships.helpers({
  ready() {
    return Template.instance().ready.get();
  },
  memberships() {
    return Template.instance().memberships.get()
  },
  membershipsCollection() {
    return Memberships;
  },
  personMembershipsSchema() {
    return Memberships.simpleSchema()
  .omit('source', 'person', 'person_id', 'org', 'org_id', 'user_id', 'sob_org')
  },
  isEmpty(array) {
    if (isArray(array)) {
      return isEmpty(array);
    }
    return isEmpty(array.fetch());
  },
});
