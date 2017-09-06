import { Mongo } from 'meteor/mongo';

export const Stats = new Mongo.Collection("statistics");

Stats.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
