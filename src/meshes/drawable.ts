import {
  createProgram,
  SceneNode,
  ShaderDefineValue,
} from '../lib/hwoa-rang-gl2/dist'

import VERTEX_SHADER_SRC from '../shaders/uberShader.vert'
import FRAGMENT_SHADER_SRC from '../shaders/uberShader.frag'

export default class Drawable extends SceneNode {
  protected gl: WebGL2RenderingContext
  protected vao: WebGLVertexArrayObject
  protected drawProgram: WebGLProgram
  protected modelMatrixLocation: WebGLUniformLocation
  protected cameraUBOIndex: GLuint
  protected shouldUploadModelMatrix = false

  protected vertexCount!: number

  get program(): WebGLProgram {
    return this.drawProgram
  }

  constructor(
    gl: WebGL2RenderingContext,
    shaderDefines: { [key: string]: ShaderDefineValue },
  ) {
    super()
    this.gl = gl

    this.vao = gl.createVertexArray()!
    this.drawProgram = createProgram(
      gl,
      VERTEX_SHADER_SRC,
      FRAGMENT_SHADER_SRC,
      shaderDefines,
    )

    this.modelMatrixLocation = gl.getUniformLocation(
      this.drawProgram,
      'modelMatrix',
    )!
    this.cameraUBOIndex = gl.getUniformBlockIndex(this.drawProgram, 'Camera')
  }

  updateWorldMatrix(parentWorldMatrix?: mat4 | null): this {
    super.updateWorldMatrix(parentWorldMatrix)
    this.shouldUploadModelMatrix = true
    return this
  }
}
