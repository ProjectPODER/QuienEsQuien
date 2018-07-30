import '../components/nav/nav.js';
import '../components/search/search.js';
import '../components/header/header.html';
import '../components/footer.html';
import '../components/spin/spinner.html';
import './app-body.html';
// import '../../../node_modules/bootstrap-tooltip-popover/src/tooltip.js';


Meteor.startup(function(){
  for(var property in Template){
    // check if the property is actually a blaze template
    if(Blaze.isTemplate(Template[property])){
      var template=Template[property];
      // assign the template an onRendered callback
      template.onRendered(function(){
        // $('[data-toggle="tooltip"]').tooltip({placement: 'right'});
        $('nav').addClass('fixed-nav');
        $('.owl-carousel').owlCarousel({
            // center: true,
            items:3,
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
                    items:3
                },
                992:{
                    items:2
                },
                300:{
                    items:1
                },
                0:{
                    items:1
                }
            }
        });
      });
    }
  }
});
