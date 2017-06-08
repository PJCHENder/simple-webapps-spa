<template>
  <div>
    <h1>建立自己的色票檔(color palette)</h1>
    <hr>
    <div class="enter-color">
      <div class="color-to-pick">
        <input type="color" v-model="pickColor.hexColor"/>
        <input type="text" placeholder="#FFFFFF" v-model="pickColor.hexColor" @keyup.enter="addColor"/>
        <input type="text" placeholder="comment" v-model="pickColor.comment">
      </div>
      <button type="button"
        :class="['btn', {'btn-outline-secondary': !verifyColor}, {'btn-outline-primary': verifyColor}]" 
        @click.prevent.stop="addColor"
        >新增</button>
    </div>
    <div class="color-palette" v-show="colorPalette.length">
      <ul>
        <li class="color-block" 
          v-for="item in colorPalette" 
          :style="{'background-color': item.hexColor}" 
          @click.prevent.stop="showColor(item.hexColor, item.comment)">
            <span 
            class="delete-color"
            @click.prevent.stop="deleteColor(item.hexColor)">X</span>
        </li>
      </ul>
    </div>
  </div>
</template>
 
<script>

import hexToHsl from 'hex-to-hsl'

let colorPalette = [
    {
        comment: 'green',
        hexColor: '#41CEC0' 
    },
    {
        comment: 'vue',
        hexColor: '#41b883' 
    },
     {
        comment: 'node',
        hexColor: '#43853d' 
    },
    {
        comment: 'blue',
        hexColor: '#35495e' 
    },
    {
        comment: 'dark-blue',
        hexColor: '#3d4f5d' 
    },
    {
        comment: 'purple',
        hexColor: '#A53860' 
    },
    {
        comment: 'heroku',
        hexColor: '#79589F' 
    },
    {
        comment: 'red',
        hexColor: '#C63647' 
    },
    {
        comment: 'npm',
        hexColor: '#C12127' 
    },{
        comment: 'yellow',
        hexColor: '#FFDF2C' 
    },
    {
        comment: 'wesbos',
        hexColor: '#ffc600' 
    },
    {
        comment: 'orange',
        hexColor: '#E96900' 
    },
    {
        comment: 'black',
        hexColor: '#282c34'
    }
]


export default {
  name: 'palette',
  data () {
    return {
      pickColor: {
        hexColor: '',
        comment: ''
      },
      colorPalette: null
    }
  },
  computed: {
    verifyColor () {
      return /^#[0-9A-F]{6}$/i.test(this.pickColor.hexColor)
    }
  },
  methods: {
    addColor() {
      if (!this.verifyColor) {
        this.$store.commit('emit/Alert', "並非有效的色碼")
      } else if (this.checkSameColor(this.pickColor.hexColor)) {
        this.$store.commit('emit/Alert', "此顏色已設定過")
      } else {
        this.colorPalette.splice(0, 0, {
          hexColor: this.pickColor.hexColor.toUpperCase(),
          name: null,
          comment: null,
          hue: hexToHsl(this.pickColor.hexColor)[0]
        })
      }
    },
    showColor(hexColor, comment) {
      this.pickColor.hexColor = hexColor
      this.pickColor.comment = comment
    },
    checkSameColor(hexColor) {
      let findColor = this.colorPalette.some(item => item.hexColor === hexColor);
      return findColor;
    },
    deleteColor(hexColor){
      let deleteColorIndex = this.colorPalette.findIndex(item => item.hexColor.toUpperCase() === hexColor.toUpperCase())
      this.colorPalette.splice(deleteColorIndex, 1)
    }
  },
  created () {
    this.colorPalette = colorPalette.map(item => {
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
.enter-color {
    display: inline-block;
    .color-to-pick {
        border: 1px solid #CCC;
        padding: 15px 30px;
        display: inline-block;
    }
    button {
        cursor: pointer;
    }
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