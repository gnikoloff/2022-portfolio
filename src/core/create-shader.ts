/**
 * Create and compile WebGLShader
 * @param {WebGL2RenderingContext)} gl
 * @param {GLenum} shaderType
 * @param {string} shaderSource
 * @param {Record<string, any>} defines
 * @returns {WebGLShader}
 */
export const createShader = (
  gl: WebGL2RenderingContext,
  shaderType: GLenum,
  shaderSource: string,
  defines: Record<string, any> = {},
): WebGLShader => {
  let shaderDefinesString = ''
  for (const [key, value] of Object.entries(defines)) {
    // const valueFormatted = typeof value === 'boolean' ? Number(value) : value
    shaderDefinesString += `#define ${key} ${value}\n`
  }
  shaderSource = shaderSource.replace('-- DEFINES_HOOK --', shaderDefinesString)

  const shader: WebGLShader = gl.createShader(shaderType)!
  gl.shaderSource(shader, shaderSource)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader
  }
  const errorMessage = `
    Error in ${shaderType === gl.VERTEX_SHADER ? 'Vertex' : 'Fragment'} shader:
    ${gl.getShaderInfoLog(shader)}
  `
  gl.deleteShader(shader)
  throw new Error(errorMessage)
}
