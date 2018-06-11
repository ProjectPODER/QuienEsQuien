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
});

Template.contracts_fundation.helpers({
  contracts_fundation: function(item) {
    if (item.contract_count == undefined ){
      return true;
    } 
    else {
      return false;
    }
  }
});

Template.summary_data.helpers({
  industry_type_key: function(item) {
    if (item.company.classification > 0 || item.type > 0 || item.company.tickers > 0){
      return true;
    } 
    else {
      return false;
    }
  }
});

Template.Orgs.onCreated(function() {
  $(document).ready(function () {    
    $('nav').addClass("fixed-nav");
  });
});  