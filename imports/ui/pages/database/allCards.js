import './allCards.html';

Template.databaseAllCardsPage.onCreated(function() {
  self = Template.instance();

  self.subscribe('allCards');
})

Template.databaseAllCardsPage.helpers({
  factions() {
    return ['Lyonar Kingdoms', 'Songhai Empire', 'Vetruvian Imperium', 'Abyssian Host', 'Magmar Aspects', 'Vanar Kindred', 'Neutral'];
  },
  factionCardsByExpansion() {
    let expansions = ["Base", "Denizens of Shim'Zar", "Rise of the Bloodborn"];
    let faction = this.valueOf()

    var sorted = [];

    expansions.forEach(function(expansion) {
      sorted.push({
        expansion: expansion,
        cards: []
      })

      allCards.find({faction: faction, set: expansion}, {sort: [ ["manaCost", "asc"], ["name", "asc"] ] }).fetch().forEach(function(card) {
        // We'll always be pushing into the last index of sorted
        sorted[sorted.length - 1].cards.push(card);
      })
    })

    return sorted;
  },
  log() {
    console.log(this)
  }
})
