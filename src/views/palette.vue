<template>
  <div>
    <h1>建立自己的色票檔(color palette)</h1>
    <hr>
    <div class="enter-color">
      <div class="color-to-pick">
        <input type="color" v-model="pickColor"/>
        <input type="text" placeholder="#FFFFFF" v-model="pickColor" @keyup.enter="addColor"/>
      </div>
      <button type="button"
        :class="['btn', {'btn-outline-secondary': !verifyColor}, {'btn-outline-primary': verifyColor}]" 
        @click.prevent.stop="addColor"
        >新增</button>
    </div>
    <div class="color-palette" v-show="colorPalette.length">
      <ul>
        <li class="color-block" 
          v-for="color in colorPalette" 
          v-bind:style="{'background-color': color}" 
          @click.prevent.stop="showColor">
            <span class="delete-color" @click.prevent.stop="deleteColor(color)">X</span>
          </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'palette',
  data () {
    return {
      pickColor: "",
      colorPalette: []
    }
  },
  computed: {
    verifyColor () {
      return /^#[0-9A-F]{6}$/i.test(this.pickColor)
    }
  },
  methods: {
    rgbToHex(rgbColor) {
      rgbColor = rgbColor.replace(/[^\d,]/g, "").split(",")
      function toHex(n) {
        n = parseInt(n, 10)
        if (isNaN(n)) return "00"
        n = Math.max(0, Math.min(n, 255))
        return (
          "0123456789ABCDEF".charAt((n - n % 16) / 16) +
          "0123456789ABCDEF".charAt(n % 16)
        )
      }
      return (
        "#" +
        toHex(rgbColor[0]) +
        toHex(rgbColor[1]) +
        toHex(rgbColor[2])
      )
    },
    addColor() {
      if (!this.verifyColor) {
        this.$store.commit('emit/Alert', "並非有效的色碼")
      } else if (this.checkSameColor(this.pickColor)) {
        this.$store.commit('emit/Alert', "此顏色已設定過")
      } else {
        this.colorPalette.splice(0, 0, this.pickColor.toUpperCase())
      }
    },
    showColor(e) {
      let rgbColor = window.getComputedStyle(e.target).getPropertyValue("background-color");
      this.pickColor = this.rgbToHex(rgbColor);
    },
    checkSameColor(hexColor) {
      let findColor = this.colorPalette.some(item => item === hexColor);
      return findColor;
    },
    deleteColor(color){
      let deleteColorIndex = this.colorPalette.findIndex(item => item === color)
      this.colorPalette.splice(deleteColorIndex, 1)
    }
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