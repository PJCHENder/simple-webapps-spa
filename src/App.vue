<template>
  <div id="app">
    <img src="./assets/logo.png">
    <router-view></router-view>
    <alert></alert>
  </div>
</template>

<script>
import Alert from '@/components/alert.vue'
export default {
  name: 'app',
  components: { Alert }
}
</script>

<style lang="scss" scoped>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
