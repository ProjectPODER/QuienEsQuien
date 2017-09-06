import { UploadFs } from 'meteor/jalik:ufs';
import { ImagesStore, FilesStore } from '../../../api/images/images.js';
import { extend } from 'lodash';
import './upload.html';

Template.upload.events({
    'click button[name=upload]': function (ev, template) {
        let self = template;
        const user = Meteor.user();
        console.log(user);
        const flow = $('#user-import-options select').val();
        const storeId = template.data.store;
        console.log(storeId);
        const docId = template.data.docId;
        UploadFS.selectFiles(function (file) {
            // Prepare the file to insert in database, note that we don't provide an URL,
            // it will be set automatically by the uploader when file transfer is complete.
            let fileMetaData = {
                name: file.name,
                size: file.size,
                type: file.type
            };
            // we only have a docId on profileImages
            if (docId) {
              extend(fileMetaData, { docId: docId })
            }

            if (flow) {
              // we only have flow on Imports
              extend(fileMetaData, { flow: flow })
            }
            // Create a new Uploader for this file
            let upload = new UploadFS.Uploader({
                // This is where the uploader will save the file
                store: storeId,
                // Optimize speed transfer by increasing/decreasing chunk size automatically
                adaptive: true,
                // Define the upload capacity (if upload speed is 1MB/s, then it will try to maintain upload at 80%, so 800KB/s)
                // (used only if adaptive = true)
                capacity: 0.8, // 80%
                // The size of each chunk sent to the server
                chunkSize: 8 * 1024, // 8k
                // The max chunk size (used only if adaptive = true)
                maxChunkSize: 128 * 1024, // 128k
                // This tells how many tries to do if an error occurs during upload
                maxTries: 5,
                // The file data
                data: file,
                // The document to save in the collection
                file: fileMetaData,
                // The error callback
                onError: function (err) {
                    console.error(err);
                },
                onAbort: function (file) {
                    console.log(file.name + ' upload has been aborted');
                },
                onComplete: function (file) {
                    console.log(file.name + ' has been uploaded');
                },
                onCreate: function (file) {
                    console.log(file.name + ' has been created with ID ' + file._id);
                },
                onProgress: function (file, progress) {
                    console.log(file.name + ' ' + (progress*100) + '% uploaded');
                },
                onStart: function (file) {
                    console.log(file.name + ' started');
                },
                onStop: function (file) {
                    console.log(file.name + ' stopped');
                },
            });

            // Starts the upload
            upload.start();

        });
    }
});
