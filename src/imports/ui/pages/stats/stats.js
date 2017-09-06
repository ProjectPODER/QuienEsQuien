import moment from 'moment';
import { map, sum } from 'lodash';
import { DocHead } from 'meteor/kadira:dochead';
import { Stats } from '../../../api/stats/stats';
import './stats.html';
import '../../helpers';

Template.Stats.onCreated(function() {
  const self = this;
  DocHead.setTitle('QQW - Stats');

  self.autorun(() => {
    self.subscribe('statistics');
    self.stats = new ReactiveVar(false);
    const stats = Stats.find({}, {
      limit: 10,
      sort: {
        updated_at: -1,
      },
    });
    self.stats.set(stats);
  });
});


Template.Stats.helpers({

  stats() {
    return Template.instance().stats.get();
  },

  date (date) {
    return moment(date).fromNow()
  },

  tmp_docs_count() {
    var stats = Template.instance().stats.get();
    var persons = map(stats.fetch(), 'tmp_docs.length');
    return sum(persons);
  },

  bmv_orgs_count() {
    var stats = Template.instance().stats();
    var orgs = map(stats.fetch(), 'bmv_orgs.length');
    return sum(orgs);
  },

  bmv_persons_count() {
    var stats = Template.instance().stats();
    var persons = map(stats.fetch(), 'bmv_persons.length');
    return sum(persons);
  },
})
