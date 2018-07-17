import '../../components/search/search.js';
import './home.html';
import counter from '../../../api/stats/methods.js';
import { Feeds, FeedEntries } from '../../../api/feeds.js';

Template.Home.onCreated(function() {

  import("./jquery.scrollme.js").then(() => {
    $(window).scroll(function() {
      if ($(document).scrollTop() > 500) {
        $('#navbar').addClass('shrink');
      } else {
        $('#navbar').removeClass('shrink');
      }
    });

    $(window).scroll(function() {
      if ($(document).scrollTop() > 10) {
        $('logo').addClass('shrink');
      } else {
        $('logo').removeClass('shrink');
      }
    });
  });
});

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
});


Template.investigaciones.helpers({
  feed() {
    Meteor.subscribe('feed_entries');
    var rc = FeedEntries.find({},{ limit: 3});
    // console.log(rc.fetch())
    return rc.fetch();
  }
});

Template.Home.onRendered(function() {
  $(document).ready(function () {
    if (Template.Home){
      $('#navbar').removeClass("shrink");
      $('#navbar').removeClass("fixed-nav");
    }
  });
  scrollme.init();
});

Template.Home.events({
  'click #first-search': function (event, template) {
    window.location.href = template.$('ul.suggestions li a').first().attr("href");
  },
});

