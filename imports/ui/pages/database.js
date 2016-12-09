import './database.html';

import scrollMonitor from 'scrollmonitor';
import '/node_modules/remodal/dist/remodal.css';
import '/node_modules/remodal/dist/remodal.min.js';

Template.database.onCreated(function() {
  // this.subscribe('allCards');
})

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
    }, 150);
  },
  'click .remodal-trigger' (e, template) {
    var id = $(e.currentTarget).attr('data-remodal-target');
    $('.remodal[data-remodal-id=' + id + ']').remodal();
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

Template.highlightQuery.helpers({
  highlighted() {
    var text = this.text;

    if (this.keywords === true) {
      var keywords = ['Bloodborn Spell', 'Zeal', 'Provoke', 'Opening Gambit', 'Celerity', 'Airdrop', 'Ranged', 'Backstab', 'Flying', 'Rush', 'Blast', 'Summon Dervish', 'Dying Wish', 'Frenzy', 'Deathwatch', 'Rebirth', 'Infiltrate', 'Forcefield', 'Grow', 'Stunned', 'Stun', 'Strikeback']
      keywords.forEach(function(keyword) {
        var regex = new RegExp(keyword, 'g');
        text = text.replace(regex, "<b>$&</b>");
      })
    }

    // Escape the query
    var escapedQuery = this.query.replace(/[-[\]{}()*+?%.,\\=!<>^$|#]/g, "\\$&");
    // Esscape the text
    text = text.replace(/[-[\]{}()*+?%.,\\=!<>^$|#]/g, "\\$&");
    // Run the highlighter
    var regex = new RegExp(escapedQuery, 'gi');
    text = text.replace(regex, '<span class="highlighted">$&</span>');
    // unescape the text
    text = text.replace(/\\/g,'')

    return Spacebars.SafeString(text);
  }
})

Template.databaseCard.helpers({
  cardResult() {
    if (this.layout === 'cardResult') { return true; }
    return false;
  },
  pageModal() {
    if (this.layout === 'pageModal') { return true; }
    return false;
  },
  pageModalCard() {
    if (this.layout === 'pageModalCard') { return true; }
    return false;
  },
  slugifiedName() {
    return this.info.name.replace(/['"]+/g, "").replace(/[^a-zA-Z0-9]+/g,"-").replace("/--/g", "-").toLowerCase();
  },
  parsedDescription: function() {
    var description = this.info.description;
    var keywords = ['Bloodborn Spell', 'Zeal', 'Provoke', 'Opening Gambit', 'Celerity', 'Airdrop', 'Ranged', 'Backstab', 'Flying', 'Rush', 'Blast', 'Summon Dervish', 'Dying Wish', 'Frenzy', 'Deathwatch', 'Rebirth', 'Infiltrate', 'Forcefield', 'Grow', 'Stunned', 'Stun', 'Strikeback']
    keywords.forEach(function(keyword) {
      var regex = new RegExp(keyword, 'g');
      description = description.replace(regex, "<b>" + keyword + "</b>");
    })
    return Spacebars.SafeString(description);
  }
})

Template.databaseCardPage.onCreated(function() {
  let self = Template.instance();

  self.autorun( () => {
   self.subscribe( 'cardHistory', this.data.info.id, () => {
   });
 });
})

Template.databaseCardPage.helpers({
  patchCards() {
    var cards = JSON.parse(JSON.stringify(historicalCards.find({id: this.info.id}).fetch()));
    return cards;
  }
})
