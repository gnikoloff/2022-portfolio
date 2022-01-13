import { UBOVariable } from '../types'

export default class UniformBuffer {
  gl: WebGL2RenderingContext
  name: string
  bindPoint?: number
  bufferSize?: number

  items: Map<string, UBOVariable> = new Map()

  constructor(gl: WebGL2RenderingContext, name: string) {
    this.gl = gl
    this.name = name
  }

  setItem(name: string, data: Float32Array | Array | number | boolean) {}
}
