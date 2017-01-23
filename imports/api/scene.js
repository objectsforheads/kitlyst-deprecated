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
        bbs: bbs[arg.player1],
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
        bbs: bbs[arg.player2],
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
  }
})
