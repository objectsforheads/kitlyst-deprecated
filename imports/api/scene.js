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
          {id: false, durability: 3},
          {id: false, durability: 3},
          {id: false, durability: 3}
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
          {id: false, durability: 3},
          {id: false, durability: 3},
          {id: false, durability: 3}
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
    scene['player'+arg.owner].units[arg.row][arg.column] = arg.unit;
    scene['player'+arg.owner].general.health = arg.unit.health;
    var player1 = scene.player1;
    var player2 = scene.player2;

    Scenes.update({id: arg.scene}, {
      $set: { player1: player1, player2: player2 }
    });

    return true;
  }
})
