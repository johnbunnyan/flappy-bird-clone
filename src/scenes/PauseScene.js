
import BaseScene from './BaseScene';

class PauseScene extends BaseScene {

  constructor(config) {
    super('PauseScene', config);

    this.menu = [
      {scene: 'PlayScene', text: 'Continue'},
      {scene: 'MenuScene', text: 'Exit'},
    ]
  }

  create() {
    super.create();
    // 🔥 create()도 createMenu()도 전부 Base클래스 메서드인데 super/ this로 접근하는 방식이 다르다.
    // 하지만 둘다 정상 작동한다.
    // create는 자식인 Pause씬도 똑같은 이름의 create를 가지고 있기 때문에 명시적으로 부모의 create를 사용함을 알리기 위해 super키워드로 사용
    // 겹치지 않는 createMenu는 그냥 this로 접근
    // this는 this를 선언해준 클래스(Pause씬)내에서 this를 해준 변수를 찾고 없으면 상위 클래스로 찾으러 감
    // super는 애초에 처음부터 상위 클래스 내에서 찾게 되는 것
    this.createMenu(this.menu, this.setupMenuEvents.bind(this));
  }

  setupMenuEvents(menuItem) {
    const textGO = menuItem.textGO;
    textGO.setInteractive();

    textGO.on('pointerover', () => {
      textGO.setStyle({fill: '#ff0'});
    })

    textGO.on('pointerout', () => {
      textGO.setStyle({fill: '#fff'});
    })

    textGO.on('pointerup', () => {
      if (menuItem.scene && menuItem.text === 'Continue') {
        // Shutting down the Pause Scene and resuming the Play Scene
        this.scene.stop();
        this.scene.resume(menuItem.scene);
      } else {
        // Shutting PlayScene, PauseScene and running Menu
        this.scene.stop('PlayScene');
        this.scene.start(menuItem.scene);
      }
    })
  }
}

export default PauseScene;

