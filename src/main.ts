import { Project } from './types'
import store from './store'

import TextureManager from './lib/hwoa-rang-gl2/src/extra/mega-texture'
import RaycastLine from './meshes/raycast-line'

import './style.css'

import {
  getXYZForViewIdxWithinLevel,
  sortProjectEntriesByYear,
  transformProjectEntries,
} from './helpers'

import { setIsHovering, setMousePos } from './store/ui'
import { setProjects } from './store/projects'
import View from './view'

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
  createAndBindUBOToBase,
  createUniformBlockInfo,
  UBOInfo,
} from './lib/hwoa-rang-gl2/dist'
import RoundCube from './meshes/round-cube'
import { vec3 } from 'gl-matrix'
import Tween from './lib/hwoa-rang-anim/src/tween'

let prevView!: View

const raycastLines: RaycastLine[] = []

const rootNode = new SceneNode()
const boxesRootNode = new SceneNode()
boxesRootNode.setParent(rootNode)

const $app = document.getElementById('app')!

const $canvas: HTMLCanvasElement = document.createElement('canvas')
$canvas.width = innerWidth * devicePixelRatio
$canvas.height = innerHeight * devicePixelRatio
$canvas.style.setProperty('width', `${innerWidth}px`)
$canvas.style.setProperty('height', `${innerHeight}px`)
$app.appendChild($canvas)

// setInterval(() => {
//   tween.start()
// }, 2000)

const gl: WebGL2RenderingContext = $canvas.getContext('webgl2')!

let uboCamera: WebGLBuffer
let uboCameraBlockInfo: UBOInfo

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
// const planeProgram = createProgram(
//   gl,
//   `#version 300 es
//   uniform mat4 projectionViewMatrix;

//   in vec4 aPosition;
//   in vec2 aUv;

//   out vec2 vUv;

//   void main () {
//     gl_Position = projectionViewMatrix * aPosition;

//     vUv = aUv;
//   }
// `,
//   `#version 300 es
//   precision highp float;

//   in vec2 vUv;

//   out vec4 finalColor;

//   void main () {
//     finalColor = vec4(vUv, 0.0, 1.0);
//   }
// `,
// )

// const aPositionLoc = gl.getAttribLocation(planeProgram, 'aPosition')
// const aUvLoc = gl.getAttribLocation(planeProgram, 'aUv')
// const projectionViewMatrixLoc = gl.getUniformLocation(
//   planeProgram,
//   'projectionViewMatrix',
// )

// const planeInterleavedBuffer = gl.createBuffer()
// const indexBuffer = gl.createBuffer()

// const vao = gl.createVertexArray()
// gl.bindVertexArray(vao)

// gl.bindBuffer(gl.ARRAY_BUFFER, planeInterleavedBuffer)
// gl.bufferData(gl.ARRAY_BUFFER, verticesNormalUv, gl.STATIC_DRAW)

// gl.enableVertexAttribArray(aPositionLoc)
// gl.vertexAttribPointer(
//   aPositionLoc,
//   3,
//   gl.FLOAT,
//   false,
//   5 * Float32Array.BYTES_PER_ELEMENT,
//   0,
// )

// gl.enableVertexAttribArray(aUvLoc)
// gl.vertexAttribPointer(
//   aUvLoc,
//   2,
//   gl.FLOAT,
//   false,
//   5 * Float32Array.BYTES_PER_ELEMENT,
//   3 * Float32Array.BYTES_PER_ELEMENT,
// )

// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
// gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

// gl.bindVertexArray(null)

fetch('http://localhost:3001/api')
  .then((projects) => projects.json())
  .then(transformProjectEntries)
  .then((projects: Project[]) => {
    store.dispatch(setProjects(projects))
    const projectsByYear = sortProjectEntriesByYear(projects)
    const projectsNode = new View(gl, { geometry, uid: 'projects' })

    const drawProgramToGetUBOFrom = projectsNode.sampleProgram
    uboCameraBlockInfo = createUniformBlockInfo(
      gl,
      drawProgramToGetUBOFrom,
      'Camera',
      ['projectionViewMatrix'],
    )
    uboCamera = createAndBindUBOToBase(gl, uboCameraBlockInfo.blockSize, 0)!

    projectsNode.reveal()
    const aboutNode = new View(gl, { geometry, uid: 'about' })
    aboutNode.reveal()
    projectsNode.setParent(boxesRootNode)
    aboutNode.setParent(boxesRootNode)
    for (const [key, projects] of Object.entries(projectsByYear)) {
      const yearNode = new View(gl, { geometry, uid: key })
      yearNode.setParent(projectsNode)
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i]
        const projectNode = new View(gl, { geometry, uid: project.uid })
        projectNode.setParent(yearNode)
      }
    }

    console.log(boxesRootNode)

    boxesRootNode.traverse((node, depthLevel) => {
      node.iterateChildren((childNode, i) => {
        const position = getXYZForViewIdxWithinLevel(i, depthLevel)
        childNode.setPosition(position)
      })
    })

    rootNode.updateWorldMatrix()
  })

const geometry = createRoundedBox({ radius: 0.1 })
const hoverCube = new RoundCube(gl, { geometry, solidColor: [0, 0, 1, 1] })
hoverCube.setPosition([-1, 0, 0])
hoverCube.setScale([1.05, 1.05, 1.05])
hoverCube.setParent(rootNode)

// let oldActiveViewUID = ''
// let showChildrenRow = true
// store.subscribe(async () => {
//   const state = store.getState()
//   const {
//     views: { activeViewUID },
//   } = state

//   return
// })
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
  boxesRootNode.traverse((child) => {
    if (!(child instanceof View)) {
      return
    }
    if (!child.visible) {
      return
    }

    const [t, hit] = intersectRayWithAABB(child.AABB, rayStart, rayDirection)
    if (hit) {
      if (t < prevRayTimeSample) {
        prevRayTimeSample = t
        hitView = child
      }
    }
  })

  const prevLevel = prevView?.levelIndex || 0
  const currLevel = hitView?.levelIndex

  let showChildRow = hitView?.open

  if (prevView) {
    if (prevView.uid === hitView?.uid) {
      hitView.iterateChildren((child) => {
        const view = child as View
        if (showChildRow) {
          view.reveal()
        } else {
          view.hide()
        }
        child.updateModelMatrix()
      })
    } else {
      boxesRootNode.traverse((child) => {
        const view = child as View
        if (view.levelIndex > hitView?.levelIndex) {
          view.hide()
          view.updateModelMatrix()
          view.open = false
        }
      })
    }
  }

  if (showChildRow && hitView && currLevel >= prevLevel) {
    new Tween({
      durationMS: 1000,
      easeName: 'bounce_In',
      onUpdate: (v) => {
        hitView.iterateChildren((child) => {
          const view = child as View
          view.reveal(v, v, v)
          view.updateWorldMatrix()
        })
      },
    }).start()
  }
  prevView = hitView
  if (hitView) {
    hitView.open = !showChildRow
  }

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

  if (uboCamera) {
    gl.bindBuffer(gl.UNIFORM_BUFFER, uboCamera)
    gl.bufferSubData(
      gl.UNIFORM_BUFFER,
      uboCameraBlockInfo.uniforms.projectionViewMatrix.offset,
      perspectiveCamera.projectionViewMatrix as ArrayBufferView,
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

  boxesRootNode.render()

  gl.enable(gl.CULL_FACE)
  gl.cullFace(gl.FRONT)
  hoverCube.updateWorldMatrix()
  hoverCube.render()

  gl.disable(gl.CULL_FACE)

  // gl.enable(gl.BLEND)
  // gl.blendFunc(gl.SRC_COLOR, gl.DST_ALPHA)
  // gl.depthMask(false)
  // gl.cullFace(gl.FRONT_AND_BACK)

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
  // let rayIsHit!: boolean
  // boxesRootNode.traverse((child) => {
  //   if (!(child instanceof View)) {
  //     return
  //   }
  //   if (!child.visible) {
  //     return
  //   }

  //   const [t, hit] = intersectRayWithAABB(child.AABB, rayStart, rayDirection)
  //   if (hit) {
  //     rayIsHit = hit
  //     return
  //   }
  // })

  let prevRayTimeSample = Infinity // better name?
  let hitView!: View
  boxesRootNode.traverse((child) => {
    if (!(child instanceof View)) {
      return
    }
    if (!child.visible) {
      return
    }

    const [t, hit] = intersectRayWithAABB(child.AABB, rayStart, rayDirection)
    if (hit) {
      if (t < prevRayTimeSample) {
        prevRayTimeSample = t
        hitView = child
      }
    }
  })

  if (hitView) {
    hoverCube.setPosition(hitView.position)
  } else {
    hoverCube.setPosition([100, 100, 100])
  }

  store.dispatch(setIsHovering(!!hitView))

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
