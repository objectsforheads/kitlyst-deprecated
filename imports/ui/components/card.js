import './card.html';

Template.card.helpers({
  'hasTooltip': function() {
    if (this.hasTooltip === true) {
      return '#tooltip-' + this.info.id;
    }
    else {
      return false;
    }
  },
  'isTooltip': function() {
    if (this.isTooltip === true) {
      return 'tooltip-' + this.info.id;
    }
    else {
      return false;
    }
  },
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
