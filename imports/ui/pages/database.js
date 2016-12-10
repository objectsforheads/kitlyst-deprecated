import './database.html';

import scrollMonitor from 'scrollmonitor';
import '/node_modules/remodal/dist/remodal.css';
import '/node_modules/remodal/dist/remodal.min.js';

import JsDiff from 'diff';

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
    var escapedQuery = this.query.replace(/[-[\]{}()*+?.,\\=!<>^$|#]/g, "\\$&");
    // Esscape the text
    text = text.replace(/[-[\]{}()*+?.,\\=!<>^$|#]/g, "\\$&");
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
  historicalCard() {
    if (this.layout === 'historicalCard') { return true; }
    return false;
  },
  slugifiedName() {
    return this.info.name.replace(/['"]+/g, "").replace(/[^a-zA-Z0-9]+/g,"-").replace("/--/g", "-").toLowerCase();
  },
  parsedDescription: function() {
    return Spacebars.SafeString(boldKeywords(this.info.description));
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
    var cards = JSON.parse(JSON.stringify(historicalCards.find({id: this.info.id}, {sort: { patch: 1 }}).fetch()));
    cards.forEach(function(card, index) {
      var fields = ['name','manaCost','race','description','rarity'];
      if (card.type === 'Unit') {
        fields.push('attack');
        fields.push('health');
      }
      if (index < cards.length - 1) {
        var next = cards[index + 1];

        // Run the diff functions on each field

        fields.forEach(function(field) {
          // Create the containers for the diff information
          if (typeof card[field+'DiffRemove'] === 'undefined') {
            card[field + 'DiffRemove'] = [];
          }
          if (typeof card[field+'DiffAdd'] === 'undefined') {
            card[field + 'DiffAdd'] = [];
          }

          if (typeof next[field+'DiffRemove'] === 'undefined') {
            next[field + 'DiffRemove'] = [];
          }
          if (typeof next[field+'DiffAdd'] === 'undefined') {
            next[field + 'DiffAdd'] = [];
          }

          var diffs = JsDiff.diffWords(card[field].toString(), next[field].toString());

          diffs.forEach(function(part) {
            // Add the removed parts to the current card
            if (part.removed) {
              card[field + 'DiffRemove'].push(part);
            } else if (part.added) {
              //Add the added parts to the next card
              next[field + 'DiffAdd'].push(part);
            } else {
              // All the standard parts should get added to both
              card[field + 'DiffRemove'].push(part);
              next[field + 'DiffAdd'].push(part);
            }
          })
        })
      }

      // Loop through the diffs to make the strings
      fields.forEach(function(field) {
        if (typeof card[field + 'DiffAdd'] !== 'undefined') {
          var str = '';
          card[field + 'DiffAdd'].forEach(function(part) {
            if (part.removed) {
              str += '<span class="diff-snippet" data-diff="removed">' + part.value + '</span>';
            } else if (part.added) {
              str += '<span class="diff-snippet" data-diff="added">' + part.value + '</span>';
            } else {
              str +='<span class="diff-snippet">' +  part.value + '</span>';
            }
          })
          card[field + 'DiffAdd'] = boldKeywords(str);
        }
        if (typeof card[field + 'DiffRemove'] !== 'undefined') {
          var str = '';
          card[field + 'DiffRemove'].forEach(function(part) {
            if (part.removed) {
              str += '<span class="diff-snippet" data-diff="removed">' + part.value + '</span>';
            } else if (part.added) {
              str += '<span class="diff-snippet" data-diff="added">' + part.value + '</span>';
            } else {
              str +='<span class="diff-snippet">' +  part.value + '</span>';
            }
          })
          card[field + 'DiffRemove'] = boldKeywords(str);
        }
      });

    })
    return cards;
  }
})

function boldKeywords(str) {
  var keywords = ['Bloodborn Spell', 'Zeal', 'Provoke', 'Opening Gambit', 'Celerity', 'Airdrop', 'Ranged', 'Backstab', 'Flying', 'Rush', 'Blast', 'Summon Dervish', 'Dying Wish', 'Frenzy', 'Deathwatch', 'Rebirth', 'Infiltrate', 'Forcefield', 'Grow', 'Stunned', 'Stun', 'Strikeback'];

  keywords.forEach(function(keyword) {
    var regex = new RegExp(keyword, 'g');
    str = str.replace(regex, "<b>$&</b>");
  })

  return str;
}
