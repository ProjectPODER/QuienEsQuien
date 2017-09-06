import { Images, Thumbnails } from '../images.js';

Meteor.publish("image", function(orgId) {
  check(orgId, String);
  return Images.find({
    orgId: orgId
  });
});

Meteor.publish("thumbnail", function(orgId) {
  check(orgId, String);
  let original = Images.findOne({
    orgId: orgId
  });
  return Thumbnails.find({
    originalId: original._id
  });
});
