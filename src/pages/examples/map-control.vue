<!--  -->
<template>
  <div
    :ref="'canvas'"
    style="height:1000px;width:1000px;"
  />
</template>

<script>
import { City, THREE } from '../../../modules/core/src'
import { VectorTile } from 'vector-tile'
export default {

  components: {},
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
    this.initCity()
    // this.getData()
  },
  methods: {
    initCity() {
      this.city = new City(this.$refs['canvas'])
      console.log(this.city)
      this.city.init()
      let mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000, 1000))
      this.city.scene.add(mesh)
    },
    async getData() {
      let data = await fetch('https://maponline0.bdimg.com/pvd/?qt=vtile&param=5J9FK5%3C%3ECJ82E9DA%3BK8BM5%3A%3BEL9FJED%3BEE%40CNHJK%3DE9GJ8J%3BEF%3EGN9%3AL%3D%3F%3ENPE4%3BEE%3E%3FBHJK%3DD9FK4%3EOCO82N5B%3BEG%3ECL5L%3ECB8%3AJ52%3EKC82E8FNMA%3FJPE23')
      console.log(data)
      let dataAb = await data.arrayBuffer()
      console.log(new Uint8Array(dataAb))
      let r = new VectorTile(new Uint8Array(dataAb))
      console.log(dataAb, r)
    }
  }
}

</script>
<style lang='scss' scoped>
div{
  color:#ffffff;
}
</style>
