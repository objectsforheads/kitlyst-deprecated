import './patch.html'

import JsDiff from 'diff';

patchChanges = new Mongo.Collection('patch_changes');

Template.databasePatchPage.onCreated(function() {
  var self = Template.instance();

  self.autorun( () => {
    self.subscribe( 'patchChanges', Number(FlowRouter.getParam('patch')) );
    self.subscribe( 'patchCards', Number(FlowRouter.getParam('patch')) );
  })
})
Template.databasePatchPage.helpers({
  patchNumber() {
    var patch = Number(FlowRouter.getParam('patch')).toFixed(2);
    return patch;
  },
  expansions() {
    return ["Base", "Denizens of Shim'Zar", "Rise of the Bloodborn"];
  },
  patchGenerals() {
    var cards = historicalCards.find({race: 'General'}, {sort: [ ["id", "asc"] ] }).fetch();
    if (cards.length !== 0) {
      // Split into added and updated cards
      cards = cards.reduce(function(a,b) {
        var patches = patchChanges.findOne({_id: b.id}).patches;
        for (var i = patches.length - 1; i >= 0; i--) {
          if (patches[i].patch > Number(FlowRouter.getParam('patch'))) {
            patches.splice(i, 1);
          }
        }
        if (patches.length === 1) {
          a.added.push(b);
        } else {
          a.changed.push(b);
        }
        return a;
      }, {added: [], changed: []})

      return cards;
    }
    return false
  },
  patchCards() {
    var cards = historicalCards.find({
      patch: Number(FlowRouter.getParam('patch')),
      set: this.valueOf(),
      race: {$ne: 'General'}
    }).fetch();

    if (cards.length !== 0) {
      // Split into added and updated cards
      cards = cards.reduce(function(a,b) {
        var patches = patchChanges.findOne({_id: b.id}).patches;
        for (var i = patches.length - 1; i >= 0; i--) {
          if (patches[i].patch > Number(FlowRouter.getParam('patch'))) {
            patches.splice(i, 1);
          }
        }
        if (patches.length === 1) {
          a.added.push(b);
        } else {
          a.changed.push(b);
        }
        return a;
      }, {added: [], changed: []})

      return cards;
    }
    return false
  },
  patchChanges() {
    var cards = JSON.parse(JSON.stringify(patchChanges.findOne({_id: this.id}).patches));
    // Reverse order sort by patch highest to lowset
    cards = cards.sort(function(a,b) {
      if (a.patch > b.patch) {
        return -1;
      } else if (a.patch < b.patch) {
        return 1;
      } else {
        return 0;
      }
    })

    // Mark the patch the card was added
    cards[cards.length - 1].added = true;

    for (var i = cards.length - 1; i >= 0; i--) {
      if (cards[i].patch > Number(FlowRouter.getParam('patch'))) {
        cards.splice(i, 1);
      }
    }
    // Clip off everything but the first 2 - ie. patch and pre-patch
    cards = cards.reduce(function(a,b,i) {
      if (i < 2) {
        a.unshift(b);
      }
      return a;
    }, [])


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
  }
})
