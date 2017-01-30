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

    scene.meta = {
      turnState: {
        turn: 1,
        player: 1
      },
      board: {
        floors: [
          [{}, {}, {}, {}, {type: 'manaspring'}, {}, {}, {}, {}],
          [{}, {}, {}, {}, {}, {}, {}, {}, {}],
          [{}, {}, {}, {}, {}, {type: 'manaspring'}, {}, {}, {}],
          [{}, {}, {}, {}, {}, {}, {}, {}, {}],
          [{}, {}, {}, {}, {type: 'manaspring'}, {}, {}, {}, {}]
        ],
        units: [
          [{}, {}, {}, {}, {id: 'scene_manaspring'}, {}, {}, {}, {}],
          [{}, {}, {}, {}, {}, {}, {}, {}, {}],
          [{}, {}, {}, {}, {}, {id: 'scene_manaspring'}, {}, {}, {}],
          [{}, {}, {}, {}, {}, {}, {}, {}, {}],
          [{}, {}, {}, {}, {id: 'scene_manaspring'}, {}, {}, {}, {}]
        ]
      }
    }

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
      "527": 20185
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
          remaining: 2
        },
        manabar: {
          available: 2,
          used: 0,
          total: 2
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
          remaining: 2
        },
        manabar: {
          available: 3,
          used: 0,
          total: 3,
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
  'scene__setBoard': function(arg) {
    check(arg, {
      scene: String,
      board: {
        floors: Array,
        units: Array
      }
    })

    var scene = Scenes.findOne({id: arg.scene});
    scene.meta.board = arg.board;

    Scenes.update({id: arg.scene}, scene);
  },
  'editor__bbs-cooldown': function(arg) {
    check(arg, {
      scene: String,
      owner: Number,
      cooldown: Number,
      remaining: Number
    })

    var scene = Scenes.findOne({id: arg.scene});

    if (arg.remaining === 0) {
      arg.remaining = arg.cooldown;
    } else {
      arg.remaining--;
    }
    scene['player'+arg.owner].bbs.remaining = arg.remaining;

    Scenes.update({id: arg.scene}, scene);
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

      scene['player'+player].units.forEach(function(row, rowNum) {
        row.forEach(function(unit, colNum) {
          if (unit.id &&
          newFactions.indexOf(allCards.findOne({id:unit.id}).faction) === -1) {
            scene['player'+player].units[rowNum][colNum] = {};
          }
        })
      })
    })
    }

    Scenes.update({id: arg.scene}, scene);
    return true;
  },
  'editor__tile': function(arg) {
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

    // editing only works on units that exist
    var unit = scene['player'+arg.owner].units[arg.row][arg.column];
    for (var key in arg.unit) {
      unit[key] = arg.unit[key];
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
  'editor__artifact-durability': function(arg) {
    check(arg, {
      scene: String,
      artifact: {
        id: Number,
        durability: Number,
        owner: Number,
        slot: Number
      }
    })

    var scene = Scenes.findOne({id: arg.scene});
    var artifact = arg.artifact;
    if (artifact.durability === 3) {
      artifact.durability = 1;
    } else {
      artifact.durability++;
    }
    scene['player'+artifact.owner].artifacts[artifact.slot].durability = artifact.durability;

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
      original: Object,
      airdrop: {
        row: String,
        column: String
      }
    })


    var scene = Scenes.findOne({id: arg.scene});

    if (arg.original.unit) {
    // row: String,
    // column: String,
    // unit: {
    //   owner: Match.Optional(Number),
    //   id: Number,
    //   attack: Number,
    //   health: Number
    // }
      scene.player1.units[arg.airdrop.row][arg.airdrop.column] = {};
      scene.player2.units[arg.airdrop.row][arg.airdrop.column] = {};

      var owner = arg.original.unit.owner;
      scene['player'+owner].units[arg.airdrop.row][arg.airdrop.column] = arg.original.unit; scene['player'+owner].units[arg.original.row][arg.original.column] = {};
    } else {
    // id: Number,
    // owner: Number,
    // index: Number

      var player = scene['player'+arg.original.owner];
      var card = allCards.findOne({id: arg.original.id});
      // Remove the actionbar card
      player.actionbar[arg.original.index] = {};

      // If the card is an artifact, equip it
      if (card.type === 'Artifact') {
        // equipping artifacts through other means will
        // organize them and set null id's to the end
        // so check if an artifact is equipped in the last slot
        if (player.artifacts[2].id) {
          // if there is, bump the first one
          player.artifacts.shift();
          // then add this new one
          player.artifacts.push({
            id: arg.original.id,
            durability: 3
          })
        } else {
          // there's space, go ahead and find the first null id
          // then equip the artifact in that slot
          for (var i = 0; i < player.artifacts.length; i++) {
            var artifact = player.artifacts[i];
            if (artifact.id === null) {
              artifact.id = arg.original.id;
              artifact.durability = 3;
              break;
            }
          }
        }
      }

      // If the card is a unit, airdrop it!
      if (card.type === 'Unit') {
        scene.player1.units[arg.airdrop.row][arg.airdrop.column] = {};
        scene.player2.units[arg.airdrop.row][arg.airdrop.column] = {};

        player.units[arg.airdrop.row][arg.airdrop.column] = {
          id: arg.original.id,
          owner: arg.original.owner,
          attack: card.attack,
          health: card.health
        }
      }

      // Do nothing if it's a spell
    }

    Scenes.update({id: arg.scene}, scene);

    return true;
  },
  'metaEditor__turn': function(arg) {
    check(arg, {
      scene: String,
      turnState: {
        turn: Number,
        player: Number
      }
    })

    var scene = Scenes.findOne({id: arg.scene});
    scene.meta.turnState = arg.turnState;
    [1,2].forEach(function(player) {
      scene['player'+player].manabar.total = function(turnState) {
        if (turnState.turn === 1) { return 1 + player; }
        if (turnState.player === 1) { return 1 + turnState.turn; }
        return turnState.turn + player;
      }(arg.turnState);

      // if it's past turn 7, the bbs cd is 1
      if (arg.turnState.turn >= 7) {
        scene['player'+player].bbs.cooldown = 1;
      } else {
        scene['player'+player].bbs.cooldown = 2;
      }

      // bbs cd should always be less than total cd
      if (scene['player'+player].bbs.remaining > scene['player'+player].bbs.cooldown) {
        scene['player'+player].bbs.remaining = scene['player'+player].bbs.cooldown
      }
    })

    Scenes.update({id: arg.scene}, scene);

    return true;
  },
  'metaEditor__shadowcreep': function(arg) {
    check(arg, {
      scene: String,
      edit: String,
      owner: Number,
      tile: Object
    })

    var scene = Scenes.findOne({id: arg.scene});
    scene.player1.floors[arg.tile.row][arg.tile.column] = {};
    scene.player2.floors[arg.tile.row][arg.tile.column] = {};

    if (arg.owner !== 0) {
      var tile = scene['player'+arg.owner].floors[arg.tile.row][arg.tile.column];
      tile.owner = arg.owner;
      tile.type = 'shadowcreep';
    }

    Scenes.update({id: arg.scene}, scene);

    return true;
  }
})
