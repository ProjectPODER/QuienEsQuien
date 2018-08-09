import '../components/nav/nav.js';
import '../components/search/search.js';
import '../components/header/header.html';
import '../components/footer/footer.js';
import '../components/spin/spinner.html';
import './app-body.html';
// import '../../../node_modules/bootstrap-tooltip-popover/src/tooltip.js';


Meteor.startup(function(){
  for(var property in Template){
    // check if the property is actually a blaze template
    if(Blaze.isTemplate(Template[property])){
      var template=Template[property];
      // assign the template an onCreated callback
      template.onCreated(function(){
        // $('[data-toggle="tooltip"]').tooltip({placement: 'right'});
        $('nav').addClass('fixed-nav');
      });
      template.onRendered(function() {
          $('.owl-carousel').owlCarousel({
            // center: true,
            items:1,
            loop:true,
            margin:0,
            dots:false,
            nav:true,
            navText:['<','>'],
            autoplay:true,
            autoplayTimeout:3000,
            autoplayHoverPause:true,
            responsive:{
                1042:{
                    items:1
                },
                992:{
                    items:1
                },
                300:{
                    items:1
                },
                0:{
                    items:1
                }
            }
        });
        // Code to link to anchor hashes within a page
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
                console.log(scrollToHash);
              }
              else {
                $('body').animate({
                  scrollTop: 0
                }, time);
              }
            };
      });
    }
  }
});

