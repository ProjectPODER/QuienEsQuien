import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
import { CollectionHooks } from 'meteor/matb33:collection-hooks';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { flushTmp } from '../tmp/lib';
import { cargografiasSchema, NAICMSchema } from './schema';

if (Meteor.isServer) {
//  import { resetTemporaryCollections, flushTemporaryCollections } from './server';
}

export const resetTemporary = new ValidatedMethod({
  name: 'Parse.methods.resetTemporaryCollections',
  validate: new SimpleSchema(
    { reset: { type: Boolean } },
  ).validator(),

  run({ reset }) {
    if (Meteor.isServer && reset) {
      import { resetTemporaryCollections } from './server';

      console.log('reset temporary collections');
      return resetTemporaryCollections();
    }
    return null;
  },
});

export const flushCollections = new ValidatedMethod({
  name: 'Parse.methods.flush',
  validate: new SimpleSchema(
    { flush: { type: Boolean } },
  ).validator(),

  run({ flush }) {
    const userId = Meteor.userId();

    if (Meteor.isServer && flush) {
      import { flushTemporaryCollections } from './server';

      Meteor.setTimeout(() => {
        console.log('flush temporary collections');
        CollectionHooks.defaultUserId = userId;
        flushTemporaryCollections(userId);
      }, 500);
    }
  },
});

export const importCargografias = new ValidatedMethod({
  name: 'Parse.methods.importCargografias',
  validate: new SimpleSchema({
    csvData: {
      type: cargografiasSchema,
    },
  },
  ).validator(),

  run({ csvData }) {
    if (Meteor.isServer) {
      import { cargografiasImportRow } from './server/cargografias';

      return cargografiasImportRow(csvData);
    }
    return null;
  },
});

export const importNAICM = new ValidatedMethod({
  name: 'Parse.methods.NAICM',
  validate: new SimpleSchema({
    csvData: {
      type: NAICMSchema,
    },
  },
  ).validator(),

  run({ csvData }) {
    if (Meteor.isServer) {
      import { NAICMImportRow, genericDataFormat } from './server/gacm';

      const data = genericDataFormat(csvData);
      return NAICMImportRow(data);
    }
    return null;
  },
});

Meteor.methods({

  fileUpload: function(name, data) {
    check(name, String);
    check(data, String);

    let user = this.userId;

    console.log("received file");
    let ext = name.split('.')[1];

    if ( ext === 'csv' ) {
      Meteor.defer(function(){
        if (Meteor.isServer) {
          import { parseCsv } from './server/csv.js';
        }
        parseCsv(data, user, function(){
          console.log('Finished parsing data');

          Meteor.defer(function(){
            flushTmp(user);
          })

        })

      })
    }
  },
  parseUpload(csvData) {
    check(csvData, Array);
    console.log('recieved data');
    const userId = Meteor.userId();

    resetTemporaryCollections();
    for (let i = 0; i < csvData.length; i += 1) {
      const data = genericDataFormat(csvData[i]);
      gacmImportRow(data, userId);
    }

    Meteor.setTimeout(() => {
      console.log('flush temporary collections');
      flushTemporaryCollections(userId);
    }, 500);
  },
});
