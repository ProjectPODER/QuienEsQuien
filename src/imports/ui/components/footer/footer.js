import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import i18n from 'meteor/universe:i18n';
import './footer.html';

Template.footer.onRendered(function() {
  /*var hash = window.location.hash;
	  if ($(hash).length) {  // if hash exists on page
	    $('html,body').animate({
	      scrollTop: $(hash).offset().top
	    }, 200);
	  }*/
	//Code to link to anchor hashes within a page
    var scrollToHash = function  (hash, time) {
      hash = window.location.hash;
      time = time || 200;

      // If the link goes to the same (home) page
      if (hash == '/') {
        $('body').animate({
          scrollTop: 0
        }, time);  
      }
      else if ($(hash).length) {
        $('body').animate({
          scrollTop: $(hash).offset().top
        }, time);
      }
      else {
        $('body').animate({
          scrollTop: 0
        }, time);
      }
    };
    return(scrollToHash);
});