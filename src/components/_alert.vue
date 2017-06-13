<template>
  <div>
    <transition name="flash">
      <div class="flash col-3 alert alert-success text-center" role="alert" 
        v-show="flash.title">
        {{ flash.title }}
      </div>
    </transition>
    <div class="modal-container" 
      v-show="alert.active" 
      @wheel.stop.prevent="">
      <div class="alert-container">
        <div class="alert-title"> {{ alert.title }} </div>
        <div class="alert-content"> {{ alert.content }}</div>
        <button class="confirm-button" @click="confirm">OK</button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "alert",
    computed: {
      alert () {
        return {
          active: this.$store.state.alertModule.alert.active,
          title: this.$store.state.alertModule.alert.title,
          content: this.$store.state.alertModule.alert.content
        }
      },
      flash () {
        if (this.$store.state.alertModule.flash.active) {
          setTimeout(this.disappearFlash, 1000)
          console.log('setTimeout')
        }
        return {
          active: this.$store.state.alertModule.flash.active,
          title: this.$store.state.alertModule.flash.title,
        }
      }
    },
    methods: {
      confirm () {
         this.$store.commit('reset/Alert')
      },
      disappearFlash () {
        console.log('disappearFlash')
        this.$store.commit('reset/Flash')
      }
    }
  }
</script>


<style lang="scss" scoped>

$font: 'Helvetica Neue', Helvetica, Arial, sans-serif;

/**
 * flash is used to show temporary message
**/
.flash{
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  position: fixed;
  top: 10px;
  right: 50px;
  z-index: 5;
  min-height: 60px;
  line-height: 60px;
}

// 進場後的畫面
.flash-enter-active, .flash-leave, .flash-enter-to{
  transition: all 0.3s; 
  opacity: 1;
}

// 退場後的畫面
.flash-enter, .flash-leave-active,  .flash-leave-to{   
  opacity: 0;    
  transition: all 1s;
}



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