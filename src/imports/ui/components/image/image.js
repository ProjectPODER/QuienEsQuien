import { Images, Thumbnails } from '../../../api/images/images.js';
import '../../components/upload/upload.js';
import './image.html';

function imageExists(url, callback) {
  var img = new Image();
  img.onload = function() { callback(true); };
  img.onerror = function() { callback(false); };
  img.src = url;
}

Template.ProfileImage.onCreated(function() {
  let self = this;

  self.ready = new ReactiveVar(false);
  self.imageUrlExists = false;
  imageExists(self.data.imageUrl, exists => {
    if (exists) {
      self.ready.set(true);
      self.imageUrlExists = true;
    } else {
      self.autorun(() => {
        let id = self.data.docId;
        Meteor.subscribe('image', id);
        const images = Images.find({docId: id}).count();
        if (images > 0) {
          // thumbnail publicstion expects at least one image
          const sub = self.subscribe('thumbnail', id);
          self.ready.set(sub.ready());
        } else {
          self.ready.set(true);
        }
      });
    }
  })
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
  imageUrlExists: function() {
    return Template.instance().imageUrlExists;
  },
  thumb: function() {
    return Thumbnails.findOne({originalId: this._id});
  }
});
