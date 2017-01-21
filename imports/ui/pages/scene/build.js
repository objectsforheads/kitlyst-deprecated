import './build.html';
import './build.scss';

Template.scenebuilderBuild.helpers({
  boardRows() {
    return ['A', 'B', 'C', 'D', 'E'];
  },
  boardColumns() {
    return [1,2,3,4,5,6,7,8,9];
  }
})
