import { Project } from './interfaces'
import store from './store'

import Line from './meshes/line'

import './style.css'

import {
  getXYZForViewIdxWithinLevel,
  sortProjectEntriesByYear,
  transformProjectEntries,
} from './helpers'

import {
  setIsCurrentlyTransitionViews,
  setIsHovering,
  setMousePos,
  setShowCubeHighlight,
} from './store/ui'
import View from './view'

import {
  CameraController,
  createPlane,
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
  intersectRayWithQuad,
  MegaTexture,
} from './lib/hwoa-rang-gl2/dist'

import { Tween } from './lib/hwoa-rang-anim/dist'

import RoundCube from './meshes/round-cube'

import { vec3 } from 'gl-matrix'

let prevView!: View

const debugLines: Line[] = []

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

const gl: WebGL2RenderingContext = $canvas.getContext('webgl2')!

let uboCamera: WebGLBuffer
let uboCameraBlockInfo: UBOInfo

MegaTexture.debugMode = true
MegaTexture.gl = gl
const texManager = MegaTexture.getInstance()

console.log(texManager)

const perspectiveCamera = new PerspectiveCamera(
  deg2Rad(70),
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

// const debugRaycastLine = new Line(gl, [0, 0, 4], [1, 0, -4])
// debugLines.push(debugRaycastLine)

fetch('http://localhost:3001/api')
  .then((projects) => projects.json())
  .then(transformProjectEntries)
  .then((projects: Project[]) => {
    const viewGeoPartialProps = { cubeGeometry, labelGeometry }
    const projectsByYear = sortProjectEntriesByYear(projects)

    const projectsNode = new View(gl, {
      ...viewGeoPartialProps,
      name: 'projects',
    })

    const drawProgramToGetUBOFrom = projectsNode.sampleProgram
    uboCameraBlockInfo = createUniformBlockInfo(
      gl,
      drawProgramToGetUBOFrom,
      'Camera',
      ['projectionViewMatrix'],
    )
    uboCamera = createAndBindUBOToBase(gl, uboCameraBlockInfo.blockSize, 0)!

    projectsNode.setPosition(getXYZForViewIdxWithinLevel(1, 0))
    projectsNode.reveal()
    projectsNode.visible = true
    const aboutNode = new View(gl, { ...viewGeoPartialProps, name: 'about' })

    // intersectRayWithPlane(
    //   aboutNode.projectLabelNode.position,
    //   debugRaycastLine.startVec3,
    //   debugRaycastLine.endVec3,
    // )

    aboutNode.reveal()
    aboutNode.visible = true

    projectsNode.setParent(boxesRootNode)
    aboutNode.setParent(boxesRootNode)
    for (const [key, projects] of Object.entries(projectsByYear)) {
      const yearNode = new View(gl, { ...viewGeoPartialProps, name: key })
      yearNode.setParent(projectsNode)
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i]
        const projectNode = new View(gl, {
          ...viewGeoPartialProps,
          name: project.uid,
          project,
        })
        projectNode.setParent(yearNode)
      }
    }

    const positionNodeWithinLevel = (
      node: SceneNode,
      idx: number,
      levelIdx: number,
    ) => {
      const position = getXYZForViewIdxWithinLevel(idx, levelIdx)
      node.setPosition(position).updateWorldMatrix()
      const iterableChildNodes = node.children.filter(
        ({ name }) => name !== 'mesh-wrapper',
      )
      levelIdx++
      for (let i = 0; i < iterableChildNodes.length; i++) {
        const child = iterableChildNodes[i]
        positionNodeWithinLevel(child, i, levelIdx)
      }
    }

    positionNodeWithinLevel(boxesRootNode, 0, 0)

    // projectsNode.iterateChildren((childNode, i) => {
    //   const position = getXYZForViewIdxWithinLevel(i, 1)
    //   childNode.setPosition(position)
    //   childNode.iterateChildren((projectNode, n) => {
    //     const position = getXYZForViewIdxWithinLevel(n, 2)
    //     projectNode.setPosition(position)
    //   })
    // })

    // console.log(boxesRootNode)

    // boxesRootNode.updateWorldMatrix()
  })

const cubeGeometry = createRoundedBox({
  width: 2.4,
  height: 1.2,
  depth: 1.2,
  radius: 0.2,
  div: 10,
})
const labelGeometry = createPlane({
  width: 2,
  height: 0.2,
})

const hoverCube = new RoundCube(gl, {
  geometry: cubeGeometry,
  solidColor: [0, 0, 1, 1],
})
hoverCube.setPosition([-1, 0, 0])
hoverCube.setScale([1.05, 1.05, 1.05])
hoverCube.setParent(rootNode)

document.body.addEventListener('mousemove', onMouseMove)
document.body.addEventListener('click', onMouseClick)
requestAnimationFrame(updateFrame)

function onMouseMove(e: MouseEvent) {
  store.dispatch(setMousePos([e.pageX, e.pageY]))
}

async function onMouseClick(e: MouseEvent) {
  const normX = (e.pageX / innerWidth) * 2 - 1
  const normY = 2 - (e.pageY / innerHeight) * 2 - 1
  const { rayStart, rayEnd, rayDirection } = projectMouseToWorldSpace(
    [normX, normY],
    perspectiveCamera,
  )

  if (e.metaKey) {
    debugLines.push(new Line(gl, rayStart, rayEnd))
  }

  const {
    ui: { isCurrentlyTransitionViews },
  } = store.getState()

  // console.log(isCurrentlyTransitionViews)
  if (isCurrentlyTransitionViews) {
    return
  }

  const hitView = getHoveredSceneNode(rayStart, rayDirection)

  const prevLevel = prevView?.levelIndex || 0
  const currLevel = hitView?.levelIndex

  if (hitView) {
    store.dispatch(setShowCubeHighlight(false))
  }

  let showChildRow = hitView?.open

  if (prevView) {
    store.dispatch(setIsCurrentlyTransitionViews(true))
    if (prevView.uid === hitView?.uid) {
      for (let i = 0; i < hitView.children.length; i++) {
        const view = hitView.children[i] as View
        if (view.findParentByName('mesh-wrapper')) {
          continue
        }
        if (showChildRow) {
          view.reveal()
        } else {
          view.hide()
        }
        view.updateModelMatrix()
      }

      store.dispatch(setIsCurrentlyTransitionViews(false))
    } else {
      await new Promise((resolve) => {
        new Tween({
          durationMS: 1000,
          easeName: 'sine_In',
          onUpdate: (v) => {
            const endRot = -Math.PI * 2
            const endDeformAngle = Math.PI
            boxesRootNode.traverse((child) => {
              const view = child as View
              if (view.findParentByName('mesh-wrapper')) {
                return
              }
              if (view.levelIndex > hitView?.levelIndex) {
                const sc = 1 - v
                const rot = endRot * v
                const deformAngle = endDeformAngle * v
                view.hide(sc, sc, sc, rot, 0, 0, deformAngle)
                view.updateWorldMatrix()
                view.open = false
              }
            })
          },
          onComplete: () => {
            boxesRootNode.traverse((child) => {
              const view = child as View
              if (view.name === 'mesh-wrapper') {
                return
              }
              if (view.levelIndex > hitView?.levelIndex) {
                view.visible = false
              }
            })
            store.dispatch(setIsCurrentlyTransitionViews(false))

            resolve(null)
          },
        }).start()
      })
    }
  }

  if (showChildRow && hitView && currLevel >= prevLevel) {
    for (let i = 0; i < hitView.children.length; i++) {
      const view = hitView.children[i] as View
      if (view.name === 'mesh-wrapper') {
        continue
      }
      view.visible = true
    }
    new Tween({
      durationMS: 1000,
      easeName: 'cubic_Out',
      onUpdate: (v) => {
        const startRot = Math.PI * 2
        const startDeformAngle = Math.PI
        for (let i = 0; i < hitView.children.length; i++) {
          const view = hitView.children[i] as View
          if (view.name === 'mesh-wrapper') {
            continue
          }
          const rot = startRot * (1 - v)
          const deformAngle = startDeformAngle * (1 - v)
          view.reveal(v, v, v, rot, 0, 0, deformAngle)
          view.updateWorldMatrix()
        }
      },
      onComplete: () => {
        store.dispatch(setShowCubeHighlight(true))
        store.dispatch(setIsCurrentlyTransitionViews(false))
      },
    }).start()
  }

  if (hitView) {
    hitView.open = !showChildRow
    prevView = hitView
  }
}

function updateFrame(ts: DOMHighResTimeStamp) {
  requestAnimationFrame(updateFrame)

  // console.log(perspectiveCamera.position)

  perspectiveCamera.updateViewMatrix().updateProjectionViewMatrix()

  const {
    ui: { mousePos },
  } = store.getState()
  const normX = (mousePos[0] / innerWidth) * 2 - 1
  const normY = 2 - (mousePos[1] / innerHeight) * 2 - 1
  const { rayStart, rayEnd, rayDirection } = projectMouseToWorldSpace(
    [normX, normY],
    perspectiveCamera,
  )

  const hitView = getHoveredSceneNode(rayStart, rayDirection)
  store.dispatch(setIsHovering(!!hitView))

  const {
    ui: { showCubeHighlight },
  } = store.getState()

  if (hitView && showCubeHighlight) {
    hoverCube.setPosition(hitView.position)
  } else {
    hoverCube.setPosition([100, 100, 100])
  }

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
  }

  gl.bindBuffer(gl.UNIFORM_BUFFER, null)

  // console.log(uboVariableInfo)

  // gl.depthMask(true)
  // gl.disable(gl.BLEND)
  // gl.cullFace(gl.FRONT)

  // if (boxDebugLabels) {
  //   boxDebugLabels.render(perspectiveCamera)
  // }

  if (uboCamera) {
    boxesRootNode.render(ts)

    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.FRONT)
    hoverCube.updateWorldMatrix()
    hoverCube.render(ts)

    gl.disable(gl.CULL_FACE)
  }

  // gl.enable(gl.BLEND)
  // gl.blendFunc(gl.SRC_COLOR, gl.DST_ALPHA)
  // gl.depthMask(false)
  // gl.cullFace(gl.FRONT_AND_BACK)

  debugLines.forEach((rayLine) => rayLine.render())

  // const VPMPos = gl.getUniformLocation(triangleProgram, 'viewProjectionMatrix')

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

function getHoveredSceneNode(rayStart: vec3, rayDirection: vec3): View {
  let prevRayTimeSample = Infinity // better name?
  let hitView!: View

  boxesRootNode.traverse((child) => {
    if (!(child instanceof View)) {
      return
    }
    if (!child.visible) {
      return
    }

    const aabbIntersectionTime = intersectRayWithAABB(
      rayStart,
      rayDirection,
      child.AABB,
    )

    // console.log(child.labelQuadVertPositions, quadIntersection)

    if (
      aabbIntersectionTime !== null &&
      aabbIntersectionTime < prevRayTimeSample
    ) {
      prevRayTimeSample = aabbIntersectionTime
      hitView = child
    }

    const quadIntersection = intersectRayWithQuad(
      rayStart,
      rayDirection,
      child.labelQuadVertPositions,
    )

    if (quadIntersection) {
      const [rayTime, intersectionPoint] = quadIntersection
      if (rayTime < prevRayTimeSample) {
        prevRayTimeSample = rayTime
        hitView = child
      }
    }
  })

  return hitView
}
