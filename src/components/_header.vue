<template>
  <nav class="navbar navbar-toggleable-md navbar-light bg-faded">
    <button class="navbar-toggler navbar-toggler-right" type="button" aria-label="Toggle navigation"
      @click="showNav"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <a class="navbar-brand" href="#">Simple WebApps</a>

    <div class="navbar-collapse"
      v-show="navActive">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item">
          <a class="nav-link" href="https://pjchender.blogspot.com" target="_blank">Blog</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="https://www.facebook.com/pjchender/" target="_blank">Facebook</a>
        </li>
      </ul>
      <button 
      class="fb-color btn btn-sm btn-outline-success col-md-1 login"
      v-if="!authorized" 
      @click="login">Login</button>
      <button
      class="fb-color btn btn-sm btn-outline-success col-md-1 logout"
      v-else
      @click="logout" >Logout</button>
    </div>
  </nav>
</template>

<script>
import request from 'superagent'

let endpoint = (process.env.NODE_ENV === 'production') ? 'https://simple-webapps.herokuapp.com/v1.0' : 'http://localhost:3000/v1.0'

export default {
  data () {
    return {
      profile: {},
      authorized: false,
      navActive: false,
      words: {
        controller: {
          loginSuccess: 'Login Successful',
          logoutSuccess: 'Logout Successful',
          unauthorized: 'This app has not been authorized.',
          notLogin: 'Not login yet.'
        }
      }
    }
  },
  methods:{
    showNav () {
      this.navActive = !this.navActive
    },
    getTokenFromServer () {
      let vm = this
      request.post(endpoint + '/users/login')
      .send({
        input_token: vm.profile.authResponse.accessToken,
        facebookId: vm.profile.id,
        email: vm.profile.email,
        name: vm.profile.name
      })
      .type('application/json')
      .end((err, res) => {
        if (err) {
          console.error(err)
        }
        let response = JSON.parse(res.text)
        /**
         * If get token successfully, save in localStorage
         **/
        if (response.token) {
          localStorage.setItem('token', `Bearer ${response.token}`)
          vm.$store.commit('refreshAccessToken/Credential', response.token)
        }
      })
    },
    changeAuthorizedStatus (status) {
      this.authorized = status
      this.$store.commit('refreshAuthorized/Credential', status)
    },
    /**
     * Facebook SDK for Login
    **/
    getProfile (authResponse) {
      let vm = this
      // FB.api('/me?fields=name,id,email', function (response) {
      FB.api('/me', 'get', {fields: 'name,id,email'}, function (response) {
        vm.$set(vm, 'profile', response)
        vm.profile = Object.assign({}, {authResponse}, vm.profile)
        vm.getTokenFromServer()
      })
    },
    login () {
      let vm = this
      FB.login(function (response) {
        vm.statusChangeCallback(response)
      }, {
        scope: 'email, public_profile',
        return_scopes: true,
      })
    },
    logout () {
      let vm = this
      FB.logout(function (response) {
        vm.statusChangeCallback(response)
      })
    },
    statusChangeCallback (response) {
      let vm = this
      if (response.status === 'connected') {
        vm.$store.commit('emit/Flash', this.words.controller.loginSuccess)
        vm.changeAuthorizedStatus(true)
        vm.getProfile(response.authResponse)
      } else if (response.status === 'not_authorized') {
        vm.$store.commit('emit/Flash', this.words.controller.unauthorized)
        vm.changeAuthorizedStatus(false)
      } else if (response.status === 'unknown') {
        vm.$store.commit('emit/Flash', this.words.controller.logoutSuccess)
        vm.profile = {}
        vm.changeAuthorizedStatus(false)
      } else {
        vm.$store.commit('emit/Flash', this.words.controller.notLogin)
        vm.changeAuthorizedStatus(false)
      }
    }
  },
  mounted () {
    let vm = this

    // facebook 初始化
    window.fbAsyncInit = function() {
      FB.init({
        appId: '664195880445424',
        cookie: true,
        xfbml: true,
        version: 'v2.9'
      });
      FB.AppEvents.logPageView();

      // Get FB Login Status
      FB.getLoginStatus(response => {
        vm.statusChangeCallback(response)
      })
    };
  }
}
</script>

<style lang="scss" scoped>
  $facebook: #3b5998;
  button{
    cursor: pointer;
  }
  .fb-color {
    color: $facebook;
    border-color: $facebook;
    &:hover{
      background-color: $facebook;
      color: white;
      border: 0;
    }
    &:focus {
      webkit-box-shadow: 0 0 0 2px rgba(59, 89, 152, 0.5);
      box-shadow: 0 0 0 2px rgba(59, 89, 152, 0.5);
    }
  }

</style>