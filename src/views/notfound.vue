<template>
  <div>
    <c-title :text="title" :hide="true"></c-title>
    <p>{{ message }}</p>
  </div>
</template>

<script>
  // import {mapState} from 'vuex'
  import cTitle from '@/components/_title.vue'

  export default {
    data () {
      return {
        title: '404 Not Found!',
        message: '404 Not Found!'
      }
    },
    mounted: function () {
      this.$store.commit('emit/Alert', "404 Not Found！")
    },
    components: {cTitle}
  }
</script>