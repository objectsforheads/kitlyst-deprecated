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
