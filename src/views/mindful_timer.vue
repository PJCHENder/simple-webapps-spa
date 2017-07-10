<template>
  <div class="wrapper">
    <div class="fork-me">
      <a href="https://github.com/PJCHENder/MindfulTimer">
          <img style="position: absolute; top: 0; left: 0; border: 0; z-index: 1;" src="https://camo.githubusercontent.com/567c3a48d796e2fc06ea80409cc9dd82bf714434/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f6c6566745f6461726b626c75655f3132313632312e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_left_darkblue_121621.png">
      </a>
    </div>

    <div class="col-3 alert alert-success text-center" role="alert">
        Saved Successfully
    </div>

    <div class="container-fluid">

        <div class="timer-panel">

          <transition name="fade">
            <div v-if="!restTimeString" class="set-task-panel">
              <div class="form-group row no-gutters">
                  <label for="set-task" class="col-4 col-form-label">寫下任務</label>
                  <div class="col-8">
                      <input class="form-control" type="text" id="set-task" placeholder="寫 Code" v-model="setTask">
                  </div>
              </div>

              <div class="set_time form-group row no-gutters">
                  <label for="set_time" class="col-4 col-form-label">設定分鐘</label>
                  <div class="col-8">
                      <input class="form-control" type="number" id="set_time" placeholder="20" v-model="setTaskTime">
                  </div>
              </div>
            </div>

            <div v-else class="show-task-panel card text-center">
              <div class="card-header">
                  目前任務
              </div>
              <div class="card-block">
                  <h4 class="card-title">{{ currentTask }}</h4>
              </div>
              <div id="show" class="card-footer text-muted">
                {{ restTimeString }}
              </div>
            </div>
          </transition>

            <div class="row no-gutters">
                <button type="button" class="btn btn-outline-primary btn-block" id="clocking" 
                  @click.prevent.stop="startHandler"
                  
                  v-show="!restTimeString"
                  >Start</button>
                <button type="button" class="btn btn-outline-primary btn-block" id="reset" 
                  @click.prevent.stop="resetTimer"
                  v-show="restTimeString"
                  >Reset</button>
            </div>

            <div class="row card no-gutters card-outline-secondary mb-3 text-center" v-show="logger.length > 0">
                <ul class="card-block" id="log">
                  <li v-for="item in logger" :key="item.time">{{`${item.time} => ${item.task}`}}</li>
                </ul>
            </div>

        </div>

        <div class="note">
            <textarea class="form-control" id="note" v-model="noteContent"></textarea>
            <p class="copyright"> <a href="https://pjchender.blogspot.com" target="_blank">PJCHENder</a> </p>
        </div>

    </div>
  </div>
</template>

<script>
import request from 'superagent'

let endpoint = (process.env.NODE_ENV === "production") ? 'https://simple-webapps.herokuapp.com/v1.0' : 'http://localhost:3000/v1.0'

let UNSET_TASK = '未設定'

/** * debounce function * 讓某函式在一定時間內只能觸發一次，目的是提升效能**/
function _debounce(func, wait = 20, immediate = true) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

export default {
  name: 'mindful_timer',
  data () {
    return {
      setTask: '',                 // 設定當前任務
      setTaskTime: "",             // 設定所需時間
      timerId: false,              // 是否已經在計時
      stopTimeStamp: null,         // 計算結束時的時間戳記（毫秒）
      restMs: null,                // 計算剩餘的時間（毫秒）
      logger: [],                  // 記錄完成的工作項目
      noteContent: '',             // 備註區
      noteUpdatedAt: '',
      noteOnCloud: '',
      noteOnCloudUpdatedAt: '',
      localStorageIsExist: false
    }
  },
  computed: {
    // 剩餘時間（字串）
    restTimeString () {
      if (this.restMs < 0 || !this.restMs) {return false}
      let seconds = String(parseInt((this.restMs / 1000) % 60))
      let minutes = String(parseInt((this.restMs / (1000 * 60)) % 60))
      let resetTimeString = `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
      document.title = resetTimeString
      return resetTimeString
    },
    currentTask () {
      return this.setTask || '尚未設定任務'
    },
    credential () {
      console.log('credential')
      let credentialState = this.$store.state.credentialModule
      // #1-1: 向 server 要資料
      if (credentialState.authorized && credentialState.accessToken) {
        // #2-1 facebook 已登入
        console.log('getNoteFromServer in credential')
        this.getNoteFromServer(credentialState.accessToken)
      }
      // #2-2 facebook 未登入
      return {
        accessToken: credentialState.accessToken || null,
        authorized: credentialState.authorized || false
      }
    },
    equalLocalAndServer () {
      let local = new Date(this.noteUpdatedAt).getTime()
      let server = new Date(this.noteOnCloudUpdatedAt).getTime()
      return (local === server) ? true : false
    }
  },
  methods: {
    //  將分鐘數轉為毫秒
    min2ms (minutes) {
      return minutes * 60 * 1000
    },
    //  按下開始計時
    startTimer () {
      // STEP1: 如果 Timer 已經計時中，則先重設
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      // STEP2: 結束時的時間戳記 = 按下開始時的時間戳記 + 使用者設定的時間（毫秒）
      this.stopTimeStamp = Date.now() + this.min2ms(this.setTaskTime)
      this.timerId = setInterval(this.refreshRestTime, 1000)
    },
    startHandler () {
      this.startTimer()
      this.saveNoteToServer()
    },
    // 更新剩餘時間
    refreshRestTime () {
      // STEP3: 剩餘時間 = 結束時的時間戳記 - 當前的時間戳記
      this.restMs = this.stopTimeStamp - Date.now()
      if (this.restMs < 100) {
        clearInterval(this.timerId)
        // logger 把完成的事情記錄下來
        let currentTimeObject = new Date()
        this.logger.push({
          task: this.currentTask,
          time: `${String(currentTimeObject.getHours()).padStart(2, '0')}:${String(currentTimeObject.getMinutes()).padStart(2, '0')}:${String(currentTimeObject.getSeconds()).padStart(2, '0')}`
        })
        window.alert("Time's Up")
      }
    },
    resetTimer () {
      clearInterval(this.timerId)
      this.setTask = ''
      this.restMs = 0
      document.title = 'Mindful Timer'
    },

    /**
     * Interact with LocalStorage
     **/
    getNoteFromLocalStorage () {
      if (!localStorage.getItem('noteContent')) {
        this.localStorageIsExist = false
      } else {
        console.log('getNoteFromLocalStorage')
        this.noteContent = localStorage.getItem('noteContent')
        this.noteUpdatedAt = localStorage.getItem('noteUpdatedAt')
        this.localStorageIsExist = true
      }
    },
    saveNoteToLocalStorage: _debounce(function () {
      console.log('saveNoteToLocalStorage')
      localStorage.setItem('noteContent', this.noteContent)
      localStorage.setItem('noteUpdatedAt', new Date().toISOString())
      this.noteUpdatedAt = new Date().toISOString()
      this.localStorageIsExist = true
      this.$store.commit('emit/Flash', 'Auto Saved Locally.')
    }, 1500, false),
    /**
     * Interact with Server
    **/
    createNoteToServer () {
      let vm = this
      request.post(endpoint + '/note/')
      .type('application/json')
      .set({Authorization: vm.credential.accessToken})
      .end((err, res) => {
        if (err) {
          this.$store.commit('emit/Alert', err)
        }
        let response = JSON.parse(res.text)
        vm.noteOnCloudUpdatedAt = response.newNote.updated_at
        console.log('createNoteToServer')
      })
    },
    getNoteFromServer(accessToken){
      let vm = this
      request.get(endpoint + '/note/')
      .type('application/json')
      .set({Authorization: accessToken})
      .end((err, res) => {
        if (err) {
          this.$store.commit('emit/Alert', err)
        }
        let response = JSON.parse(res.text)
        if (response.status === 400) {
          // Server 上的 Note 尚未建立
          console.log('createNoteToServer')
          vm.createNoteToServer()
        } else if (response.status === 200) {
          console.log('response', response)
          vm.noteOnCloud = response.note
          vm.noteOnCloudUpdatedAt = response.updated_at
          
          if (vm.localStorageIsExist) {
            // #4-1 存取 localStorage 的資料
            // vm.saveNoteToServer()
          } else {
            // #4-2 facebook以登入 > localStorage 尚未建立 > 存取 Server 的資料
            vm.noteContent = response.note || []
            vm.noteUpdatedAt = response.updated_at || ''
          }
          console.log('getNoteFromServer')
        } else {
          this.$store.commit('emit/Alert', "Error in getNoteForServer in MindfulTimer.vue")
        }
      })

    },
    saveNoteToServer () {
      console.log('saveNoteToServer')
      let vm = this
      request.put(endpoint + '/note')
      .type('application/json')
      .set({Authorization: vm.credential.accessToken})
      .send({noteContent: vm.noteContent})
      .end((err, res) => {
        if (err) {
          vm.$store.commit('emit/Alert', `Error occurred in saveNoteToServer in mindful_timer.vue(${err})`)
        }
        let response = JSON.parse(res.text)
        
        if (response.status === 200) {
          vm.noteUpdatedAt = response.updated_at
          vm.noteOnCloudUpdatedAt = response.updated_at
          localStorage.setItem('noteUpdatedAt', response.updated_at)
          vm.$store.commit('emit/Flash', '成功儲存於雲端')
        } else {
          vm.$store.commit('emit/Alert', `Error occurred in saveNoteToServer in mindful_timer.vue(${response.message})`)
        }

      })
    }

  },
  watch: {
    noteContent (newVal, oldVal) {
      this.saveNoteToLocalStorage()
    },
    credential: {
      // 把 credential 放在 watch 是希望能夠促使 computed credential 的資料更新
      handler: function(val, oldVal){
        return
      },
      deep: true,        // 監聽物件內部值的變化
      immediate: true    // 立即以 someObject 的觸發值執行 callback
    }
  },
  created () {
    this.getNoteFromLocalStorage()
  }
}
</script>

<style lang="scss" scoped>
  .wrapper{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .container-fluid {
    background-color: #E8E8E8;
    padding: 0px 35px;
    display: flex;
    border-radius: 5px;
    justify-content: space-around;
    width: 95%;
    height: 95%;
  }
  .timer-panel{
    width: 320px;
    margin-top: 50px;
    margin-right: 15px;
  }

  .note{
    flex-grow: 1;
    margin-top: 50px;
    margin-bottom: 50px;
    margin-left: 15px;
    .form-control{
      height: 100%;
    }

    .copyright {
      text-align: right;
      color: #CCC;
      padding-top: 15px;
      padding-bottom: 5px;
      margin-bottom: 0;

      a{
        color: #AAA;
      }
    }
  }

  .card {
    margin-top: 0.5em;
    border: 1px solid #CCC;
  }

  .alert {
    position: fixed;
    top: 10px;
    right: 50px;
    z-index: 5;
    display: none;
  }

  .show-task-panel {
    margin-bottom: 1em;
  }

  #log {
    list-style: none;
    margin-top: 0;
    margin-bottom: 0;
  }

  input::placeholder {
    color: #D8D8D8;
  }

  .fade-enter-active,
  .fade-leave,
  .fade-enter-to {
    transition: all 1s;
    opacity: 1;
    background-color: red;
  }
  .fade-enter,
  .fade-leave-active,
  .fade-leave-to {
    opacity: 0.3;
    transition: all 1s;
    background-color: yellow;
  }


  @media screen and (max-width: 480px) {
    .note{
      display: none;
    }
  }
</style>