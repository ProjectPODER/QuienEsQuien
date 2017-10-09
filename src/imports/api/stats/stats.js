import { Mongo } from 'meteor/mongo';

const Stats = new Mongo.Collection("statistics");

Stats.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

export default Stats;
