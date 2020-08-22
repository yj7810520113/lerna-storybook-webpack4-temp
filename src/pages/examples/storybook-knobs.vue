<!--  -->
<template>
  <div style="color:#000000;">
    <span>{{ isDisabled }}</span>
    <span>{{ text }}</span>
  </div>
</template>

<script>
export default {

  components: {},
  props: {
    isDisabled: {
      type: Boolean,
      default: () => {
        return true
      }
    },
    text: {
      type: String,
      default: () => {
        return `1111`
      }
    }
  },
  data() {
    return {
      city: null
    }
  },
  computed: {},
  created() {
    console.log('11111111')
  },
  mounted() {
  },
  methods: {
  }
}

</script>
<style lang='scss' scoped>
div{
  color:#ffffff;
}
</style>
