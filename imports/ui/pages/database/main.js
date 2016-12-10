import './main.html';

import './components/card.js';

import scrollMonitor from 'scrollmonitor';

Template.databaseSearch.onCreated(function() {
  let self = Template.instance();

  self.searchQuery = new ReactiveVar();
  self.searching   = new ReactiveVar( false );
  this.debounce = null;

  self.autorun( () => {
   self.subscribe( 'databaseResults', self.searchQuery.get(), () => {
     setTimeout( () => {
       self.searching.set( false );
     }, 300 );
   });
 });
})

Template.databaseSearch.events({
  'keyup [name="searchDatabase"]' ( event, template ) {
    if (template.debounce) {
      Meteor.clearTimeout(template.debounce);
    }
    template.debounce = Meteor.setTimeout(function() {
      let value = event.target.value.trim();

      if ( value !== '' && value !== template.searchQuery.get()) {
        template.searchQuery.set( value );
        template.searching.set( true );
      }

      if ( value === '' ) {
        template.searchQuery.set( value );
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
    let results = allCards.find();
    if ( results.count() > 0 ) {
      return results;
    }
    return false;
  }
})
