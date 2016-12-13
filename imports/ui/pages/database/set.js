import './set.html';

Template.databaseSetPage.onCreated(function() {
  self = Template.instance();

  self.setName = FlowRouter.getParam('set');
  if (new RegExp('base', 'gi').test(self.setName)) {
    self.setName = "Base";
  }

  if (new RegExp('dos', 'gi').test(self.setName)) {
    self.setName = "Denizens of Shim'Zar";
  }

  self.autorun( () => {
    self.subscribe('someCards', {set: self.setName})
  })
})

Template.databaseSetPage.helpers({
  factions() {
    return ['Lyonar Kingdoms', 'Songhai Empire', 'Vetruvian Imperium', 'Abyssian Host', 'Magmar Aspects', 'Vanar Kindred', 'Neutral'];
  },
  factionCards() {
    var faction = this.valueOf();

    return allCards.find({faction: faction});
  },
  setName() {
    return Template.instance().setName;
  }
})
