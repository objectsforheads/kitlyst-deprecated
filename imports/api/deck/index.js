// export const Decks = new Mongo.Collection('decks');
var Future = Npm.require("fibers/future");

Meteor.publish('Decks', function(hash) {
  check(hash, String);

  return Decks.find({
    'owner': {$in: [null, this.userId]},
    'draft': true,
    'hash': hash
  }, {
    fields: {
      'hash': 0
    }
  });
})

Meteor.methods({
  'getCardsFromAPI': function(arg) {
    check(arg, null);

    var future = new Future();
    var apiUrl = 'http://listlyst.com/api/v1/cards?apikey=' + 'cf156a2e4b5296b5a184e53ab14dd99f';

    future.return(HTTP.get(apiUrl, {}));

    var result = future.wait();
    return result.data;
  },
  'assignDeckOwner': function(arg) {
    check(arg, {
      hash: String,
      owner: String
    })

    Decks.update({hash: arg.hash}, {$set: {owner: arg.owner}});

    return arg.owner;
  },
  'saveDeckName': function(arg) {
    check(arg, {
      hash: String,
      name: String
    });

    Decks.update({ hash: arg.hash }, {$set: {name: arg.name}});

    return arg.name;
  },
  'saveDeckDescription': function(arg) {
    check(arg, {
      hash: String,
      description: String
    })

    Decks.update({ hash: arg.hash }, {$set: {description: arg.description}});
  },
  'saveDeckDraft': function(arg) {
    check(arg, {
      hash: Match.Optional(String),
      faction: String,
      general: Array,
      deck: Array
    });

    var apiKey = 'cf156a2e4b5296b5a184e53ab14dd99f';
    // validate against the api to make sure the general exists
    var generalValid = false;
    var validateGeneral = 'http://listlyst.com/api/v1/cards?race=general&apikey=' + apiKey;
    var validGenerals = HTTP.get(validateGeneral, {})
    if (Array.isArray(validGenerals.data)) {
      arg.general.forEach(function(toCheck) {
        var generalIndex = validGenerals.data.findIndex(test => test.id === toCheck.id)
        if (generalIndex !== -1) {
          generalValid = true;
        }
      })
    }
    // validate that the faction matches one of the available ones
    var factionValid = false;
    var validFactions = ['Lyonar Kingdoms', 'Songhai Empire', 'Vetruvian Imperium', 'Abyssian Host', 'Magmar Aspects', 'Vanar Kindred'];
    if (validFactions.indexOf(arg.faction) !== -1) {
      factionValid = true;
    }
    // validate every card that comes through and make sure it:
    //  1. exists
    //  2. doesn't exceed 3 copies
    var cardsValid = arg.deck.reduce(function(a, b) {
      if (a !== false) {
        var validateCard = 'http://listlyst.com/api/v1/card/' + b.id + '?apikey=' + apiKey;
        var validCard = HTTP.get(validateCard, {})
        if (Array.isArray(validCard.data)) {
          if (validCard.data.length > 0 && b.count <= 3) {
            return true;
          }
        }
      }
    }, null)

    if (generalValid && factionValid && cardsValid) {
      var hash = arg.hash || Random.id();
      var newDeck = {
        name: 'Deck ' + hash,
        description: "",
        view: 'public',
        draft: true,
        hash: hash,
        owner: this.userId,
        patch: 1.75,
        faction: arg.faction,
        general: arg.general,
        deck: arg.deck
      }
      if (arg.hash) {
        Decks.update({ hash: hash }, {$set: {
          patch: 1.75,
          faction: arg.faction,
          general: arg.general,
          deck: arg.deck
        }})
      }
      else {
        Decks.insert(newDeck)
      }

     return hash;
    }
    else {
      return {General: generalValid, Faction: factionValid, Cards: cardsValid};
    }
  }
})
