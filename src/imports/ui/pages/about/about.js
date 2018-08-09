import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import i18n from 'meteor/universe:i18n';
import './about.html';
// import jquery from 'jquery.easing';

Template.acerca_de.onRendered(function() {
  var hash = window.location.hash;
      if ($(hash).length) {  // if hash exists on page
        $('html,body').animate({
          scrollTop: $(hash).offset().top - 90
        }, 200);
      };
  
  /*$('a.anchor-scroll[href*=\\#]').on('click', function(event){     
    event.preventDefault();
    $('html,body').animate({scrollTop:$(this.hash).offset().top - 90 }, 200);
  });*/
});