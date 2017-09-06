import './dropzone.html';

Template.dropzone.onRendered(function () {
  // Use the Packery jQuery plugin
  this.$('#dropzone').on(
    'dragover',
    function(e) {
        e.preventDefault();
        e.stopPropagation();
    }
  );
  this.$('#dropzone').on(
    'dragenter',
    function(e) {
        e.preventDefault();
        e.stopPropagation();
    }
  );
  this.$('#dropzone').on(
      'drop',
      function(e){
          if(e.originalEvent.dataTransfer){
            console.log('dropped');
              if(e.originalEvent.dataTransfer.files.length) {
                  e.preventDefault();
                  e.stopPropagation();
                  var reader = new FileReader();
                  let file = e.originalEvent.dataTransfer.files[0];
                  reader.onload = function(e) {
                    console.log('call meteor');
                    Meteor.call('fileUpload', file.name, reader.result, function(error, result) {
                      if (error)
                        return Notifications.error('Error', error);
                    });
                  }
                  reader.readAsBinaryString(file);
              }
          }
      }
  );
});
