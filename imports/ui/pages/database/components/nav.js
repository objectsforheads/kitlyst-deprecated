import './nav.html';

Template.databaseNav.onCreated(function() {
  let self = Template.instance();

  self.searchQuery = new ReactiveVar();
  self.searching   = new ReactiveVar( false );
  this.debounce = null;

  self.autorun( () => {
    self.searching.set(true);
    self.subscribe( 'databaseResults', self.searchQuery.get(), () => {
     setTimeout( () => {
       self.searching.set( false );
     }, 300 );
    });
  });
})

Template.databaseNav.helpers({
  patches() {
    return [
      {
        phase: 'Alpha',
        patches: [
          0.01,0.02,0.03,0.04,0.05,0.06,0.08,0.09,0.1,
          0.11,0.12,0.13,0.14,0.15,0.16,0.17,0.18,0.19,
          0.2,0.21,0.22,0.23,0.24,0.25,0.26,0.27,0.28,0.29,
          0.3,0.31,0.32
        ]
      },
      {
        phase: 'Beta',
        patches: [
          0.33,
          0.42,0.44,0.49,
          0.51,0.53,0.55,0.57,0.59,
          0.6,0.61,0.62
        ]
      },
      {
        phase: 'Release',
        patches: [
          1.63,1.64,1.65,1.66,1.67,1.69,
          1.71,1.73,1.74,1.75,1.76
        ]
      }
    ].reverse()
  },
  patch() {
    return Number(this).toFixed(2);
  },
  searching() {
    return Template.instance().searching.get();
  },
  query() {
    return Template.instance().searchQuery.get();
  },
  results() {
    let results = JSON.parse(JSON.stringify(allCards.find().fetch()));

    // allCards has, as implied, all the cards this page uses
    // we want to filter only for the cards that match our result

    var regex = Template.instance().searchQuery.get().replace(/[-[\]{}()*+?.,\\=!<>^$|#]/g, "\\$&");
    var test = new RegExp(regex, 'gi')

    for (var i = results.length - 1; i >= 0; i--) {

      if (
        !test.test(results[i].name) &&
        !test.test(results[i].race) &&
        !test.test(results[i].description)
      ) {
        results.splice(i,1)
      }
    }

    if ( results.length > 0 ) {
      return results;
    }
    return false;
  }
})

Template.databaseNav.events({
  'mouseenter a[data-option]' (e) {
    $('.show-results').removeClass('.show-results');
    $('.showing').removeClass('showing');
    var option = $(e.currentTarget).attr('data-option');

    $(e.currentTarget).addClass('showing');
    $('.nav-suboptions').addClass('showing');
    $('[data-suboption="' + option + '"]').addClass('showing')
  },
  'mouseleave .database-nav' (e) {
    $('.showing').removeClass('showing');
  },
  'keydown [name="searchDatabase"]' ( event, template ) {
    if (template.debounce) {
      Meteor.clearTimeout(template.debounce);
    }
    template.debounce = Meteor.setTimeout(function() {
      var isWordCharacter = event.key.length === 1;
      var isBackspaceOrDelete = (event.keyCode == 8 || event.keyCode == 46);

      if (isWordCharacter || isBackspaceOrDelete) {
        let value = event.target.value.trim();
        if ( value !== template.searchQuery.get()) {
          template.searchQuery.set(value)
        }
      }
    }, 200);
  },
  'focus [name="searchDatabase"]' (e) {
    $('.nav-search-results').addClass('show-results');
  },
  'click .database-nav' (e) {
    e.stopPropagation();
  }
})

$(window).click(function() {
  $('.nav-search-results').removeClass('show-results');
});
