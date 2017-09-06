import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Orgs } from '../../../api/organizations/organizations.js';
import './organizations.html';

Template.Orgs.events({
  'click .reactive-table tbody tr': function (event, template) {
    event.preventDefault();
    Session.set('activeTab', 'view');
    const dataTable = $(event.target).closest('table').DataTable();
    const rowData = dataTable.row(event.currentTarget).data();
    FlowRouter.go('/orgs/'+rowData.simple+"#view");
  }
});

Template.Orgs.helpers({

  orgsReady: function() {
    return Template.instance().ready.get();
  }

})
