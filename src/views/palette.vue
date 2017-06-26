<template>
  <div>
    <h1>建立自己的色票檔(color palette)</h1>
    <hr>
    <div class="enter-color container">

      <div class="row justify-content-end export-or-save">
        <button type="button"
          :class="['btn', 'col-md-2',{'btn-outline-secondary': !colorPalette.length},{'btn-outline-primary': colorPalette.length}]"
          @click.prevent.stop="exportPalette"
        >匯出色票</button>
        <button type="button"
          :class="['btn', 'col-md-2',{'btn-outline-secondary': !localUnequalToSever},{'btn-outline-primary': localUnequalToSever}]"
          @click.prevent.stop="savePaletteToServer"
        >儲存雲端</button>
      </div>

      <div class="color-to-pick row justify-content-md-center align-items-center">
        <div class="col-md-8">
          <input type="color" v-model="pickColor.hexColor">
          <input type="text" placeholder="#FFFFFF" 
            v-model="pickColor.hexColor"
            @keyup.enter="enterHandler"
            >
          <input type="text" placeholder="variable name" 
            v-model="pickColor.name"
            @keyup.enter="enterHandler"
            >
        </div>
        <div class="col-md-2">
          <!-- 如果輸入的顏色不存在資料庫中，則新增 -->
          <button type="button"
            v-show="!checkSameColor"
            :class="['btn', {'btn-outline-secondary': !verifyColor}, {'btn-outline-primary': verifyColor}]" 
            @click.prevent.stop="addColor"
            >新增</button>
          <!-- 如果輸入的顏色存在資料庫中，則更新 -->
          <button type="button"
            v-show="checkSameColor"
            :class="['btn',{'btn-outline-secondary': !verifyColor}, {'btn-outline-primary': verifyColor}]" 
            @click.prevent.stop="updateColor"
            >更新</button>
        </div>
      </div>
    </div>
    <div class="color-palette" v-show="colorPalette.length">
      <ul>
        <li class="color-block" 
          v-for="item in colorPalette"
          :key="item.hexColor"
          :style="{'background-color': item.hexColor}" 
          @click.prevent.stop="showColor(item.hexColor, item.name)">
            <span 
            class="delete-color"
            @click.prevent.stop="deleteColor(item.hexColor)">X</span>
        </li>
      </ul>
    </div>
    <textarea hidden id="contentToExport" v-model="contentToExport"></textarea>
  </div>
</template>
 
<script>
import hexToHsl from 'hex-to-hsl'
import request from 'superagent'
let endpoint = 'http://localhost:3000/v1.0'



export default {
  name: 'palette',
  data () {
    return {
      accessToken: null,
      pickColor: {
        hexColor: '',
        name: ''
      },
      colorPalette: [],
      colorPaletteUpdatedAt: '',
      colorPaletteOnCloud: [],
      colorPaletteOnCloudUpdatedAt: ''
    }
  },
  computed: {
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
      let findColor = this.colorPalette.some(item => item.hexColor.toUpperCase() === this.pickColor.hexColor.toUpperCase());
      return findColor;
    },
    localUnequalToSever () {
      let local = new Date(this.colorPaletteUpdatedAt).getTime()
      let server = new Date(this.colorPaletteOnCloudUpdatedAt).getTime()
      return (local > server) ? true : false
    }
  },
  methods: {
    addColor() {
      if (!this.verifyColor) {
        this.$store.commit('emit/Alert', "並非有效的色碼")
      } else if (this.checkSameColor) {
        this.$store.commit('emit/Alert', "此顏色已設定過")
      } else {
        let pickColor = Object.assign({}, this.pickColor, {
          hexColor: this.pickColor.hexColor.toUpperCase(),
          hue: hexToHsl(this.pickColor.hexColor)[0]
        })
        this.colorPalette.splice(0, 0, pickColor)
      }
    },
    updateColor(){
      let colorIndex = this.colorPalette.findIndex(item => item.hexColor.toUpperCase() === this.pickColor.hexColor.toUpperCase());
      let pickColor = Object.assign({}, this.pickColor, {
        name: this.pickColor.name
      })

      if(colorIndex === -1) {
        this.$store.commit('emit/Alert', 'can not find the color in updateColor()')
        return
      }
      this.colorPalette.splice(colorIndex, 1, pickColor)
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
        let msg = successful ? '成功' : '失敗'
        this.$store.commit('emit/Flash', "複製到剪貼簿" + msg)
      } catch(err) {
        this.$store.commit('emit/Flash', "糟糕！發生了錯誤！")
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
      this.colorPalette = JSON.parse(localStorage.getItem('colorPalette')) || []
      this.colorPaletteUpdatedAt = localStorage.getItem('paletteUpdateAt') || ''
    },
    /**
     * Interact with Server
     **/
    createPaletteToServer() {
      let vm = this
      request.post(endpoint + '/palette/')
      .type('application/json')
      .set({Authorization: vm.accessToken})
      .end((err, res) => {
        if (err) {
          this.$store.commit('emit/Alert', err)
        }
        let response = JSON.parse(res.text)
      })
    },
    getPaletteFromServer(){
      let vm = this
      request.get(endpoint + '/palette/')
      .type('application/json')
      .set({Authorization: vm.accessToken})
      .end((err, res) => {
        if (err) {
          this.$store.commit('emit/Alert', err)
        }
        let response = JSON.parse(res.text)
        if (response.status === 400) {
        // Palette 尚未建立
          vm.createPaletteToServer()
        } else if (response.status === 200) {
          vm.colorPaletteOnCloud = response.colors
          vm.colorPaletteOnCloudUpdatedAt = response.updated_at
        } else {
          this.$store.commit('emit/Alert', "Error in getPaletteFromServer in Palette.vue")
        }
      })
    },
    savePaletteToServer () {
      let vm = this
      request.put(endpoint + '/palette')
      .type('application/json')
      .set({Authorization: vm.accessToken})
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
          vm.$store.commit('emit/Flash', "儲存成功（雲端）")
        } else {
          vm.$store.commit('emit/Alert', `Error occurred in savePaletteToServer in palette.vue(${response.message})`)
        }

      })
    }
  },
  watch: {
    colorPalette (value) {
      // 當 colorPalette 有改變的時候自動存到 localStorage
      localStorage.setItem('colorPalette', JSON.stringify(value))
      localStorage.setItem('paletteUpdateAt', new Date().toISOString())
      this.colorPaletteUpdatedAt = new Date().toISOString()
      // this.$store.commit('emit/Flash', "已成功更新(本地）")
    }
  },
  created () {
    this.accessToken = 'Bearer ' + localStorage.getItem('token')
    this.getPaletteFromServer()
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
}

input[type="text"]::placeholder {
  color: $disable
}

.export-or-save{
  margin-top: 30px;
  margin-bottom: 30px;
}

.color-palette {
    min-width: 480px;
    border: 1px solid #CCC;
    margin-top: 16px;
    padding: 10px;
    ul {
        margin: 0;
        padding: 0;
        list-style: none;
        font-size: 0px;
    }
    .color-block {
        cursor: pointer;
        width: 70px;
        height: 70px;
        margin: 7px;
        background-color: $red;
        display: inline-block;
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