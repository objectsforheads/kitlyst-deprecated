import './faction.html';
import './components/card.js';

Template.databaseFactionPage.onCreated(function() {
  var self = Template.instance();

  self.subscribe( 'factionCards', FlowRouter.getParam('faction') )
})

Template.databaseFactionPage.helpers({
  faction() {
    // Fuzzy match in case of typo's even though this shouldn't ever happen
    var faction = FlowRouter.getParam('faction');
    if (new RegExp('lyon').test(faction) || new RegExp('king').test(faction)) {
      return faction = 'Lyonar Kingdoms'
    }
    if (new RegExp('son').test(faction) || new RegExp('emp').test(faction)) {
      return faction = 'Songhai Empire'
    }
    if (new RegExp('vet').test(faction) || new RegExp('imp').test(faction)) {
      return faction = 'Vetruvian Imperium'
    }
    if (new RegExp('aby').test(faction) || new RegExp('host').test(faction)) {
      return faction = 'Abyssian Host'
    }
    if (new RegExp('mag').test(faction) || new RegExp('asp').test(faction)) {
      return faction = 'Magmar Aspects'
    }
    if (new RegExp('van').test(faction) || new RegExp('kind').test(faction)) {
      return faction = 'Vanar Kindred'
    }
    return 'faction';
  },
  expansions() {
    return ["Base", "Denizens of Shim'Zar", "Rise of the Bloodborn"];
  },
  factionGenerals() {
    return allCards.find({race: 'General'}, {sort: ["id", "asc"]})
  },
  factionCards() {
    return allCards.find({ race: {$ne: 'General'}, set: this.valueOf()}, {sort: [ ["manaCost", "asc"], ["name", "asc"] ] })
  }
})
