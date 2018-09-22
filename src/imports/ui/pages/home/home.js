import '../../components/search/search.js';
import './home.html';
import '../../helpers';
import { counter, currentDate } from '../../../api/stats/methods.js';
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

  var self = this;

  self.currentDate = new ReactiveVar();

  // self.autorun(() => {
    currentDate.call((error, result) => {
      if (error) {
        console.log(error.reason);
      }
      if (result) {
        var currentDate = {
          orgsDate: result[0][0].lastModified,
          contractsDate: result[1][0].date
        };
        self.currentDate.set(currentDate);
      }
      
    });
  // })
});

Template.Home.helpers({
  currentDate: function() {
    return Template.instance().currentDate.get();
  }
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
        contracts: result[3]
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
          contracts: result[3]
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
    // if (Template.Home){
      $('nav').removeClass("shrink");
      $('nav').removeClass("fixed-nav");
    // }
  });
});

Template.Home.events({
  'click #first-search': function (event, template) {
    let url =  template.$('ul.suggestions li a').first().attr("href");
       if (url)
        window.location.href = url;
       else {
        //TODO: Explicarle al usuario que no lo podemos llevar a ningun lado hasta que no haya ningún resultado.
       }
  },
});
