<template>
  <div>
    <h1>Admin</h1>
  </div>
</template>

<script>
export default {
  name: 'Admin',
  data() {
    return {
      avatar: this.$route.data.me.avatar
    }
  }
}
</script>
