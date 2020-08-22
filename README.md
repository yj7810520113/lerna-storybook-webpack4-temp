# mc-gl
## About mc-gl
mc-gl全程MineChicken-GL，至于为什么叫MineChicken，emm... 
<br>
## Goals
* three.js绘制mapbox.gl地图基本底图
* 基础组件封装
  * pbf在线文本及离线文本解析，基于mapbox.gl
  * 基础组件封装，如：文本拉线框，打标等
  * 组件配置标准化及其自适应
* 内嵌部分动画，参考 [Deck.gl](https://deck.gl/#/documentation/developer-guide/writing-custom-layers/attribute-management)
* dom冒泡机制的事件管理
* worker队列管理
* 待添加...


## RoadMap
- [ ] Event冒泡
  - [ ] 支持自身事件和向父组件冒泡，直到stop
  - [ ] others  
- [ ]  内嵌动画
  - [ ] Transition
- [ ] 标准化配置
