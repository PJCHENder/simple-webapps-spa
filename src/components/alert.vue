<template>
  <div class="modal-container" v-show="active" @wheel.stop.prevent="">
    <div class="alert-container">
      <div class="alert-title">{{title}}</div>
      <div class="alert-content"> {{content}}</div>
      <button class="confirm-button" @click="confirm">OK</button>
    </div>
  </div>
</template>

<script>
  export default {
    name: "alert",
    computed: {
      active () {
        return this.$store.state.alertModule.alert.active
      },
      title () {
        return this.$store.state.alertModule.alert.title
      },
      content () {
        return this.$store.state.alertModule.alert.content
      }
    },
    methods: {
      showBasicAlert(){
        this.alert.title = "Hello SweetAlert2"
        this.alert.content = " Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt maiores aliquid fugit dolor, sapiente laboriosam! Culpa porro, hic voluptatem eum ipsa ratione rem libero. Cupiditate eos aut ad sint, repellat."
        this.alert.active = true
      },
      confirm(){
         this.$store.commit('reset/Alert')
      }
    }
  }
</script>


<style lang="scss" scoped>

$font: 'Helvetica Neue', Helvetica, Arial, sans-serif;
/**
 * style here is forked from SweetAlert2
**/
.modal-container {
    background-color: rgba(0, 0, 0, .4);
    overflow-y: auto;
    transition: background .1s;
    padding: 10px;
    z-index: 1060;
    /**
     * Center elements inside .modal-container
    **/
    display: flex;
    align-items: center;
    justify-content: center;

    /**
     * To fill the whole screen 
    **/
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
}

.alert-container {
    width: 500px;
    padding: 20px;
    background: rgb(255, 255, 255);
    display: block;
    min-height: 148px;
    border-radius: 5px;
    font-family: $font;
    box-sizing: border-box;
    text-align: center;
    margin: auto;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    max-width: 100%;
    animation: showSweetAlert .3s;
    .alert-title {
        color: #595959;
        font-size: 30px;
        text-align: center;
        font-weight: 600;
        text-transform: none;
        position: relative;
        margin: 0 0 .4em;
        padding: 0;
        display: block;
        word-wrap: break-word;
    }

    .alert-content {
        font-size: 18px;
        text-align: left;
        font-weight: 300;
        position: relative;
        float: none;
        margin: 0;
        padding: 0;
        line-height: normal;
        color: #545454;
        word-wrap: break-word;
    }
    .confirm-button {
        background-color: rgb(48, 133, 214);
        border-left-color: rgb(48, 133, 214);
        border-right-color: rgb(48, 133, 214);
        top: 5px;
        right: 8px;
        cursor: pointer;
        color: #ccc;
        transition: color .1s ease;
        border: 0;
        border-radius: 3px;
        box-shadow: none;
        color: #fff;
        cursor: pointer;
        font-size: 17px;
        font-weight: 500;
        margin: 15px 5px 0;
        padding: 10px 32px;
        &:hover {
            background-color: #297dce;
        }
    }
}

@keyframes showSweetAlert {
    0% {
        transform: scale(.7);
    }
    45% {
        transform: scale(1.05);
    }
    80% {
        transform: scale(.95);
    }
    100% {
        transform: scale(1);
    }
}
</style>