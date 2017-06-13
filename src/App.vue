<template>
  <div id="app">
    <header-partial></header-partial>
    <img src="./assets/logo.png">
    <router-view></router-view>
    <alert></alert>
  </div>
</template>

<script>
import Alert from '@/components/_alert.vue'
import HeaderPartial from '@/components/_header.vue'

export default {
  name: 'app',
  components: { Alert,  HeaderPartial}
}
</script>

<style lang="scss" scoped>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
