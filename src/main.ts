import { Project } from './types'
import BoxStructure from './box-structure'
import store from './store'

store.getState()

import TextureManager from './texture-manager'
import RaycastLine from './meshes/raycast-line'

import './style.css'

import {
  getXYZForViewIdxWithinLevel,
  sortProjectEntriesByType,
  sortProjectEntriesByYear,
  transformProjectEntries,
} from './helpers/helpers'

import { BoxLabels } from './debug/box-labels'
import { setIsHovering, setMousePos } from './store/ui'
import { setProjects } from './store/projects'
import View from './view'
import ProjectThumb from './meshes/project-thumb'
import {
  CameraController,
  createPlane,
  createProgram,
  createRoundedBox,
  OrthographicCamera,
  PerspectiveCamera,
  SceneNode,
  deg2Rad,
  intersectRayWithAABB,
  projectMouseToWorldSpace,
} from './lib/hwoa-rang-gl2/dist'

let prevView!: View

const raycastLines: RaycastLine[] = []
const rootSceneNode = new SceneNode()

const $app = document.getElementById('app')!

const $canvas: HTMLCanvasElement = document.createElement('canvas')
$canvas.width = innerWidth * devicePixelRatio
$canvas.height = innerHeight * devicePixelRatio
$canvas.style.setProperty('width', `${innerWidth}px`)
$canvas.style.setProperty('height', `${innerHeight}px`)
$app.appendChild($canvas)

const gl: WebGL2RenderingContext = $canvas.getContext('webgl2')!

const uboBuffer = gl.createBuffer()
const uboVariableInfo = {}

TextureManager.debugMode = true
TextureManager.textureSize = [gl.MAX_TEXTURE_SIZE, gl.MAX_TEXTURE_SIZE]
TextureManager.gl = gl
const texManager = TextureManager.instance

const perspectiveCamera = new PerspectiveCamera(
  deg2Rad(45),
  $canvas.width / $canvas.height,
  0.1,
  20,
)
perspectiveCamera.position = [0, 2, 8]
perspectiveCamera.lookAt = [0, 0, 0]

new CameraController(perspectiveCamera)

const orthographicCamera = new OrthographicCamera(
  -innerWidth / 2,
  innerWidth / 2,
  innerHeight / 2,
  -innerHeight / 2,
  0.1,
  20,
)
orthographicCamera.position = [0, 0, 1]
orthographicCamera.lookAt = [0, 0, 0]

orthographicCamera.updateViewMatrix().updateProjectionViewMatrix()

const { verticesNormalUv, indices } = createPlane({
  width: innerWidth,
  height: innerHeight,
})
const planeProgram = createProgram(
  gl,
  `#version 300 es
  uniform mat4 projectionViewMatrix;
  
  in vec4 aPosition;
  in vec2 aUv;

  out vec2 vUv;

  void main () {
    gl_Position = projectionViewMatrix * aPosition;

    vUv = aUv;
  }
`,
  `#version 300 es
  precision highp float;

  in vec2 vUv;

  out vec4 finalColor;

  void main () {
    finalColor = vec4(vUv, 0.0, 1.0);
  }
`,
)

const aPositionLoc = gl.getAttribLocation(planeProgram, 'aPosition')
const aUvLoc = gl.getAttribLocation(planeProgram, 'aUv')
const projectionViewMatrixLoc = gl.getUniformLocation(
  planeProgram,
  'projectionViewMatrix',
)

const planeInterleavedBuffer = gl.createBuffer()
const indexBuffer = gl.createBuffer()

const vao = gl.createVertexArray()
gl.bindVertexArray(vao)

gl.bindBuffer(gl.ARRAY_BUFFER, planeInterleavedBuffer)
gl.bufferData(gl.ARRAY_BUFFER, verticesNormalUv, gl.STATIC_DRAW)

gl.enableVertexAttribArray(aPositionLoc)
gl.vertexAttribPointer(
  aPositionLoc,
  3,
  gl.FLOAT,
  false,
  5 * Float32Array.BYTES_PER_ELEMENT,
  0,
)

gl.enableVertexAttribArray(aUvLoc)
gl.vertexAttribPointer(
  aUvLoc,
  2,
  gl.FLOAT,
  false,
  5 * Float32Array.BYTES_PER_ELEMENT,
  3 * Float32Array.BYTES_PER_ELEMENT,
)

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

gl.bindVertexArray(null)

let boxStructure: BoxStructure
let boxDebugLabels: BoxLabels

fetch('http://localhost:3001/api')
  .then((projects) => projects.json())
  .then(transformProjectEntries)
  .then((projects: Project[]) => {
    store.dispatch(setProjects(projects))

    const projectsByYear = sortProjectEntriesByYear(projects)
    // const projectsByType = sortProjectEntriesByType(projects)
    // const rootView = createViews(gl, projectsByYear)
    // rootView.setParent(rootSceneNode)

    const projectsNode = new View(gl, { geometry, uid: 'projects' })

    const drawProgramToGetUBOFrom = projectsNode.children[0].program
    const blockIndex = gl.getUniformBlockIndex(
      drawProgramToGetUBOFrom,
      'Camera',
    )
    const blockSize = gl.getActiveUniformBlockParameter(
      drawProgramToGetUBOFrom,
      blockIndex,
      gl.UNIFORM_BLOCK_DATA_SIZE,
    )

    gl.bindBuffer(gl.UNIFORM_BUFFER, uboBuffer)
    gl.bufferData(gl.UNIFORM_BUFFER, blockSize, gl.DYNAMIC_DRAW)
    gl.bindBuffer(gl.UNIFORM_BUFFER, null)
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, uboBuffer)

    const uboVariableNames = ['projectionViewMatrix']

    const uboVariableIndices = gl.getUniformIndices(
      drawProgramToGetUBOFrom,
      uboVariableNames,
    )!

    const uboVariableOffsets = gl.getActiveUniforms(
      drawProgramToGetUBOFrom,
      uboVariableIndices,
      gl.UNIFORM_OFFSET,
    )

    for (let i = 0; i < uboVariableNames.length; i++) {
      uboVariableInfo[uboVariableNames[i]] = {
        index: uboVariableIndices[i],
        offset: uboVariableOffsets[i],
      }
    }

    projectsNode.reveal()
    const aboutNode = new View(gl, { geometry, uid: 'about' })
    aboutNode.reveal()
    projectsNode.setParent(rootSceneNode)
    aboutNode.setParent(rootSceneNode)
    for (const [key, projects] of Object.entries(projectsByYear)) {
      const yearNode = new View(gl, { geometry, uid: key })
      yearNode.setParent(projectsNode)
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i]
        const projectNode = new View(gl, { geometry, uid: project.uid })
        projectNode.setParent(yearNode)
      }
    }

    console.log(rootSceneNode)

    rootSceneNode.traverse((node, depthLevel) => {
      for (let i = 0; i < node.children.length; i++) {
        const childNode = node.children[i]
        if (childNode instanceof ProjectThumb) {
          continue
        }
        const position = getXYZForViewIdxWithinLevel(i, depthLevel)
        childNode.setPosition(position)
      }
    })

    rootSceneNode.updateWorldMatrix()
  })

const geometry = createRoundedBox({ radius: 0.1 })

let oldActiveViewUID = ''
let showChildrenRow = true
store.subscribe(async () => {
  const state = store.getState()
  const {
    views: { activeViewUID },
  } = state

  return
})
document.body.addEventListener('mousemove', onMouseMove)
document.body.addEventListener('click', onMouseClick)
requestAnimationFrame(updateFrame)

function onMouseMove(e: MouseEvent) {
  store.dispatch(setMousePos([e.pageX, e.pageY]))
}

function onMouseClick(e: MouseEvent) {
  const normX = (e.pageX / innerWidth) * 2 - 1
  const normY = 2 - (e.pageY / innerHeight) * 2 - 1
  const { rayStart, rayEnd, rayDirection } = projectMouseToWorldSpace(
    [normX, normY],
    perspectiveCamera,
  )

  let prevRayTimeSample = Infinity // better name?
  let hitView!: View
  rootSceneNode.traverse((child) => {
    if (!(child instanceof View || child instanceof ProjectThumb)) {
      return
    }
    if (!child.visible) {
      return
    }

    const [t, hit] = intersectRayWithAABB(child.AABB, rayStart, rayDirection)
    // console.log(hit)
    if (hit) {
      if (t < prevRayTimeSample) {
        prevRayTimeSample = t
        hitView = child
      }
    }
  })

  console.log(hitView)

  const prevLevel = prevView?.levelIndex || 0
  const currLevel = hitView?.levelIndex

  let showChildRow = true

  if (prevView) {
    if (prevView.uid === hitView?.uid) {
      showChildRow = false
      const childrenVisible = hitView.children[0].visible
      console.log('clicked on same item ' + childrenVisible)
      for (let i = 0; i < hitView.children.length; i++) {
        const child = hitView.children[i]
        if (child instanceof ProjectThumb) {
          continue
        }
        if (childrenVisible) {
          child.hide()
        } else {
          child.reveal()
        }
        child.updateModelMatrix()
      }
    } else {
      rootSceneNode.traverse((view) => {
        if (!(child instanceof View) || child instanceof ProjectThumb) {
          return
        }
        if (view.levelIndex > hitView?.levelIndex) {
          view.hide()
          view.updateModelMatrix()
        }
      })
    }
  }

  if (showChildRow && hitView && currLevel >= prevLevel) {
    for (let i = 0; i < hitView.children.length; i++) {
      const child = hitView.children[i]
      if (child instanceof ProjectThumb) {
        continue
      }
      // console.log(child.uid)
      child instanceof View && child.reveal()
      child.updateWorldMatrix()
    }
  }
  prevView = hitView

  // console.log({ hitIdx })

  if (e.metaKey) {
    raycastLines.push(new RaycastLine(gl, rayStart, rayEnd))
  }
}

function updateFrame(ts: DOMHighResTimeStamp) {
  ts /= 1000
  requestAnimationFrame(updateFrame)

  // console.log(perspectiveCamera.position)

  perspectiveCamera.updateViewMatrix().updateProjectionViewMatrix()

  gl.enable(gl.DEPTH_TEST)

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.1, 0.1, 0.1, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  if (uboVariableInfo.projectionViewMatrix) {
    gl.bindBuffer(gl.UNIFORM_BUFFER, uboBuffer)
    gl.bufferSubData(
      gl.UNIFORM_BUFFER,
      uboVariableInfo.projectionViewMatrix.offset,
      perspectiveCamera.projectionViewMatrix,
      0,
    )
    gl.bindBuffer(gl.UNIFORM_BUFFER, null)
  }

  // console.log(uboVariableInfo)

  // gl.depthMask(true)
  // gl.disable(gl.BLEND)
  // gl.cullFace(gl.FRONT)

  // if (boxDebugLabels) {
  //   boxDebugLabels.render(perspectiveCamera)
  // }

  rootSceneNode.render()

  // gl.enable(gl.BLEND)
  // gl.blendFunc(gl.SRC_COLOR, gl.DST_ALPHA)
  // gl.depthMask(false)
  // gl.cullFace(gl.FRONT_AND_BACK)

  if (boxStructure) {
    boxStructure.render(perspectiveCamera, ts)
  }

  raycastLines.forEach((rayLine) => rayLine.render(perspectiveCamera))

  const {
    ui: { mousePos },
  } = store.getState()
  const normX = (mousePos[0] / innerWidth) * 2 - 1
  const normY = 2 - (mousePos[1] / innerHeight) * 2 - 1
  const { rayStart, rayDirection } = projectMouseToWorldSpace(
    [normX, normY],
    perspectiveCamera,
  )
  let rayIsHit!: boolean
  rootSceneNode.traverse((child) => {
    if (!(child instanceof View)) {
      return
    }
    if (!child.visible) {
      return
    }

    const [t, hit] = intersectRayWithAABB(child.AABB, rayStart, rayDirection)
    if (hit) {
      rayIsHit = hit
      return
    }
  })
  store.dispatch(setIsHovering(rayIsHit))

  // gl.useProgram(planeProgram)
  // gl.bindVertexArray(vao)
  // gl.uniformMatrix4fv(
  //   projectionViewMatrixLoc,
  //   false,
  //   orthographicCamera.projectionViewMatrix,
  // )
  // gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
  // gl.bindVertexArray(null)
}
