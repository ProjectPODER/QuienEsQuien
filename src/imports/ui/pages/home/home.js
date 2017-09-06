import '../../components/search/search.js';
import './home.html';
import { counter } from '../../../api/stats/methods.js';

Template.counters.onCreated(function() {
  var self = this;

  self.counter = new ReactiveVar();

  counter.call((error, result) => {
    if (error) {
      console.log(error.reason);
    }
    if (result) {
      var counter = {
        orgs: result[0],
        persons: result[1],
        contracts: result[2]
      };
      self.counter.set(counter);
    }

  });
  //poor mans reactivity
  setInterval(function () {
    counter.call((error, result) => {
      if (error) {
        console.log(error.reason);
      }
      if (result) {
        var counter = {
          orgs: result[0],
          persons: result[1],
          contracts: result[2]
        };
        self.counter.set(counter);
      }

    });

  }, 1000 * 10);

});

Template.counters.helpers({
  counter: function() {
    return Template.instance().counter.get();
  }
})
