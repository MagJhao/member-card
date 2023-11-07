// 設定遊戲狀態,放在文件最上方
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {

  getCardElement(index) {
    //渲染卡片內部元素：view.getCardElement
    //改成渲染牌背元件
    //取得卡片索引：在元素上設定 data-set
    return `<div data-index=${index} class="card back"></div>`
  },

  getCardContent(index) { //產生牌面元件
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
        <p>${number}</p>
        <img src="${symbol}" />
        <p>${number}</p>
      </div>`
  },

  transformNumber(number) { //特殊數字轉換：transformNumber
    switch (number) {
      case 1: return 'A'
      case 11: return 'J'
      case 12: return 'Q'
      case 13: return 'K'
      default: return number
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
    // 修改utility.getRandomNumberArray(indexes)為indexes
  },

  flipCards(...cards) {  //翻牌：view.flipCard
    //牌面與牌背分開處理
    cards.map(card => {
      // 如果是正面
      if (card.classList.contains('back')) { //點擊一張覆蓋的卡片 → 回傳牌面內容 (數字和花色)
        // 回傳背面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        // 在翻牌時運用 card.dataset.index 來運算卡片內容，別忘了 HTML 回傳的是字串，要改成數字
        return
      }

      // 如果是背面
      // 回傳正面
      card.classList.add('back') //點擊一張翻開的卡片 → 重新覆蓋卡片，意即把牌面內容清除，重新呼叫牌背樣式(背景)
      card.innerHTML = null
    })
  },

  pairCards(...cards) { // 改變卡片底色
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) { // 這個函式裡會為卡片加入 .wrong 類別，一旦加入就會開始跑動畫
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },

  showGameFinished() { // 遊戲結束時呼叫這個函式來顯示遊戲結束畫面
    const div = document.querySelector('div')
    div.classList.add('completed')
    div.innerHTML = `
    <p>Complete!</p>
    <p>Score: ${model.score}</p>
    <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const utility = { //洗牌演算法：Fisher-Yates Shuffle
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]] //交換陣列元素
    }
    return number
  }
}

const model = {
  revealedCards: [], // 代表「被翻開的卡片」

  // 檢查使用者翻開的兩張卡片是否相同
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,

  triedTimes: 0
}

// 整理：Controller 在外、view 隱藏於內部
const controller = {
  currentState: GAME_STATE.FirstCardAwaits, // 加在第一行,用來標記目前的遊戲狀態

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
    //由 controller 啟動遊戲初始化，在 controller 內部呼叫 view.displayCards
    //由 controller 來呼叫 utility.getRandomNumberArray，避免 view 和 utility 產生接觸
  },

  // 依照不同的遊戲狀態,做不同的行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    //用 switchLinks to an external site. 取代 if/else，讓程式碼看起來簡潔一點
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.renderTriedTimes(++model.triedTimes) // 次數就要 +1
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)

        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對正確
          view.renderScore((model.score += 10)) // 分數 +10

          this.currentState = GAME_STATE.CardsMatched // 改變遊戲狀態為 CardsMatched
          view.pairCards(...model.revealedCards) // 讓卡片在牌桌上維持翻開，改變卡片底色樣式
          model.revealedCards = [] //清空 model 的暫存卡片陣列

          if (model.score === 260) { // 加在這裡，呼叫函式
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }

          this.currentState = GAME_STATE.FirstCardAwaits // 動作結束後，再把遊戲狀態改成 FirstCardAwaits
          // 配對成功 → 維持翻開並改變樣式
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed // 改變遊戲狀態為 CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards) // 配對失敗的流程中呼叫 view，這行要加在 setTimeout 之前          
          // 呼叫
          setTimeout(this.resetCards, 1000)// 延遲一秒讓使用者記憶卡片
        }
        break
    }

    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },

  // 函式
  resetCards() {
    view.flipCards(...model.revealedCards) // 翻回卡片
    model.revealedCards = [] // 清空 model 的暫存卡片陣列
    controller.currentState = GAME_STATE.FirstCardAwaits // 動作結束後，再把遊戲狀態改成 FirstCardAwaits
  }
}

controller.generateCards() //渲染卡片：view.displayCards // 取代 view.displayCards()

//Node List (array-like)  每張卡片加上事件監聽器
//改寫事件監聽器 ，讓使用者點擊卡牌時，呼叫 flipCard(card)
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card) // 修改成controller.dispatchCardAction(card)
  })
})