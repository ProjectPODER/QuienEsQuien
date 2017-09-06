import i18n from 'meteor/universe:i18n';

Template.HistoryWrapper.onCreated(function() {
  this.revisions= new ReactiveVar;
  var revisions = Orgs.find({},{fields: {revisions: 1, source: 1, 'description_data.name': 1}, limit: 10}).map(function(org){
    org.collection = 'org';
    org.name = org.description_data.name;
    delete org.description_data;
    return org;
  })
    .concat(Persons.find({},{fields: {revisions: 1, source: 1, name: 1}, limit: 10}).map(function(person){
      person.collection = 'person';
      return person;
    }));
  this.revisions.set(revisions);
})

Template.HistoryWrapper.helpers({

  revisions: function() {
    return Template.instance().revisions.get();
  },

  orgsRevisions: function() {
    var revs = Template.instance().revisions.get();
    return _.filter(revs, function(obj){
       return (obj.collection === 'org')
    });
  },

  personsRevisions: function() {
    var revs = Template.instance().revisions.get();
    return _.filter(revs, function(obj){
       return (obj.collection === 'person')
    });
  },

  tabs: function () {
    // Every tab object MUST have a name and a slug!
    return [
      { name: i18n.__('All'), slug: 'all' },
      { name: i18n.__('Orgs'), slug: 'orgs' },
      { name: i18n.__('Persons'), slug: 'persons' },
    ];
  },
  activeTab: function () {
    return Session.get('activeTab'); // Returns "people", "places", or "things".
  }

})
