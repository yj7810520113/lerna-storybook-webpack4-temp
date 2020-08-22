<template>
  <div>
    <el-container>
      <el-main>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="grid-content bg-purple">
              <el-link
                href="#/examples/map-control"
              >
                map-control
              </el-link>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="grid-content bg-purple">
              <el-link
                href="#/test/vue-jsm"
              >
                dom-jsm-test
              </el-link>
              <el-link
                href="#/test/rules-engine"
              >
                rules-engine-test
              </el-link>
            </div>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
// import Home from 'components/Home/home'

export default {
  components: {
    // Home
  }
}
</script>

<style lang="stylus" scoped>

  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
  }

  body > .el-container {
    margin-bottom: 40px;
  }
  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }
  .el-link{
    display:block;
    line-height :40px;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
</style>
