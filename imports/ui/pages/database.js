import './database.html';

import scrollMonitor from 'scrollmonitor';
import '/node_modules/remodal/dist/remodal.css';
import '/node_modules/remodal/dist/remodal.min.js';

Template.database.onCreated(function() {
  // this.subscribe('allCards');
})

Template.databaseCards.onRendered(function() {
  document.querySelectorAll('.db-card').forEach(function(card) {
    var watcher = scrollMonitor.create(card);
    watcher.stateChange(lazyLoad);
    lazyLoad.call(watcher);
  })

  function lazyLoad() {
    if (this.isInViewport) {
      var sprite = $(this.watchItem).find('.card-sprite');
			sprite.addClass(sprite.attr('data-id'));
      return this.destroy;
		}
  }
})

Template.databaseCards.helpers({
  allCards: function() {
    return allCards.find();
  },
  parsedDescription: function() {
    var description = this.description;
    var keywords = ['Bloodborn Spell', 'Zeal', 'Provoke', 'Opening Gambit', 'Celerity', 'Airdrop', 'Ranged', 'Backstab', 'Flying', 'Rush', 'Blast', 'Summon Dervish', 'Dying Wish', 'Frenzy', 'Deathwatch', 'Rebirth', 'Infiltrate', 'Forcefield', 'Grow', 'Stunned', 'Stun', 'Strikeback']
    keywords.forEach(function(keyword) {
      var regex = new RegExp(keyword, 'g');
      description = description.replace(regex, "<b>" + keyword + "</b>");
    })
    return Spacebars.SafeString(description);
  }
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
  },
  slugifiedName() {
    return this.name.replace(/['"]+/g, "").replace(/[^a-zA-Z0-9]+/g,"-").replace("/--/g", "-").toLowerCase();
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
