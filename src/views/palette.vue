<template>
  <div>
    <h1>Save Whatever Color You Like</h1>
    <hr>
    <div class="enter-color container">

      <div class="row justify-content-end export-or-save">
        <button type="button"
          :class="['btn', 'col-md-2',{'btn-outline-secondary': !colorPalette.length},{'btn-outline-primary': colorPalette.length}]"
          @click.prevent.stop="exportPalette"
        >{{ words.view.export }}</button>
        <button type="button"
          :class="['btn', 'col-md-2',{'btn-outline-secondary': equalLocalAndServer},{'btn-outline-primary': !equalLocalAndServer}]"
          @click.prevent.stop="savePaletteToServer"
        >{{ words.view.save }}</button>
      </div>

      <div class="color-to-pick row justify-content-md-center align-items-center">
        <div class="col-md-6">
          <input type="color" v-model="pickColor.hexColor">
          <input type="text" placeholder="#FFFFFF"
            id="input-hex-color"
            v-model="pickColor.hexColor"
            @keyup.enter="enterHandler"
            >
          <input type="text" placeholder="variable name" 
            v-model="pickColor.name"
            @keyup.enter="enterHandler"
            >
        </div>
        <div class="col-md-1">
          <!-- 如果輸入的顏色不存在資料庫中，則新增 -->
          <button type="button"
            v-show="!checkSameColor"
            :class="['btn', {'btn-outline-secondary': !verifyColor}, {'btn-outline-primary': verifyColor}]" 
            @click.prevent.stop="addColor"
            >{{ words.view.save }}</button>
          <!-- 如果輸入的顏色存在資料庫中，則更新 -->
          <button type="button"
            v-show="checkSameColor"
            :class="['btn',{'btn-outline-secondary': !verifyColor}, {'btn-outline-primary': verifyColor}]" 
            @click.prevent.stop="updateColor"
            >{{ words.view.update }}</button>
        </div>
      </div>
    </div>

    
    <div class="color-palette container" v-show="colorPalette.length">
      <div class="row">
        <div class="col-12">
          <input type="text" class="search-input" placeholder="Search by Variable Name" 
            v-model="searchColor"
          >
        </div>
      </div>
      <div class="row justify-content-start">
        
          <ul class="col-12">
            <li class="color-block" 
              v-for="item in visibleColorPalette"
              :key="item.hexColor"
              :style="{'background-color': item.hexColor}" 
              @click.prevent.stop="showColor(item.hexColor, item.name)">
                <span 
                class="delete-color"
                @click.prevent.stop="deleteColor(item.hexColor)">X</span>
            </li>
          </ul>
        
      </div>
    </div>
    <textarea hidden id="contentToExport" v-model="contentToExport"></textarea>
  </div>
</template>
 
<script>
import hexToHsl from 'hex-to-hsl'
import request from 'superagent'

let endpoint = process.env.NODE_ENV ? 'https://simple-webapps.herokuapp.com/v1.0' : 'http://localhost:3000/v1.0'

export default {
  name: 'palette',
  data () {
    return {
      pickColor: {
        hexColor: '',
        name: ''
      },
      searchColor: '',
      colorPalette: [],
      colorPaletteUpdatedAt: '',
      colorPaletteOnCloud: [],
      colorPaletteOnCloudUpdatedAt: '',
      localStorageIsExist: false,
      words: {
        view: {
          export: 'Export',
          save: 'Save',
          add: 'Add',
          update: 'Update'
        },
        controller: {
          invalidHexColor: 'Invalid Hex Colors',
          alreadySetColor: 'This color has already set.',
          colorNotFound: 'can not find the color in updateColor()',
          successful: 'successful',
          failed: 'failed',
          copiedToClipboard: 'Copied to clipboard',
          somethingWrong: 'Oops!! Something go wrong',
          saveOnCloudSuccess: 'Save on cloud successful',
          autoUpdatedSuccessLocal: 'Auto updated successful in local'
        }
      }
    }
  },
  computed: {
    visibleColorPalette () {
      return this.colorPalette.filter(color => {
        let regex = new RegExp(this.searchColor, 'gi')
        return color.name.match(regex)
      })
    },
    credential () {
      let credentialState = this.$store.state.credentialModule
      // #1-1: 向 server 要資料
      if (credentialState.authorized && credentialState.accessToken) {
        // #2-1 facebook 已登入
        this.getPaletteFromServer(credentialState.accessToken)
      }
      // #2-2 facebook 未登入
      return {
        accessToken: credentialState.accessToken || null,
        authorized: credentialState.authorized || false
      }
    },
    verifyColor () {
      return /^#[0-9A-F]{6}$/i.test(this.pickColor.hexColor)
    },
    contentToExport () {
      let exportContent = ''
      this.colorPalette.forEach(color => {
        exportContent += `$${color.name}: ${color.hexColor};\n`
      })
      return exportContent
    },
    checkSameColor() {
      let findColorIndex = this.colorPalette.findIndex(item => item.hexColor.toUpperCase() === this.pickColor.hexColor.toUpperCase())
      if (findColorIndex !== -1 ) { 
        this.pickColor.name = this.colorPalette[findColorIndex].name
        return true
      }
      return false
    },
    equalLocalAndServer () {
      let local = new Date(this.colorPaletteUpdatedAt).getTime()
      let server = new Date(this.colorPaletteOnCloudUpdatedAt).getTime()
      return (local === server) ? true : false
    }
  },
  methods: {
    addColor() {
      if (!this.verifyColor) {
        this.$store.commit('emit/Alert', this.words.controller.invalidHexColor)
      } else if (this.checkSameColor) {
        this.$store.commit('emit/Alert', this.words.controller.alreadySetColor)
      } else {
        let pickColor = Object.assign({}, this.pickColor, {
          hexColor: this.pickColor.hexColor.toUpperCase(),
          hue: hexToHsl(this.pickColor.hexColor)[0]
        })
        this.colorPalette.splice(0, 0, pickColor)
        if (!this.localStorageIsExist) {
          // #4-4 facebook 未登入 > localStorage 未建立 > 使用者輸入資料
          this.savePaletteToLocalStorage(this.colorPalette)
        }
        this.pickColor.hexColor = ''
        this.pickColor.name = ''
        document.querySelector('#input-hex-color').focus()
      }
    },
    updateColor () {
      let colorIndex = this.colorPalette.findIndex(item => item.hexColor.toUpperCase() === this.pickColor.hexColor.toUpperCase());
      let pickColor = Object.assign({}, this.pickColor, {
        name: this.pickColor.name
      })

      if(colorIndex === -1) {
        this.$store.commit('emit/Alert', this.words.controller.colorNotFound)
        return
      }
      this.colorPalette.splice(colorIndex, 1, pickColor)
      this.pickColor.hexColor = ''
      this.pickColor.name = ''
      document.querySelector('#input-hex-color').focus()
    },
    showColor(hexColor, name) {
      this.pickColor.hexColor = hexColor
      this.pickColor.name = name
    },
    deleteColor(hexColor){
      let deleteColorIndex = this.colorPalette.findIndex(item => item.hexColor.toUpperCase() === hexColor.toUpperCase())
      this.colorPalette.splice(deleteColorIndex, 1)
    },
    exportPalette(){
      // 複製 SCSS 色票到剪貼簿
      let copyContentToExport = document.querySelector('#contentToExport')
      copyContentToExport.removeAttribute('hidden') // 要沒有 hidden 才 select 得到
      contentToExport.select()

      try {
        // Now that we've selected the anchor text, execute the copy command  
        let successful = document.execCommand('copy')
        let msg = successful ? this.words.controller.successful : this.words.controller.failed
        this.$store.commit('emit/Flash', this.words.controller.copiedToClipboard + ' ' + msg)
      } catch(err) {
        this.$store.commit('emit/Flash', this.words.controller.somethingWrong)
      }

      /* unselect the range */
      copyContentToExport.setAttribute('hidden', "")
      window.getSelection().removeAllRanges()
    },
    enterHandler(){
      if(this.checkSameColor === true) {
        this.updateColor()
      } else {
        this.addColor()
      }
    },
    /**
     * Interact with LocalStorage
    **/
    getPaletteFromLocalStorage () {
      if (!localStorage.getItem('colorPalette')) {
        // #3-2: localStorage 尚未建立
        // #3-4: localStorage 尚未建立
        this.localStorageIsExist = false
      } else {
        // #3-1: facebook 已登入 > localStorage 曾建立
        // #3-3: facebook 未登入 > localStorage 曾建立
        // #4-1: facebook 已登入 > localStorage 曾建立 > 存取 localStorage 的資料
        // #4-3: facebook 未登入 > localStorage 曾建立 > 存取 localStorage 的資料
        this.colorPalette = JSON.parse(localStorage.getItem('colorPalette'))
        this.colorPaletteUpdatedAt = localStorage.getItem('paletteUpdateAt')
        this.localStorageIsExist = true
      }
    },
    savePaletteToLocalStorage (value = []) {
      localStorage.setItem('colorPalette', JSON.stringify(value))
      localStorage.setItem('paletteUpdateAt', new Date().toISOString())
      this.colorPaletteUpdatedAt = new Date().toISOString()
      this.localStorageIsExist = true
      this.$store.commit('emit/Flash', this.words.controller.autoUpdatedSuccessLocal)
    },
    /**
     * Interact with Server
     **/
    createPaletteToServer() {
      let vm = this
      request.post(endpoint + '/palette/')
      .type('application/json')
      .set({Authorization: vm.credential.accessToken})
      .end((err, res) => {
        if (err) {
          this.$store.commit('emit/Alert', err)
        }
        let response = JSON.parse(res.text)
        vm.colorPaletteOnCloudUpdatedAt = response.newPalette.updated_at
      })
    },
    getPaletteFromServer(accessToken){
      let vm = this
      request.get(endpoint + '/palette/')
      .type('application/json')
      .set({Authorization: accessToken})
      .end((err, res) => {
        if (err) {
          this.$store.commit('emit/Alert', err)
        }
        let response = JSON.parse(res.text)
        if (response.status === 400) {
          // Server 上的 Palette 尚未建立
          vm.createPaletteToServer()
        } else if (response.status === 200) {
          vm.colorPaletteOnCloud = response.colors
          vm.colorPaletteOnCloudUpdatedAt = response.updated_at
          
          if (vm.localStorageIsExist) {
            // #4-1 存取 localStorage 的資料
            // vm.savePaletteToServer()
          } else {
            // #4-2 facebook以登入 > localStorage 尚未建立 > 存取 Server 的資料
            vm.colorPalette = response.colors || []
            vm.colorPaletteUpdatedAt = response.updated_at || ''
          }

        } else {
          this.$store.commit('emit/Alert', "Error in getPaletteFromServer in Palette.vue")
        }
      })
    },
    savePaletteToServer () {
      let vm = this
      request.put(endpoint + '/palette')
      .type('application/json')
      .set({Authorization: vm.credential.accessToken})
      .send({colors: vm.colorPalette})
      .end((err, res) => {
        if (err) {
          vm.$store.commit('emit/Alert', `Error occurred in savePaletteToServer in palette.vue(${err})`)
        }
        let response = JSON.parse(res.text)
        
        if (response.status === 200) {
          vm.colorPaletteUpdatedAt = response.updated_at
          vm.colorPaletteOnCloudUpdatedAt = response.updated_at
          localStorage.setItem('paletteUpdateAt', response.updated_at)
          vm.$store.commit('emit/Flash', this.words.controller.saveOnCloudSuccess)
        } else {
          vm.$store.commit('emit/Alert', `Error occurred in savePaletteToServer in palette.vue(${response.message})`)
        }

      })
    }
  },
  watch: {
    colorPalette: {
      handler: function (val, oldVal) {
        if (this.localStorageIsExist) {
          this.savePaletteToLocalStorage(val)
        }
      },
      deep: true,
      immediate: true
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
    // #1-2 向 localStorage 要資料
    this.getPaletteFromLocalStorage()
    
    this.colorPalette = this.colorPalette.map(item => {
      return Object.assign({}, item, {
        hue: hexToHsl(item.hexColor)[0]
      })
    })
    
    // sort the color by hue
    this.colorPalette.sort((a, b) => (a.hue - b.hue) > 0 ? 1 : -1 )
  }
}
</script>

<style lang="scss" scoped>
$red: #C63647;
$disable: #CCC;

.enter-color {
    display: inline-block;
    .color-to-pick {
      border: 1px solid #CCC;
      padding: 15px 30px;
    }
    button {
      cursor: pointer;
    }
    button + button{
      margin-left: 10px;
    }
    input[type="text"] {
      
      padding: 0.5rem 1rem;
      font-size: 1rem;
      border-radius: 0.25rem;
      line-height: 1.25rem;
      outline: 0;
      border: 1px solid $disable;

      &::placeholder{
        color: $disable;
      }
    }
    input[type="color"] {
      vertical-align: top;
      border: 1px solid #CCC;
      border-radius: 0.25rem;
      height: 42px;
      width: 42px;
      background: transparent;
      background-image: none;
      -webkit-appearance: none;
      -moz-appearance: none;
    }
}

.export-or-save{
  margin-top: 30px;
  margin-bottom: 30px;
}

.color-palette {
    min-width: 480px;
    border: 1px solid #CCC;
    margin-top: 16px;
    padding: 10px 30px;
    ul {
      list-style: none;
      font-size: 0px;
      display: flex;
    }

    .search-input {
      width: 100%;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      border-radius: 0.25rem;
      line-height: 1.25rem;
      outline: 0;
      border: 1px solid #CCC;
      margin: 20px auto;

      &::placeholder {
        color: $disable;
      }
    }

    .color-block {
        cursor: pointer;
        width: 70px;
        height: 70px;
        margin: 7px;
        background-color: $red;
        position: relative;
        .delete-color {
            position: absolute;
            right: 0;
            top: 0;
            width: 20px;
            height: 20px;
            background-color: rgba(0, 0, 0, 0.2);
            display: block;
            font-size: 16px;
            line-height: 20px;
            text-align: center;
            color: white;
            opacity: 0;
            transition: 0.3s;
        }
        
        &:hover .delete-color {
            opacity: 1;
        }
    }
}
</style>