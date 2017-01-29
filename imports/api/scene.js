Meteor.publish('buildScene', function(id) {
  check(id, String);

  return Scenes.find({
    'id': id
  }, {
    fields: {
      'id': 0
    }
  });
})

Meteor.methods({
  'createScene': function(arg) {
    check(arg, {
      player1: Number,
      player2: Number
    })

    var scene = {id: Random.id()};

    var bbs = {
      "1": 20174,
      "23": 20175,
      "101": 20176,
      "123": 20177,
      "201": 20178,
      "223": 20179,
      "301": 20180,
      "323": 20181,
      "401": 20182,
      "418": 20183,
      "501": 20184,
      "527": 80185
    }

    if ( allCards.findOne({id: arg.player1}).race === 'General' ) {
      scene.player1 = {
        id: 1,
        name: 'Player 1',
        general: {
          id: arg.player1,
          health: 25
        },
        bbs: {
          id: bbs[arg.player1],
          cooldown: 2,
          remaining: 1
        },
        manabar: {
          available: 2,
          used: 0
        },
        hand: 0,
        deck: {
          remaining: 39,
          total: 40
        },
        artifacts: [
          {id: null, durability: 3},
          {id: null, durability: 3},
          {id: null, durability: 3}
        ],
        actionbar: [{}, {}, {}, {}, {}, {} ],
        units: [
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ],
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ],
          [ {id: arg.player1, attack: 2, health: 25}, {}, {}, {}, {}, {}, {}, {}, {} ],
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ],
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ]
        ],
        floors: [
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ],
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ],
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ],
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ],
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ]
        ]
      }
    } else {
      return false;
    }

    if ( allCards.findOne({id: arg.player2}).race === 'General' ) {
      scene.player2 = {
        id: 2,
        name: 'Player 2',
        general: {
          id: arg.player2,
          health: 25
        },
        bbs: {
          id: bbs[arg.player2],
          cooldown: 2,
          remaining: 0
        },
        manabar: {
          available: 2,
          used: 0
        },
        hand: 0,
        deck: {
          remaining: 39,
          total: 40
        },
        artifacts: [
          {id: null, durability: 3},
          {id: null, durability: 3},
          {id: null, durability: 3}
        ],
        actionbar: [{}, {}, {}, {}, {}, {} ],
        units: [
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ],
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ],
          [ {}, {}, {}, {}, {}, {}, {}, {}, {id: arg.player2, attack: 2, health: 25} ],
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ],
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ]
        ],
        floors: [
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ],
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ],
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ],
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ],
          [ {}, {}, {}, {}, {}, {}, {}, {}, {} ]
        ]
      }
    } else {
      return false;
    }

    Scenes.insert(scene);
    return scene.id;
  },
  'editor__general': function(arg) {
    check(arg, {
      scene: String,
      owner: Number,
      row: String,
      column: String,
      unit: {
        id: Number,
        attack: Number,
        health: Number
      }
    })

    var scene = Scenes.findOne({id: arg.scene});

    // store current factions to check against
    var currentFactions = [
      allCards.findOne({id: scene.player1.general.id}).faction,
      allCards.findOne({id: scene.player2.general.id}).faction
    ];

    var newFaction = allCards.findOne({id: arg.unit.id}).faction;

    scene['player'+arg.owner].units[arg.row][arg.column] = arg.unit;
    scene['player'+arg.owner].general.health = arg.unit.health;
    scene['player'+arg.owner].general.id = arg.unit.id;

    // new factions to check against for the reset
    var newFactions = [
      allCards.findOne({id: scene.player1.general.id}).faction,
      allCards.findOne({id: scene.player2.general.id}).faction
    ];

    // If the factions on field changed,
    // purge non-faction cards from entire field
    if (currentFactions.indexOf(newFaction) === -1) {
    [1,2].forEach(function(player) {
      scene['player'+player].actionbar.forEach(function(card) {
        if (card.id
        && newFactions.indexOf(allCards.findOne({id:card.id}).faction) === -1) {
          delete card.id;
        }
      })

      scene['player'+player].artifacts.forEach(function(artifact) {
        if (artifact.id
        && newFactions.indexOf(allCards.findOne({id:artifact.id}).faction) === -1) {
          artifact.id = null;
          artifact.durability = 3;
        }
      })

      scene['player'+player].artifacts.sort(function(a,b) {
        if (a.id === null) {
          return 1;
        }
      })

      scene['player'+player].units.forEach(function(row) {
        row.forEach(function(unit) {
          if (unit.id &&
          newFactions.indexOf(allCards.findOne({id:unit.id}).faction) === -1) {
            unit = {};
          }
        })
      })
    })
    }

    Scenes.update({id: arg.scene}, scene);
    return true;
  },
  'editor__artifact': function(arg) {
    check(arg, {
      scene: String,
      owner: Number,
      slot: Number,
      id: Match.OneOf(Number, null),
      durability: Number
    })

    var scene = Scenes.findOne({id: arg.scene});
    scene['player'+arg.owner].artifacts[arg.slot] = {
      id: arg.id,
      durability: arg.durability
    }
    scene['player'+arg.owner].artifacts.sort(function(a,b) {
      if (a.id === null) {
        return 1;
      }
    })

    Scenes.update({id: arg.scene}, scene);
    return true;
  },
  'editor__actionbar': function(arg) {
    check(arg, {
      scene: String,
      owner: Number,
      actionbar: Array
    })

    var scene = Scenes.findOne({id: arg.scene});
    scene['player'+arg.owner].actionbar = arg.actionbar;

    Scenes.update({id: arg.scene}, scene);
    return true;
  },
  'scene__airdropUnit': function(arg) {
    check(arg, {
      scene: String,
      original: {
        row: String,
        column: String,
        unit: {
          owner: Match.Optional(Number),
          id: Number,
          attack: Number,
          health: Number
        }
      },
      airdrop: {
        row: String,
        column: String
      }
    })

    var owner = arg.original.unit.owner;
    var scene = Scenes.findOne({id: arg.scene});
    scene['player'+owner].units[arg.airdrop.row][arg.airdrop.column] = arg.original.unit; scene['player'+owner].units[arg.original.row][arg.original.column] = {};

    Scenes.update({id: arg.scene}, scene);

    return true;
  }
})
