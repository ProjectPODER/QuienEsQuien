import Papa from 'papaparse';
import { bmv_import_scheme } from './bmv.js'
import { upsertObject } from '../../lib.js';
import { update_tmp_stats } from '../../stats/lib.js';

export const parseCsv = function (data, userId, callback) {

  let secondIteration = false;
  let testing = false;

  Papa.parse(data, {
    delimiter: ",",
    header: true,
    encoding: "ISO-8859-1",
    dynamicTyping: true,
    skipEmptyLines: true,

    step: function(row, parser) {
      if (row.error){Notifications.error(row.error)}

      Meteor.sleep(300);
      let parsed = bmv_import_scheme(row.data.map(function(obj){
        obj.userId = userId;
        return obj;
      }));

      let r = row.data[0];

      if (Meteor.isTest) {
        testing = r
        testing.name = r['Legal Name'],
        testing.competitors = r['Total Competitors'],
        testing.top_holders = r['Total Top Holders'],
        testing.members = r['Total Current Board Members']
      }

    },

    error: function(error, file) {
  		// executed if an error occurs while loading the file,
  		// or if before callback aborted for some reason
      Notifications.error(error);
      return error;
  	},

    complete: function() {
      if (secondIteration) return;

      console.log('import complete');
      callback && callback(testing);
      secondIteration = true;

      return true;
    }
  });
}
