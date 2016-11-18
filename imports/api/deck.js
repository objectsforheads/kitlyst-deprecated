var Future = Npm.require("fibers/future");

Meteor.publish('allCards', function() {
  return allCards.find();
})

Meteor.publish('editDeck', function(hash) {
  check(hash, String);

  return Decks.find({
    'owner': {$in: [null, this.userId]},
    'hash': hash
  }, {
    fields: {
      'hash': 0
    }
  });
})

Meteor.publish('viewDeck', function(hash) {
  check(hash, String);

  return Decks.find({
    'view_hash': hash
  }, {
    fields: {
      'patch': 1,
      'name': 1,
      'description': 1,
      'faction': 1,
      'general': 1,
      'deck': 1
    }
  })
})

Meteor.methods({
  'exportDeckImg': function(arg) {
    check(arg, {
      url: String,
      orientation: String
    });

    import Urlbox from 'urlbox';
    var urlbox = Urlbox('dd9c90fb-3db4-4d92-8195-0b35954726f5', '7380ebc8-8c87-4bda-a1a0-4053bfd89781');

    var options = {
      format: 'jpg',
      quality: 65,
      url: arg.url + '?compact=' + arg.orientation,
      full_page: true,
      force: true
    };
    if (arg.orientation === 'landscape') {
      options.width = 1020;
    }
    if (arg.orientation === 'portrait') {
      options.width = 320;
    }

    var futureGet = new Future();
    var urlboxUrl = urlbox.buildUrl(options);

    futureGet.return(HTTP.get(urlboxUrl, {}));
    var resultGet = futureGet.wait();

    var futureUpload = new Future();
    var imgurUrl = "https://api.imgur.com/3/image";
    var imgurAuth = 'Client-ID ' + '668d88a5ecd617c';
    var imgurOptions = {
      headers: {
        Authorization: imgurAuth,
        Accept: 'application/json'
      },
       data: {
         image: urlboxUrl
       }
    }

    HTTP.call('POST', imgurUrl, imgurOptions, function(err, res) {
      if (err) {
        futureUpload.throw(err);
      }
      else {
        futureUpload.return(res);
      }
    })

    var resultUpload = futureUpload.wait();
    return resultUpload.data;
  },
  'assignDeckOwner': function(arg) {
    check(arg, {
      hash: String,
      owner: String
    })

    Decks.update({hash: arg.hash}, {$set: {owner: arg.owner}});

    return arg.owner;
  },
  'saveDeckDraft': function(arg) {
    check(arg, {
      hash: Match.Optional(String),
      name: Match.Optional(String),
      description: Match.Optional(String),
      draft: Match.Optional(String),
      faction: String,
      general: Array,
      deck: Array
    });

    // validate against the api to make sure the general exists
    var generalValid = checkGeneralValid(arg);
    // validate that the faction matches one of the available ones
    var factionValid = checkFactionValid(arg);
    // validate every card that comes through and make sure it:
    //  1. exists
    //  2. doesn't exceed 3 copies
    var cardsValid = checkCardsValid(arg);

    if (generalValid && factionValid && cardsValid) {
      var hash = arg.hash || Random.id();
      if (arg.hash) {
        Decks.update({ hash: hash }, {$set: {
          name: arg.name || 'Deck ' + hash,
          description: arg.description || "",
          draft: arg.draft || false,
          faction: arg.faction,
          general: arg.general,
          deck: arg.deck
        }})
      }
      else {
        var viewHash = Random.id();
        Decks.insert({
          hash: hash,
          patch: 1.76,
          view: 'public',
          view_hash: viewHash,
          draft: arg.draft || false,
          owner: this.userId,
          name: arg.name || 'Deck ' + viewHash,
          description: arg.description || "",
          faction: arg.faction,
          general: arg.general,
          deck: arg.deck
        })
      }

     return {hash: hash, view_hash: viewHash};
    }
    else {
      return {General: generalValid, Faction: factionValid, Cards: cardsValid};
    }
  },
  'deleteDraft': function(arg) {
    check(arg, {
      owner: String,
      hash: String
    })

    if (Decks.findOne({hash: arg.hash}).owner === arg.owner) {
      Decks.remove({hash: arg.hash});
      return 'Deck successfully deleted!'
    } else {
      return false;
    }
  },
  'cleanTempDrafts': function(arg) {
    check(arg, null);

    Decks.remove({draft: 'temp'});

    return true;
  }
})

checkGeneralValid = function(arg) {
  var self = false;
  arg.general.forEach(function(toCheck) {
    if (allCards.find({id: toCheck.id}).count() > 0) {
      self = true;
    }
  })

  return self;
}

checkFactionValid = function(arg) {
  var self = false;
  var validFactions = ['Lyonar Kingdoms', 'Songhai Empire', 'Vetruvian Imperium', 'Abyssian Host', 'Magmar Aspects', 'Vanar Kindred'];
  if (validFactions.indexOf(arg.faction) !== -1) {
    self = true;
  }

  return self;
}

checkCardsValid = function(arg) {
  var self = arg.deck.reduce(function(a, b) {
    if (a !== false) {
      if (allCards.find({id: b.id}).count() > 0) {
        return true;
      }
      else {
        return false;
      }
    }
  }, null)

  return self;
}
