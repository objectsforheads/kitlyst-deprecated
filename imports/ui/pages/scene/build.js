import './build.html';
import './build.scss';

Template.scenebuilderBuild.onCreated(function() {
  var self = Template.instance();

  self.player1 = new ReactiveVar({
    id: 1,
    name: 'Player 1',
    general: {
      id: 401,
      health: 25
    },
    bbs: {
      id: 'general-bbs_f5',
      cost: 1,
      cooldown: 2,
      remaining: 0
    },
    manabar: {
      available: 4,
      used: 4
    },
    hand: 3,
    deck: {
      remaining: 17,
      total: 40
    }
  });

  self.player2 = new ReactiveVar({
    id: 2,
    name: 'Player 2',
    general: {
      id: 418,
      health: 25
    },
    bbs: {
      id: 'general-bbs_f5-alt',
      cost: 1,
      cooldown: 2,
      remaining: 2
    },
    manabar: {
      available: 4,
      used: 2
    },
    hand: 3,
    deck: {
      remaining: 17,
      total: 30
    }
  });
})

Template.scenebuilderBuild.helpers({
  boardRows() {
    return ['A', 'B', 'C', 'D', 'E'];
  },
  boardColumns() {
    return [1,2,3,4,5,6,7,8,9];
  },
  player1() {
    return Template.instance().player1.get();
  },
  player2() {
    return Template.instance().player2.get();
  }
})

Template.scenebuilderBuild__player.helpers({
  playerManaslots() {
    var manaslots = [];
    var available = this.player.manabar.available;
    var used = this.player.manabar.used;
    for (var i = 1; i <= 9; i++) {
      var manaslot = {active: false, used: false}
      if (i <= available) {
        manaslot.active = true;
      }
      if (i <= used) {
        manaslot.used = true;
      }

      manaslots.push(manaslot);
    }

    if (this.player.id === 2) {
      manaslots.reverse();
    }
    return manaslots;
  },
  manaRemaining() {
    return this.player.manabar.available - this.player.manabar.used;
  }
})
