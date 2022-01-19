import { Project } from './interfaces'
import store from './store'

import Line from './meshes/line'

import './style.css'

import {
  getChildrenRowTotalHeight,
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
import View from './views/view'

import {
  CameraController,
  createPlane,
  createBox,
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
  createFramebuffer,
  TextureAtlas,
} from './lib/hwoa-rang-gl2/dist'

import { Tween } from './lib/hwoa-rang-anim/dist'

import Cube from './meshes/cube'

import { vec3 } from 'gl-matrix'
import {
  CAMERA_FAR,
  CAMERA_LEVEL_Z_OFFSET,
  CAMERA_NEAR,
  CUBE_DEFORM_ANGLE,
  CUBE_DEPTH,
  CUBE_HEIGHT,
  CUBE_ROTATION_X_AXIS,
  CUBE_WIDTH,
  LABEL_HEIGHT,
  LABEL_WIDTH,
  LAYOUT_COLUMN_MAX_WIDTH,
} from './constants'

import * as dat from 'dat.gui'
import Quad from './meshes/quad'

const OPTIONS = {
  cameraFreeMode: false,
  blurIterations: 8,
  dofInnerRange: 0.342,
  dofOuterRange: 0.391,
  dof: 0.025,
}

// dof: 0.025,
//   dofInnerRange: 0.874517,
//   dofOuterRange: 0.968887,

const gui = new dat.GUI()

gui.add(OPTIONS, 'cameraFreeMode').onChange((v) => {
  if (v) {
    orbitController.start()
  } else {
    orbitController.pause()
  }
})
gui.add(OPTIONS, 'blurIterations').min(1).max(25).step(1)
gui
  .add(OPTIONS, 'dofInnerRange')
  .min(CAMERA_NEAR)
  .max(1)
  .step(0.001)
  .onChange((v: number) => {
    // console.log([v, OPTIONS.dofOuterRange])
    dofQuad.updateUniform(
      'u_depthRange',
      new Float32Array([v, OPTIONS.dofOuterRange]),
    )
  })
gui
  .add(OPTIONS, 'dofOuterRange')
  .min(CAMERA_NEAR)
  .max(1)
  .step(0.001)
  .onChange((v: number) => {
    // console.log([OPTIONS.dofInnerRange, v])
    dofQuad.updateUniform(
      'u_depthRange',
      new Float32Array([OPTIONS.dofInnerRange, v]),
    )
  })
gui
  .add(OPTIONS, 'dof')
  .min(CAMERA_NEAR)
  .max(1)
  .step(0.001)
  .onChange((v: number) => {
    dofQuad.updateUniform('u_dof', v)
  })

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

let uboPerspectiveCamera: WebGLBuffer
let uboCameraBlockInfo: UBOInfo
let uboOrthographicCamera: WebGLBuffer

// TextureAtlas.debugMode = true
TextureAtlas.gl = gl

// console.log(texManager)

const freeOrbitCamera = new PerspectiveCamera(
  deg2Rad(70),
  $canvas.width / $canvas.height,
  CAMERA_NEAR,
  CAMERA_FAR,
)
freeOrbitCamera.position = [0, 2, 3]
freeOrbitCamera.lookAt = [0, 0, 0]

const perspectiveCamera = new PerspectiveCamera(
  deg2Rad(70),
  $canvas.width / $canvas.height,
  CAMERA_NEAR,
  CAMERA_FAR,
)
perspectiveCamera.position = [0, 0, 8]
perspectiveCamera.lookAt = [0, 0, 0]

const orbitController = new CameraController(freeOrbitCamera)
orbitController.pause()

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

let singleView

const cubeGeometry = createBox({
  width: CUBE_WIDTH,
  height: CUBE_HEIGHT,
  depth: CUBE_DEPTH,
  widthSegments: 30,
  depthSegments: 30,
  uvOffsetEachFace: true,
})

const blurDirection = new Float32Array([1, 0])

const fboCopy = createFramebuffer(gl, innerWidth, innerHeight, true, 'fboCopy')
const fboBlurPing = createFramebuffer(
  gl,
  innerWidth,
  innerHeight,
  false,
  'blurPing',
)
const fboBlurPong = createFramebuffer(
  gl,
  innerWidth,
  innerHeight,
  false,
  'blurPong',
)

const fullscreenQuadGeo = createPlane({
  width: innerWidth,
  height: innerHeight,
  flipUVy: true,
})

const blurQuad = new Quad(gl, {
  geometry: fullscreenQuadGeo,
  uniforms: {
    u_diffuse: {
      type: gl.INT,
      value: 0,
    },
    u_resolution: {
      type: gl.FLOAT_VEC2,
      value: new Float32Array([innerWidth, innerHeight]),
    },
    u_blurDirection: {
      type: gl.FLOAT_VEC2,
      value: blurDirection,
    },
  },
  defines: { USE_TEXTURE: true, USE_GAUSSIAN_BLUR: true },
  name: 'blurQuad',
})
const dofQuad = new Quad(gl, {
  geometry: fullscreenQuadGeo,
  uniforms: {
    u_diffuse: {
      type: gl.INT,
      value: 0,
    },
    u_blurTexture: {
      type: gl.INT,
      value: 1,
    },
    u_depthTexture: {
      type: gl.INT,
      value: 2,
    },
    u_depthRange: {
      type: gl.FLOAT_VEC2,
      value: new Float32Array([OPTIONS.dofInnerRange, OPTIONS.dofOuterRange]),
    },
    u_dof: {
      type: gl.FLOAT,
      value: OPTIONS.dof,
    },
  },
  defines: {
    USE_TEXTURE: true,
    USE_DOF: true,
  },
})

fetch('http://192.168.2.123:3001/api')
  .then((projects) => projects.json())
  .then(transformProjectEntries)
  .then((projects: Project[]) => {
    const viewGeoPartialProps = { cubeGeometry, labelGeometry }
    const projectsByYear = sortProjectEntriesByYear(projects)

    // singleView = new SingleView(gl, {
    //   imageGeometry,
    //   descGeometry,
    //   project: projects[0],
    //   name: 'ar',
    // })
    // singleView.updateWorldMatrix()

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
    uboPerspectiveCamera = createAndBindUBOToBase(
      gl,
      uboCameraBlockInfo.blockSize,
      0,
    )!
    uboOrthographicCamera = createAndBindUBOToBase(
      gl,
      uboCameraBlockInfo.blockSize,
      1,
    )!

    projectsNode.setPosition(getXYZForViewIdxWithinLevel(1, 0))
    projectsNode.loadThumbnail()
    projectsNode.reveal()
    projectsNode.visible = true
    projectsNode.setParent(boxesRootNode)

    const aboutNode = new View(gl, { ...viewGeoPartialProps, name: 'about' })
    aboutNode.loadThumbnail()
    aboutNode.reveal()
    aboutNode.visible = true
    aboutNode.setParent(boxesRootNode)

    const aaaaaaNode = new View(gl, { ...viewGeoPartialProps, name: 'aa' })
    aaaaaaNode.loadThumbnail()
    aaaaaaNode.reveal()
    aaaaaaNode.visible = false
    aaaaaaNode.setParent(aboutNode)

    const contactNode = new View(gl, {
      ...viewGeoPartialProps,
      name: 'contact',
    })
    contactNode.loadThumbnail()
    contactNode.reveal()
    contactNode.visible = true
    contactNode.setParent(boxesRootNode)

    const blogNode = new View(gl, {
      ...viewGeoPartialProps,
      name: 'blog',
    })
    blogNode.loadThumbnail()
    blogNode.reveal()
    blogNode.visible = true
    blogNode.setParent(boxesRootNode)

    for (const [key, projects] of Object.entries(projectsByYear)) {
      const yearNode = new View(gl, { ...viewGeoPartialProps, name: key })
      yearNode.setParent(projectsNode)
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i]
        const projectNode = new View(gl, {
          ...viewGeoPartialProps,
          name: project.uid,
          project,
          hasLabel: true,
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
      levelIdx++
      const children = node.children
      for (let i = 0; i < children.length; i++) {
        const child = node.children[i] as View
        positionNodeWithinLevel(child, i, levelIdx)
      }
    }

    positionNodeWithinLevel(boxesRootNode, 0, -1)

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

const imageGeometry = createBox({
  width: LAYOUT_COLUMN_MAX_WIDTH * (2 / 3) * 0.95,
  height: LAYOUT_COLUMN_MAX_WIDTH * (2 / 3) * 0.5 * 0.95,
  depth: LAYOUT_COLUMN_MAX_WIDTH * (2 / 3) * 0.5 * 0.95,
  uvOffsetEachFace: true,
})
const descGeometry = createBox({
  width: 4,
  height: 2,
  depth: 2,
  uvOffsetEachFace: true,
})
const labelGeometry = createPlane({
  width: LABEL_WIDTH,
  height: LABEL_HEIGHT,
})

const hoverCube = new Cube(gl, {
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
    OPTIONS.cameraFreeMode ? freeOrbitCamera : perspectiveCamera,
  )

  // debugger
  if (e.metaKey) {
    debugLines.push(new Line(gl, rayStart, rayEnd))
  }

  const {
    ui: { isCurrentlyTransitionViews },
  } = store.getState()

  // console.log(isCurrentlyTransitionViews)
  // if (isCurrentlyTransitionViews) {
  //   return
  // }

  const hitView = getHoveredSceneNode(rayStart, rayDirection)

  if (!hitView) {
    return
  }

  const prevLevel = prevView?.levelIndex || 0
  const currLevel = hitView.levelIndex

  store.dispatch(setShowCubeHighlight(false))

  let showChildRow = true
  let animateCamera = true
  let animateCameraDirection: 0 | 1 = 0 // 0 - forward, 1 - backwards
  if (prevView) {
    // debugger
    if (currLevel < prevLevel) {
      const viewsToClose: SceneNode[] = []

      await new Promise((resolve) => {
        prevView.traverse((child) => {
          const view = child as View
          if (view.findParentByName(View.MESH_WRAPPER_NAME)) {
            return
          }
          if (view.levelIndex === prevView.levelIndex) {
            viewsToClose.push(...view.siblings)
          }
          if (view.levelIndex > prevView.levelIndex) {
            viewsToClose.push(view)
          }
          new Tween({
            durationMS: 1000,
            easeName: 'linear',
            onUpdate: (v) => {
              for (let i = 0; i < viewsToClose.length; i++) {
                const view = viewsToClose[i] as View
                const sc = 1 - v
                view.hide(sc, sc, sc)
                view.updateWorldMatrix()
              }
            },
            onComplete: () => resolve(null),
          }).start()
        })
      })

      for (let i = 0; i < viewsToClose.length; i++) {
        const view = viewsToClose[i] as View
        view.visible = false
      }

      hitView.open = false

      showChildRow = !prevView.findParentByName(hitView.name as string)
      animateCameraDirection = 1
    } else if (currLevel === prevLevel) {
      if (hitView.name === prevView.name) {
        for (let i = 0; i < hitView.children.length; i++) {
          const view = hitView.children[i] as View
          view.visible = true
        }
        const hitViewOpen = hitView.open
        await new Promise((resolve) => {
          new Tween({
            durationMS: 1000,
            easeName: 'quart_InOut',
            onUpdate: (v) => {
              for (let i = 0; i < hitView.children.length; i++) {
                const view = hitView.children[i] as View
                if (hitViewOpen) {
                  const sc = 1 - v
                  view.hide(sc, sc, sc)
                } else {
                  const sc = v
                  view.reveal(sc, sc, sc)
                }
                view.updateWorldMatrix()
              }
            },
            onComplete: () => resolve(null),
          }).start()
        })
        for (let i = 0; i < hitView.children.length; i++) {
          const view = hitView.children[i] as View
          view.visible = !hitViewOpen
        }
        hitView.open = !hitViewOpen
        showChildRow = false
        animateCameraDirection = hitView.open ? 0 : 1
      } else {
        await new Promise((resolve) =>
          new Tween({
            durationMS: 1000,
            easeName: 'quart_In',
            onUpdate: (v) => {
              for (let i = 0; i < prevView.children.length; i++) {
                const view = prevView.children[i] as View
                const sc = 1 - v
                view.hide(sc, sc, sc)
                view.updateWorldMatrix()
              }
            },
            onComplete: () => resolve(null),
          }).start(),
        )

        for (let i = 0; i < prevView.children.length; i++) {
          const view = prevView.children[i] as View
          view.visible = false
        }

        hitView.open = !hitView.open
        if (hitView.children.length && prevView.open) {
          animateCamera = false
        }
      }
    }
  }

  if (!hitView.children.length) {
    boxesRootNode.traverse((child) => {
      if (!(child instanceof View)) {
        return
      }
      if (child === hitView) {
        return
      }
      child.fadeFactor = 0.2
    })
    showChildRow = false
    animateCamera = false
  }

  if (animateCamera) {
    const oldCamY = perspectiveCamera.position[1]
    const oldCamLookAtY = perspectiveCamera.lookAt[1]
    const oldCamZ = perspectiveCamera.position[2]
    const rowHeight = getChildrenRowTotalHeight(hitView)

    new Tween({
      durationMS: 1_000,
      easeName: 'exp_In',
      onUpdate: (v) => {
        perspectiveCamera.position[1] = oldCamY + (rowHeight / 2 - oldCamY) * v
        perspectiveCamera.lookAt[1] =
          oldCamLookAtY + (rowHeight / 2 - oldCamLookAtY) * v

        const offsetPos =
          animateCameraDirection === 0
            ? v * CAMERA_LEVEL_Z_OFFSET
            : -v * CAMERA_LEVEL_Z_OFFSET

        perspectiveCamera.position[2] = oldCamZ + offsetPos
      },
      onComplete: () => {},
    }).start()
  }

  if (showChildRow) {
    for (let i = 0; i < hitView.children.length; i++) {
      const view = hitView.children[i] as View
      view.loadThumbnail()
      view.visible = true
    }
    await new Promise((resolve) => {
      new Tween({
        durationMS: 1_000,
        delayMS: 500,
        easeName: 'cubic_Out',
        onUpdate: (v) => {
          for (let i = 0; i < hitView.children.length; i++) {
            const view = hitView.children[i] as View
            const rot = CUBE_ROTATION_X_AXIS * (1 - v)
            const deformAngle = CUBE_DEFORM_ANGLE * (1 - v)
            view.reveal(v, v, v, rot, 0, 0, deformAngle)
            view.updateWorldMatrix()
          }
        },
        onComplete: () => resolve(null),
      }).start()
    })

    store.dispatch(setShowCubeHighlight(true))
    store.dispatch(setIsCurrentlyTransitionViews(false))
    hitView.open = true
  }

  // console.log('currLevel', currLevel, 'prevLevel', prevLevel)
  if (hitView) {
    // console.log(
    //   `new hitview ${hitView.name} is ${hitView.open ? 'open' : 'not open'}`,
    // )
    prevView = hitView
  }
}

function updateFrame(ts: DOMHighResTimeStamp) {
  requestAnimationFrame(updateFrame)

  // console.log(freeOrbitCamera.position)

  freeOrbitCamera.updateViewMatrix().updateProjectionViewMatrix()
  perspectiveCamera.updateViewMatrix().updateProjectionViewMatrix()

  const {
    ui: { mousePos },
  } = store.getState()
  const normX = (mousePos[0] / innerWidth) * 2 - 1
  const normY = 2 - (mousePos[1] / innerHeight) * 2 - 1
  const { rayStart, rayEnd, rayDirection } = projectMouseToWorldSpace(
    [normX, normY],
    OPTIONS.cameraFreeMode ? freeOrbitCamera : perspectiveCamera,
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
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  // UBO for perspective camera projections
  if (uboPerspectiveCamera) {
    const projViewMatix = OPTIONS.cameraFreeMode
      ? freeOrbitCamera.projectionViewMatrix
      : perspectiveCamera.projectionViewMatrix
    gl.bindBuffer(gl.UNIFORM_BUFFER, uboPerspectiveCamera)
    gl.bufferSubData(
      gl.UNIFORM_BUFFER,
      // uboCameraBlockInfo.uniforms.projectionViewMatrix.offset,
      0,
      projViewMatix as ArrayBufferView,
      0,
    )
  }

  // UBO for orthographic camera projections
  if (uboOrthographicCamera) {
    const projViewMatix = orthographicCamera.projectionViewMatrix
    gl.bindBuffer(gl.UNIFORM_BUFFER, uboOrthographicCamera)
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, projViewMatix as ArrayBufferView, 0)
  }

  gl.bindBuffer(gl.UNIFORM_BUFFER, null)

  gl.bindFramebuffer(gl.FRAMEBUFFER, fboCopy.framebuffer)
  gl.clearColor(0.1, 0.1, 0.1, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  if (uboPerspectiveCamera) {
    boxesRootNode.render()

    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.FRONT)
    hoverCube.updateWorldMatrix()
    hoverCube.render()

    gl.disable(gl.CULL_FACE)
  }

  if (singleView) {
    singleView.render()
  }

  debugLines.forEach((rayLine) => rayLine.render())

  let writeBuffer = fboBlurPing
  let readBuffer = fboBlurPong
  const blurIterations = OPTIONS.blurIterations

  for (let i = 0; i < blurIterations; i++) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, writeBuffer.framebuffer)
    gl.clearColor(0.1, 0.1, 0.1, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const radius = blurIterations - i - 1
    blurDirection[0] = i % 2 === 0 ? radius : 0
    blurDirection[1] = i % 2 === 0 ? 0 : radius

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(
      gl.TEXTURE_2D,
      i === 0 ? fboCopy.texture : readBuffer.texture,
    )
    blurQuad.updateUniform('u_blurDirection', blurDirection)
    blurQuad.render(1)

    const t = writeBuffer
    writeBuffer = readBuffer
    readBuffer = t
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, fboCopy.texture)
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, writeBuffer.texture)
  gl.activeTexture(gl.TEXTURE2)
  gl.bindTexture(gl.TEXTURE_2D, fboCopy.depthTexture!)

  dofQuad.render(1)
}

function getHoveredSceneNode(rayStart: vec3, rayDirection: vec3): View {
  let prevRayTimeSample = Infinity // better name?
  let hitView!: View

  boxesRootNode.traverse((child) => {
    if (!(child instanceof View)) {
      return
    }

    const rayTime = child.testRayIntersection(rayStart, rayDirection)

    if (rayTime !== null && rayTime < prevRayTimeSample) {
      prevRayTimeSample = rayTime
      hitView = child
    }
  })

  return hitView
}
