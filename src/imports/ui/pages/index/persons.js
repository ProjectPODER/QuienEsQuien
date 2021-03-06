import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Persons } from '../../../api/persons/persons.js';
import './persons.html';

Template.Persons.events({
  'click .reactive-table tbody tr': function (event) {
    event.preventDefault();
    Session.set('activeTab', 'view');
    const dataTable = $(event.target).closest('table').DataTable();
    const rowData = dataTable.row(event.currentTarget).data();
    FlowRouter.go('/persons/'+rowData.simple+"#view");
  }
});

Template.Persons.helpers({

  personsReady: function() {
    return Template.instance().ready.get();
  }

})
