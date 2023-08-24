<template>
  <nav>
    <router-link to="/">Origin</router-link> |
    <router-link to="/custom">Custom</router-link> |
    <router-link to="/version2">Version2</router-link> |
    <router-link to="/lightbox">LightBox</router-link>
  </nav>
  <router-view />
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  .btn {
    font-size: 12px;
  }
  .fc {
    font-size: 12px;
  }
  .fc .fc-toolbar-title {
    font-size: 16px;
  }
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
