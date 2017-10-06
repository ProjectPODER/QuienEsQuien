import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import PersonSchema from './schema';
import { Persons } from './persons';

export const personInsert = new ValidatedMethod({
  name: 'Persons.methods.insert',
  validate(document){
     PersonSchema.clean(document);
     PersonSchema.validator(document);
  },
  run(document) {
    return Persons.insert(document);
  }
});

export const personUpdate = new ValidatedMethod({
  name: 'Persons.methods.update',
  validate(args){
     PersonSchema.validator(args.modifier, { modifier: true });
  },
  run({ _id, modifier }) {
    return Persons.update({
      _id: _id
    }, modifier );
  }
});

export const getPerson = new ValidatedMethod({
  name: 'Persons.methods.get',

  validate: new SimpleSchema({
    simple: {
      type: String,
      max: 200,
    },
  }).validator(),

  run({ simple }) {
    this.unblock();
    return Persons.findOne({ simple });
  },
});
