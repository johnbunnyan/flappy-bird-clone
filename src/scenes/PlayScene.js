
import BaseScene from './BaseScene';

const PIPES_TO_RENDER = 4;

class PlayScene extends BaseScene {

  constructor(config) {
    super('PlayScene', config);

    this.bird = null;
    this.pipes = null;
    this.isPaused = false;

    this.pipeHorizontalDistance = 0;
    this.flapVelocity = 300;

    this.score = 0;
    this.scoreText = '';

    this.currentDifficulty = 'easy';
    this.difficulties = {
      'easy': {
        pipeHorizontalDistanceRange: [300, 350],
        pipeVerticalDistanceRange: [150, 200]
      },
      'normal': {
        pipeHorizontalDistanceRange: [280, 330],
        pipeVerticalDistanceRange: [140, 190]
      },
      'hard': {
        pipeHorizontalDistanceRange: [250, 310],
        pipeVerticalDistanceRange: [50, 100]
      }
    }
  }

  create() {
    // 생성자 내 선언된 변수를 여기서 재할당
    this.currentDifficulty = 'easy';



    // create에 해당하는 1차 메서드들 호출
    
    // Base 씬으로 배경 생성
    super.create();
  
    // 씬 화면에 보이는 컴포넌트 관련 메서드
    this.createBird();
    this.createPipes();
    this.createColliders();
    this.createScore();
    this.createPause();

    // 입력 관련 메서드
    this.handleInputs();
    this.listenToEvents();

    // 애니메이션 효과 생성
    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('bird', { start: 9, end: 15}),
      // 24 fps default, it will play animation consisting of 24 frames in 1 second
      // in case of framerate 2 and sprite of 8 frames animations will play in
      // 4 sec; 8 / 2 = 4
      frameRate: 8,
      // repeat infinitely
      repeat: -1
    })

    // 애니메이션 효과를 실제 스프라이트에 적용
    this.bird.play('fly');
  }

  update() {
    this.checkGameStatus();
    this.recyclePipes();
  }

  // 1️⃣create() 호출부
  // 현 이벤트가 resume일 때, 카운트다운해서 재시작
  listenToEvents() {
    if (this.pauseEvent) { return; }

    this.pauseEvent = this.events.on('resume', () => {
      this.initialTime = 3;
      this.countDownText = this.add.text(...this.screenCenter, 'Fly in: ' + this.initialTime, this.fontOptions).setOrigin(0.5);
      this.timedEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        callbackScope: this,
        loop: true
      })
    })
  }

  // 2️⃣바로 위에 있는 create() -> listenToEvents() 호출부
  countDown() {
    this.initialTime--;
    this.countDownText.setText('Fly in: ' + this.initialTime);
    if (this.initialTime <= 0) {
      this.isPaused = false;
      this.countDownText.setText('');
      this.physics.resume();
      this.timedEvent.remove();
    }
  }

  // 호출부 x -> super.create(); 로 대체
  createBG() {
    this.add.image(0, 0, 'sky').setOrigin(0);
  }


  // 1️⃣create() 호출부
  createBird() {
                // PlayScene 산하 스프라이트 추가
    this.bird = this.physics.add.sprite(this.config.startPosition.x, this.config.startPosition.y, 'bird')
      .setFlipX(true)
      .setScale(3)
      .setOrigin(0);

      //.sprite산하 추가 메서드 및 속성 추가 적용
    this.bird.setBodySize(this.bird.width, this.bird.height - 8);
    this.bird.body.gravity.y = 600;
    this.bird.setCollideWorldBounds(true);
  }


  // 1️⃣create() 호출부
  createPipes() {
    // 스프라이트를 그룹으로 묶는 group() 메서드를 생성자 변수에 할당
    this.pipes = this.physics.add.group();

    // 위 아래 파이프 생성
    for (let i = 0; i < PIPES_TO_RENDER; i++) {
      const upperPipe = this.pipes.create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 1);
      const lowerPipe = this.pipes.create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 0);

        // placePipe메서드는 생성된 upperPipe,lowerPipe의 x,y 좌표를 수정하는 역할을 할 뿐
      this.placePipe(upperPipe, lowerPipe)
    }
    // x축으로 해당 스프라이트가 이동하게 함
    // 화면 상 -값을 넣으면 해당 스프라이트가 <- 방향으로 이동
    this.pipes.setVelocityX(-200);
  }

  // 1️⃣create() 호출부
  // 첫번째, 두번째 - 스프라이트
  // 세번째 - 직접 만든 충돌 시 실행할 메서드
  createColliders() {
    this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
  }


  // 1️⃣create() 호출부
  createScore() {
    this.score = 0;
    const bestScore = localStorage.getItem('bestScore');
    this.scoreText = this.add.text(16, 16, `Score: ${0}`, { fontSize: '32px', fill: '#000'});
    this.add.text(16, 52, `Best score: ${bestScore || 0}`, { fontSize: '18px', fill: '#000'});
  }


  // 1️⃣create() 호출부
  createPause() {
    this.isPaused = false;
    // 현재 width,height기반 위치로 한 버튼 이미지 생성
    const pauseButton = this.add.image(this.config.width - 10, this.config.height -10, 'pause')
      .setInteractive()
      .setScale(3)
      .setOrigin(1);

      //버튼에 대한 이벤트
    pauseButton.on('pointerdown', () => {
      this.isPaused = true;
      this.physics.pause();

      // 씬 이동 과정 (현재 씬 멈추고 PauseScene씬 시작)
      this.scene.pause();
      this.scene.launch('PauseScene');
    })
  }


  // 1️⃣create() 호출부
  handleInputs() {
    this.input.on('pointerdown', this.flap, this);
    this.input.keyboard.on('keydown_SPACE', this.flap, this);
  }


  // 1️⃣update() 호출부
  checkGameStatus() {
    if (this.bird.getBounds().bottom >= this.config.height || this.bird.y <= 0) {
      this.gameOver();
    }
  }

  // 2️⃣create() -> createPipes() 
  // && 2️⃣update() -> recyclePipes()  호출부
  // 이 메서드는 createPipes내부 for문 안에서 반복해서 실행되고 있다.
  placePipe(uPipe, lPipe) {
    // 생성자 선언된 currentDifficulty에 따라 difficulty 난이도 객체 가져오기
    const difficulty = this.difficulties[this.currentDifficulty];
    // 지금 메서드가 호출되고 있는(createPipes) 문맥 상 가장 오른쪽 x라는 말은
    // 가장 최근에(마지막에 생성된 파이프의 x축)이라는 말
    const rightMostX = this.getRightMostPipe();
    
    // 추가된 랜덤의 간격
    const pipeVerticalDistance = Phaser.Math.Between(...difficulty.pipeVerticalDistanceRange);
    const pipeHorizontalDistance = Phaser.Math.Between(...difficulty.pipeHorizontalDistanceRange);
    // 페이저 랜덤 메서드
const pipeVerticalPosition = Phaser.Math.Between(0 + 20, this.config.height - 20 - pipeVerticalDistance);

    // 위쪽 파이프 x,y
    // 상위메서드(createPipes)에서 새롭게 생성될 파이프의 x위치는 마지막에 생성된
    // rightMostX메서드에 간격을 더한 것이다
    uPipe.x = rightMostX + pipeHorizontalDistance;
    uPipe.y = pipeVerticalPosition;

    // 아래쪽 파이프 x,y
    lPipe.x = uPipe.x; // 아래쪽은 위쪽이랑 x좌표가 같다
    lPipe.y = uPipe.y + pipeVerticalDistance // 아래 파이프의 높이(y)는 위쪽 y좌표에 일정한 간격을 더한 것 뿐이다
  }


  // 1️⃣update() 호출부
  recyclePipes() {
    const tempPipes = [];
    this.pipes.getChildren().forEach(pipe => {
      // 파이프의 경계 오른쪽 면이 0 이하 즉, 화면 왼쪽으로 나가면
      if (pipe.getBounds().right <= 0) {
        tempPipes.push(pipe);
        // length를 2로 한 것은 파이프 위쪽이랑 아래쪽
        if (tempPipes.length === 2) {
          // 파이프를 배치하는 배서드 다시 호출
          this.placePipe(...tempPipes);
          this.increaseScore();
          this.saveBestScore();
          this.increaseDifficulty();
        }
      }
    })
  }

  // 2️⃣update() -> recyclePipes() 호출부
  // 해당 메서드의 메커니즘
  // 전역 생성자에 선언된 두 변수 간의 값 조정 - score에 따라 currentDifficulty 변경 -> create()->placePipe()메서드에 영향
  increaseDifficulty() {
    if (this.score === 1) {
      this.currentDifficulty = 'normal';
    }

    if (this.score === 3) {
      this.currentDifficulty = 'hard';
    }
  }


  // 3️⃣create() -> createPipes() -> placePipe()
  // && 3️⃣update() -> recyclePipes() -> placePipe() 
  getRightMostPipe() {
    let rightMostX = 0;
    // 현재 파이프들을 전부 보면서 x축이 가장 큰, 그러니까 가장 오른쪽에 있는 파이프의 x좌표 리턴
    this.pipes.getChildren().forEach(function(pipe) {
      rightMostX = Math.max(pipe.x, rightMostX);
    })

    return rightMostX;
  }


  // 2️⃣update() -> recyclePipes() 
  // && 3️⃣create() -> createColliders() -> gameOver() 호출부
  saveBestScore() {
    const bestScoreText = localStorage.getItem('bestScore');
    //bestScoreText가 존재하면(true) 그걸 숫자로 parseInt숫자로 리턴(두번째 파라미터 10은 진수)
    const bestScore = bestScoreText && parseInt(bestScoreText, 10);

    // bestScore가 없거나 현재 씬 전역 score가 로컬스토리지 score보다 크면 갱신
    if (!bestScore || this.score > bestScore) {
      localStorage.setItem('bestScore', this.score);
    }
  }

  // 2️⃣create() -> createColliders() 호출부
  gameOver() {
    // 해당 씬의 물리작용 멈춤
    this.physics.pause();
    this.bird.setTint(0xEE4824);
    // 추가 구현한 메서드 실행
    this.saveBestScore();

    //해당 씬의 시간에 따른 이벤트
    this.time.addEvent({
      delay: 1000, //1초 뒤에
      callback: () => {
        this.scene.restart();
      },
      loop: false
    })
  }


  // 2️⃣create() -> handleInputs() 호출부
  // 인풋 이벤트에 해당하는 콜백 메서드
  flap() {
    if (this.isPaused) { return; } // 조건에 따라 아래 줄 실행 안되게
    // velocity는 '움직임, 이동'이라고 이해하기, -붙으니까 y축 기준 위쪽으로 이동하게 됨
    this.bird.body.velocity.y = -this.flapVelocity;
  }


  // 2️⃣update() -> recyclePipes() 호출부
  increaseScore() {
    this.score++;
    //scoreText == add.text에서 좌표 미리 지정했음, setText로 내용만 변경
    this.scoreText.setText(`Score: ${this.score}`)
  }
}

export default PlayScene;
