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
  'slugifiedName': function() {
    return this.info.name.trim().replace(/['"]+/, "").toLowerCase().replace(/[^a-zA-Z0-9]+/,"-").replace("/--/", "-");
  },
  'slugifiedRace': function() {
    return this.info.race.trim().replace(/['"]+/, "").toLowerCase().replace(/[^a-zA-Z0-9]+/,"-").replace("/--/", "-");
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
