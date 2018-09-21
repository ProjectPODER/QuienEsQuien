import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Orgs } from '../../../api/organizations/organizations.js';
import './organizations.html';

Template.Orgs.onRendered(function() {
  var table = $('#organization-index').DataTable();
  // #myInput is a <input type="text"> element
  // $('.org_name_filter').on( 'keyup', function () {
  //     table.search( this.value ).draw();
  // } );

  $('.search-submit').click(function (event) {
      event.preventDefault();
      table.search($(".org_name_filter").val()).draw();
      return false;
  });
});

Template.Orgs.events({
  'click .reactive-table tbody tr': function (event, template) {
    event.preventDefault();
    Session.set('activeTab', 'view');
    const dataTable = $(event.target).closest('table').DataTable();
    const rowData = dataTable.row(event.currentTarget).data();
    FlowRouter.go('/orgs/'+rowData.simple+"#view");
  },
  'scroll': function(event) {
    console.log(event);
  },
  'change #search-order': function (event,instance) {
    sort_order($(event.target).val(),instance);
  }
});


function sort_order(order,instance) {
  console.log("change #search-order",order,instance);
  let column;
  let direction = "desc";
  switch (order) {
      case "cantidad":
        $("#search-order").val("cantidad");

        column = 5;
        break;
      case "puntaje":
        $("#search-order").val("puntaje");

        column = 3;
        break;
  }
  $("#organization-index").DataTable().order([[column,direction],[5,"desc"]]).draw();
}

Template.Orgs.onRendered(function () {
  //Default order
  if (window.queryParams) {
    if (window.queryParams.sort) {
      if (window.queryParams.sort.replace(/['"]+/g,"")=="score") {
        sort_order("puntaje",this);
      }
    }
  }
});



Template.Orgs.helpers({

  orgsReady: function() {
    return Template.instance().ready.get();
  }

});

Template.score_cell_orgs.helpers({
  format_score(score) {
    return (Number(score)*100).toFixed(2);
  }
});


Template.contracts_fundation.helpers({
  contracts_fundation: function(item) {
    if (item.ocds_contract_count == undefined ){
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
