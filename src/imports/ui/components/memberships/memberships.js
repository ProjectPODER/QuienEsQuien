import { isEmpty, isArray } from 'lodash';
import { Template } from 'meteor/templating';
import { Orgs } from '../../../api/organizations/organizations';
import { Persons } from '../../../api/persons/persons';
import '../../components/spin/spinner.html';
import './memberships.html';

const LIMIT = 1000;

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
    const id = data._id;
    const collection = self.data.collection;
    let sub;
    if (collection === 'orgs') {
      sub = self.subscribe('membersOfOrganization', self.data.simple,
      self.limit.get(), {
        onReady() {
          const doc = Orgs.findOne(id);
          self.board.set(doc.board());
          self.shares.set(doc.shares());
          self.shareholders.set(doc.shareholders());
          if (self.limit.get() < LIMIT) {
            self.limit.set(LIMIT);
          }
        },
      });
    }
    if (collection === 'persons') {
      sub = self.subscribe('membersOfPerson', self.data.simple,
      self.limit.get(), {
        onReady() {
          const doc = Persons.findOne(id);
          self.board.set(doc.board());
          self.shares.set(doc.shares());
          if (self.limit.get() < LIMIT) {
            self.limit.set(LIMIT);
          }
        },
      });
    }
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
    return (Template.instance().data.collection === 'orgs');
  },
  isPerson() {
    return (Template.instance().data.collection === 'persons');
  },
  isEmpty(array) {
    if (isArray(array)) {
      return isEmpty(array);
    }
    return isEmpty(array.fetch());
  },
});
