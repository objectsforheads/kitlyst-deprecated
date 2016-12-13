import './single.html';
import './components/card.js';

import JsDiff from 'diff';

Template.databaseCardPage.onCreated(function() {
  let self = Template.instance();

  self.summons = new ReactiveVar(false);
  self.summoned_by = new ReactiveVar(false);

  self.autorun( () => {
    self.subscribe( 'cardHistory', Number(FlowRouter.getParam('slug')))
    self.subscribe( 'cardPage', [Number(FlowRouter.getParam('slug'))] );
    self.subscribe( 'cardMeta', Number(FlowRouter.getParam('slug')))
    if (cardMeta.findOne({id: Number(FlowRouter.getParam('slug'))})) {
      var cards = [cardMeta.findOne().id];
      var meta = cardMeta.findOne();

      if (meta.summons) {
        meta.summons.forEach(function(id) {
          cards.push(Number(id))
        })
        self.summons.set(meta.summons)
      } else {
        self.summons.set(false)
      }

      if (meta.summoned_by) {
        meta.summoned_by.forEach(function(id) {
          cards.push(Number(id))
        })
        self.summoned_by.set(meta.summoned_by)
      } else {
        self.summoned_by.set(false)
      }
      self.subscribe( 'cardPage', cards );
    }
  });
})


Template.databaseCardPage.helpers({
  currentCard() {
    return allCards.findOne({id: Number(FlowRouter.getParam('slug'))});
  },
  cardId() {
    return FlowRouter.getParam('slug');
  },
  sprites() {
    if (cardMeta.findOne({id: Number(FlowRouter.getParam('slug'))})) {
      return cardMeta.findOne({id: Number(FlowRouter.getParam('slug'))}).sprites;
    }
    return false;
  },
  patchCards() {
    var cards = JSON.parse(JSON.stringify(historicalCards.find({id: Number(FlowRouter.getParam('slug'))}, {sort: { patch: 1 }}).fetch()));
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
  },
  patch() {
    return Number(this.patch).toFixed(2);
  },
  summons() {
    return Template.instance().summons.get();
  },
  summoned() {
    return Template.instance().summoned_by.get();
  },
  loaded() {
    var id = Number(this.valueOf());
    if (allCards.findOne({id: id})) {
      return [allCards.findOne({id: id})];
    } else {
      return false;
    }
  }
})
