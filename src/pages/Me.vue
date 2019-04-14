<template>
  <div>
    <h1>{{ email }}</h1>
  </div>
</template>

<script>
export default {
  name: 'Me',
  data() {
    return {
      email: this.$route.data.me.email
    }
  }
}
</script>
