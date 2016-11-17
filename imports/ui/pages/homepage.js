import './homepage.html';

Template.homepage.onCreated(function() {
  Session.set('userAccess', false)
})

Template.homepage.events({
  'click .toggleUserAccess': function() {
    Session.set('userAccess', !Session.get('userAccess'));
  }
})

Template.homepage.onRendered(function() {
  scrollAnimation();
	$(window).on('scroll', scrollAnimation);
})

function scrollAnimation(){
	//normal scroll - use requestAnimationFrame (if defined) to optimize performance
	(!window.requestAnimationFrame) ? animateSection() : window.requestAnimationFrame(animateSection);
}

function animateSection() {
	var scrollTop = $(window).scrollTop(),
		windowHeight = $(window).height(),
		windowWidth = $(window).width(),
    sectionsAvailable = $('.homepage-section');

  var css ="";

	sectionsAvailable.each(function(){
		var actualBlock = $(this),
      blockOffset = actualBlock.offset().top,
			offset = scrollTop - blockOffset,
      height = actualBlock.height(),
      showing = ((windowHeight - (blockOffset - scrollTop))/height) * 100;

      if (showing >= 0 && showing <= 200) {
        if (showing <= 100) {
          var style = '#' + actualBlock.prop('id') + '::before {filter: grayscale(' + (100 - showing) + '%);}'
          css += style;
        }
        else {
          var style = '#' + actualBlock.prop('id') + '::before {filter: grayscale(' + (showing - 100) + '%);}'
          css += style;
        }
      }
	});

  $('.homepage-scrollFance').html(css);

  checkNavPosition(scrollTop);
}

function checkNavPosition(scrollTop) {
  var anchorTop = $('.homepageNavAnchor').offset().top;
  // Where 60 is the height of the nav
  if (scrollTop + 60 > anchorTop) {
    $('.homepage-nav').addClass('full');
  }
  else {
    $('.homepage-nav').removeClass('full');
  }
}
