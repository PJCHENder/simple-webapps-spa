
// 生成 mutations 方法
function generate (name) {
  return function (state, value) {
    state[name] = value || state[name]
  }
}

const credentialModule = {
  state: {
    authorized: false,
    accessToken: null
  },
  mutations: {
    'refreshAuthorized/Credential': function (state, value) {
      state.authorized = value
    },
    'refreshAccessToken/Credential': function (state, value) {
      state.accessToken = `Bearer ${value}`
    }
  }
}

const alertModule = {
  state: {
    alert: {
      title: null,
      content: null,
      active: false
    },
    flash: {
      title: null,
      active: false
    }
  },
  mutations: {
    'emit/Alert': function (state, value) {
      state.alert.active = true
      state.alert.title = value
    },
    'reset/Alert': function (state, value) {
      state.alert.active = false
      state.alert.content = null
      state.alert.title = null
    },
    'emit/Flash': function (state, value) {
      state.flash.active = true
      state.flash.title = value
    },
    'reset/Flash': function (state, value) {
      state.flash.active = false
      state.flash.title = null
    }
  }
}

const options = {
  strict: true,
  // 共享數據
  state: {

  },

  // 操作
  actions: {},

  // 數據變更
  mutations: {

  },

  modules: {
    alertModule,
    credentialModule
  }

}

// 為每个 state 字段生成对应的 mutations 方法
Object.keys(options.state).forEach((key) => {
  options.mutations[key] = generate(key)
})

export default options
