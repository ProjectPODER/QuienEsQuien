import { Images, Thumbnails } from '../../../api/images/images.js';
import '../../components/upload/upload.js';
import './image.html';

Template.ProfileImage.onCreated(function() {
  let self = this;

  self.ready = new ReactiveVar();
  self.autorun(() => {
    let id = self.data.docId;
    Meteor.subscribe('image', id);
    let images = Images.find({ docId: id }).count();
    if (images > 0) {
      let sub = Meteor.subscribe('thumbnail', id);
      self.ready.set(sub.ready());
    }
  });
});

Template.ProfileImage.helpers({
  ready: function() {
    return Template.instance().ready.get()
  },
  completed: function() {
    return Math.round(this.progress * 100);
  },
  image: function(docId) {
    return Images.findOne({ docId: docId });
  },
  thumb: function() {
    return Thumbnails.findOne({originalId: this._id});
  }
});
