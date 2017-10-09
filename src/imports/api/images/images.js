import im from 'imagemagick-stream';
import { UploadFS } from 'meteor/jalik:ufs';
import { Logger } from 'meteor/ostrio:logger';
import { logUserAction } from '../users/users.js';

const log = new Logger();
UploadFS.config.https = true;

export const Images = new Mongo.Collection('images');
export const Thumbnails = new Mongo.Collection('thumbnails');
export const Files = new Mongo.Collection('files');

const perms = new UploadFS.StorePermissions({
    insert: function (userId) {
        return userId;
    },
    update: function (userId, doc) {
        return userId === doc.userId;
    },
    remove: function (userId, doc) {
        return userId === doc.userId;
    }
});

export const ImagesStore = new UploadFS.store.GridFS({
    collection: Images,
    name: 'images',
    chunkSize: 1024 * 255,
    permissions: perms,
    filter: new UploadFS.Filter({
      minSize: 10,
      maxSize: 1024 * 1000 * 5, // 5MB,
      contentTypes: ['image/*'],
      extensions: ['jpg', 'png']
    }),
    copyTo: [
      new UploadFS.store.GridFS({
          collection: Thumbnails,
          name: 'thumbnails',
          permissions: perms,
          transformWrite: function(readStream, writeStream) {
            var resize = im().resize('192x192').quality(80);
            readStream.pipe(resize).pipe(writeStream);
          }
      })
    ]
});

export const FilesStore = new UploadFS.store.GridFS({
    collection: Files,
    name: 'files',
    chunkSize: 1024 * 255,
    permissions: perms,
    filter: new UploadFS.Filter({
      minSize: 10,
      maxSize: 1024 * 1000 * 10, // 10MB,
      contentTypes: ['text/csv'],
      extensions: ['csv', 'txt']
    }),

    // Called when a write error happened
    onWriteError: function (err, fileId, file) {
      log.error(`Cannot write ${file.name}`);
    }
});


Images.after.update(function (userId, doc) {
  // save revision

  logUserAction( userId, 'update', doc._id, doc.name, 'images' );

});

Images.after.insert(function (userId, doc) {

  logUserAction( userId, 'insert', doc._id, doc.name, 'images');

});

Images.after.remove(function (userId, doc) {

  logUserAction( userId, 'remove', doc._id, doc.name, 'images');

});

Files.after.update(function (userId, doc) {
  // save revision

  logUserAction( userId, 'update', doc._id, doc.name, 'files' );

});

Files.after.insert(function (userId, doc) {

  logUserAction( userId, 'insert', doc._id, doc.name, 'files');

});

Files.after.remove(function (userId, doc) {

  logUserAction( userId, 'remove', doc._id, doc.name, 'files');

});
