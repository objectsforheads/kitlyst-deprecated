import './nav.html';

Template.databaseNav.helpers({
  patches() {
    return [
      {
        phase: 'Alpha',
        patches: [
          0.01,0.02,0.03,0.04,0.05,0.06,0.08,0.09,0.1,
          0.11,0.12,0.13,0.14,0.15,0.16,0.17,0.18,0.19,
          0.2,0.21,0.22,0.23,0.24,0.25,0.26,0.27,0.28,0.29,
          0.3,0.31,0.32
        ]
      },
      {
        phase: 'Beta',
        patches: [
          0.33,
          0.42,0.44,0.49,
          0.51,0.53,0.55,0.57,0.59,
          0.6,0.61,0.62
        ]
      },
      {
        phase: 'Release',
        patches: [
          1.63,1.64,1.65,1.66,1.67,1.69,
          1.71,1.73,1.74,1.75,1.76
        ]
      }
    ].reverse()
  }
})

Template.databaseNav.events({
  'mouseenter a[data-option]' (e) {
    $('.showing').removeClass('showing');
    var option = $(e.currentTarget).attr('data-option');

    $(e.currentTarget).addClass('showing');
    $('.nav-suboptions').addClass('showing');
    $('[data-suboption="' + option + '"]').addClass('showing')
  },
  'mouseleave .database-nav' (e) {
    $('.showing').removeClass('showing');
  }
})
