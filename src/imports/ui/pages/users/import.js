import Papa from 'papaparse';
import {
  Notifications,
} from 'meteor/gfk:notifications';
import {
  importCargografias,
  importNAICM,
  flushCollections,
} from '../../../api/parse/methods';

export default function importScheme(file, flow, templateInstance) {
  let inCount = 0;
  let outCount = 0;

  Papa.parse(file, {
    header: true,
    delimiter: ',',
    step(row, parser) {
      inCount += 1;
      if (flow === 'cargografias') {
        importCargografias.call(
          {
            csvData: row.data[0],
          }, (error, result) => {
          if (error) {
            templateInstance.importing.set(false);
            Notifications.error(error.message);
            templateInstance.$('[name="uploadCSV"]').val('');
            parser.abort();
          }
          if (result) {
            outCount += 1;
          }
        });
      }
      if (flow === 'NAICM') {
        importNAICM.call({
          csvData: row.data[0],
        }, (error, result) => {
          if (error) {
            templateInstance.importing.set(false);
            Notifications.error(error);
            templateInstance.$('[name="uploadCSV"]').val('');
            parser.abort();
          }
          if (result) {
            outCount += 1;
          }
        });
      }
    },
    complete() {
      const handle = Meteor.setInterval(() => {
        if (inCount === outCount) {
          Meteor.clearInterval(handle);
          flushCollections.call({ flush: true }, (error) => {
            if (error) {
              Notifications.error(error);
              templateInstance.importing.set(false);
              templateInstance.$('[name="uploadCSV"]').val('');
            }
            templateInstance.importing.set(false);
          });
        }
      }, 100);
    },
  });
}
