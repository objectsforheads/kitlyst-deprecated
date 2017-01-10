import './main.html';

import './components/card.js';
import './components/nav.js';

Template.databaseSearch.onCreated(function() {
  var self = Template.instance();

  self.searchQuery = new ReactiveVar();
  self.searching   = new ReactiveVar( false );
  this.debounce = null;

  self.autorun( () => {
    if (FlowRouter.getQueryParam('search')) {
      self.searching.set(true);
      self.searchQuery.set(FlowRouter.getQueryParam('search'))
    }

    self.subscribe( 'databaseResults', self.searchQuery.get(), () => {
     setTimeout( () => {
       self.searching.set( false );
       FlowRouter.setQueryParams({search: self.searchQuery.get()})
     }, 300 );
    });
  });
})

Template.databaseSearch.events({
  'keydown [name="searchDatabase"]' ( event, template ) {
    if (template.debounce) {
      Meteor.clearTimeout(template.debounce);
    }
    template.debounce = Meteor.setTimeout(function() {
      var isWordCharacter = event.key.length === 1;
      var isBackspaceOrDelete = (event.keyCode == 8 || event.keyCode == 46);

      if (isWordCharacter || isBackspaceOrDelete) {
        var value = event.target.value.trim();
        if ( value !== '' && value !== FlowRouter.getQueryParam('search')) {
          FlowRouter.setQueryParams({search: value})
        }
      }
    }, 200);
  }
})

Template.databaseSearch.helpers({
  searching() {
    return Template.instance().searching.get();
  },
  query() {
    return Template.instance().searchQuery.get();
  },
  results() {
    var results = allCards.find();
    if ( results.count() > 0 ) {
      return results;
    }
    return false;
  },
  resultsCount() {
    return allCards.find().count();
  }
})
