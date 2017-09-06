denormalize_persons = function() {
  console.log('denormalize_persons');

  Persons.find({}).forEach(function(doc) {
    Orgs.direct.update({
        'memberships.name': doc.name
      }, {
        $set: {
          'memberships.$.id': doc._id
        }
      }, {
        multi: true
      },
      function(error, result) {
        if (error) console.log(error)

      }
    );
  });

}

denormalize_person = function(doc) {

  var id = doc.insertedId;
  Orgs.direct.update({
      'memberships.name': doc.name
    }, {
      $set: {
        'memberships.$.id': id
      }
    }, {
      multi: true
    },
    function(error, result) {
      if (error) console.log(error)

    }
  );
}
