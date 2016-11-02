import './card.html';

Template.card.helpers({
  'idleAnimation': function() {
    var type = this.info.type;
    if (type === 'Artifact' || type === 'Spell') {
      return 'group_passive';
    }
    else {
      return 'group_idle';
    }
  },
  'infoAttack': function() {
    if (this.info.attack !== undefined) {
      return this.info.attack.toString();
    }
    else {
      return false;
    }
  }
})
