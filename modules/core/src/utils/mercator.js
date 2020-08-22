import { EARTH_CIRCUMFERENCE, DEGREES_TO_RADIANS } from './constants'
const EARTH_CIRCUMFERENCE_2 = EARTH_CIRCUMFERENCE / 2
export function getCameraPositionFromViewState(viewState) {
  let dis = getCameraDistanceFromViewState(viewState)
  // 获取相机相对于场景中心的相对偏移
  let height = dis * Math.cos(viewState.pitch * DEGREES_TO_RADIANS)
  let x = dis * Math.sin(viewState.pitch * DEGREES_TO_RADIANS) * (-Math.sin(viewState.bearing))
  let y = dis * Math.sin(viewState.pitch * DEGREES_TO_RADIANS) * (-Math.cos(viewState.bearing))
  let baseX = mercatorXfromLng(viewState.longitude)
  let baseY = mercatorYfromLat(viewState.latitude)
  return [x + baseX, y + baseY, height]
}

/**
 * 根据viewState，获取相机到屏幕中心点的距离
 * @param {*} viewState 必选，
 */
export function getCameraDistanceFromViewState(viewState) {
  // 第0层的时候，世界正好充满正方形平面
  return EARTH_CIRCUMFERENCE / Math.pow(2, viewState.zoom - 1.55)
}
export function mercatorXfromLng(lng) {
  return (180 + lng) / 360 * EARTH_CIRCUMFERENCE - EARTH_CIRCUMFERENCE_2
}

export function mercatorYfromLat(lat) {
  return EARTH_CIRCUMFERENCE_2 - (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360 * EARTH_CIRCUMFERENCE
}
export function lngFromMercatorX(x) {
  return x * 360 - 180
}

export function latFromMercatorY(y) {
  const y2 = 180 - y * 360
  return 360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90
}
