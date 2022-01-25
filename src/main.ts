import { vec3 } from 'gl-matrix'
import * as dat from 'dat.gui'
import { CameraTransitionProps, Project } from './interfaces'
import store from './store'

import {
  getChildrenRowTotalHeight,
  getXYZForViewIdxWithinLevel,
  promisifiedTween,
  sortProjectEntriesByYear,
  transformProjectEntries,
  traverseViewNodes,
} from './helpers'

import {
  setActiveItemUID,
  setChildrenRowHeight,
  setIsCurrentlyTransitionViews,
  setIsHovering,
  setMousePos,
} from './store/ui'

import {
  CameraController,
  createPlane,
  createBox,
  OrthographicCamera,
  PerspectiveCamera,
  SceneNode,
  createAndBindUBOToBase,
  createUniformBlockInfo,
  TextureAtlas,
} from './lib/hwoa-rang-gl2'

import {
  mapNumberRange,
  deg2Rad,
  projectMouseToWorldSpace,
  clamp,
} from './lib/hwoa-rang-math'

import { easeType, Tween } from './lib/hwoa-rang-anim'

import Cube from './meshes/cube'
import View from './view'
import Line from './meshes/line'

import './style.css'

import {
  API_ENDPOINT,
  BASE_PAGE_TITLE,
  CAMERA_FAR,
  CAMERA_LEVEL_Z_OFFSET,
  CAMERA_NEAR,
  CLOSE_BUTTON_DEPTH,
  CLOSE_BUTTON_HEIGHT,
  CLOSE_BUTTON_WIDTH,
  CUBE_DEPTH,
  CUBE_HEIGHT,
  CUBE_WIDTH,
  LABEL_HEIGHT,
  LABEL_WIDTH,
  LAYOUT_COLUMN_MAX_WIDTH,
  LAYOUT_LEVEL_Y_OFFSET,
  OPEN_BUTTON_HEIGHT,
  OPEN_BUTTON_WIDTH,
  TRANSITION_CAMERA_DURATION,
  TRANSITION_CAMERA_EASE,
  TRANSITION_ROW_DELAY,
  TRANSITION_ROW_DURATION,
  TRANSITION_ROW_EASE,
} from './constants'
import CameraDebug from './lib/hwoa-rang-gl2/src/extra/camera-debug'

const OPTIONS = {
  cameraFreeMode: false,
}

const gui = new dat.GUI()

gui.add(OPTIONS, 'cameraFreeMode').onChange((v) => {
  if (v) {
    orbitController.start()
  } else {
    orbitController.pause()
  }
})

let oldTime = 0
let prevView!: View
let hitView!: View
let prevHoverView!: View
let oldActiveItemUID: string
let openButtonHoverTransition = false
let closeButtonTextureCanvas: HTMLCanvasElement

const opaqueObjects: SceneNode[] = []
const transparentObjects: SceneNode[] = []
const debugLines: Line[] = []
const rootNode = new SceneNode()
const boxesRootNode = new SceneNode()
boxesRootNode.setParent(rootNode)

const $app = document.getElementById('app')!
const $canvas: HTMLCanvasElement = document.createElement('canvas')
sizeCanvas()
$app.appendChild($canvas)

const gl: WebGL2RenderingContext = $canvas.getContext('webgl2')!

// Init texture atlas
TextureAtlas.debugMode = false
TextureAtlas.gl = gl
// TextureAtlas.textureFormat = gl.RGBA

// Set up cameras
const freeOrbitCamera = new PerspectiveCamera(
  deg2Rad(70),
  $canvas.width / $canvas.height,
  CAMERA_NEAR,
  1000,
)
freeOrbitCamera.position = [7, 8, 10]
freeOrbitCamera.lookAt = [0, 0, 0]

const perspectiveCamera = new PerspectiveCamera(
  deg2Rad(70),
  $canvas.width / $canvas.height,
  CAMERA_NEAR,
  CAMERA_FAR,
)
perspectiveCamera.position = [0, 0, 8]
perspectiveCamera.lookAt = [0, 0, 0]

const cameraDebugger = new CameraDebug(gl, perspectiveCamera)
const orbitController = new CameraController(freeOrbitCamera, $canvas)
if (!OPTIONS.cameraFreeMode) {
  orbitController.pause()
}

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

// Set up geometries
const cubeGeometry = createBox({
  width: CUBE_WIDTH,
  height: CUBE_HEIGHT,
  depth: CUBE_DEPTH,
  widthSegments: 30,
  depthSegments: 30,
  uvOffsetEachFace: true,
})
const labelGeometry = createPlane({
  width: LABEL_WIDTH,
  height: LABEL_HEIGHT,
  widthSegments: 30,
  heightSegments: 20,
})
const openButtonGeometry = createPlane({
  width: OPEN_BUTTON_WIDTH,
  height: OPEN_BUTTON_HEIGHT,
})
const closeBtnGeometry = createBox({
  width: CLOSE_BUTTON_WIDTH,
  height: CLOSE_BUTTON_HEIGHT,
  depth: CLOSE_BUTTON_DEPTH,
  uvOffsetEachFace: true,
})

// Hover cube
const hoverCube = new Cube(gl, {
  geometry: cubeGeometry,
  solidColor: [0, 0, 1, 1],
})
hoverCube.setPosition([-1, 0, 0])
hoverCube.setScale([1.05, 1.05, 1.05])
hoverCube.setParent(rootNode)

const closeButton = new Cube(gl, {
  geometry: closeBtnGeometry,
  name: 'close-btn',
  // solidColor: [1, 0, 0, 1],
})
closeButton.fadeFactor = 0
closeButton.setPosition([
  LAYOUT_COLUMN_MAX_WIDTH / 2 - CLOSE_BUTTON_WIDTH,
  CUBE_HEIGHT / 2 + CLOSE_BUTTON_HEIGHT * 1.25,
  0,
])
closeButton.setParent(rootNode)
closeButton.updateWorldMatrix()
closeButton.displayPoster(makeCloseButtonTexture())

// Get and set up UBOs that hold perspective & ortho cameras matrices
const uboCameraBlockInfo = createUniformBlockInfo(
  gl,
  hoverCube.program,
  'Camera',
  ['projectionViewMatrix'],
)
const uboPerspectiveCamera = createAndBindUBOToBase(
  gl,
  uboCameraBlockInfo.blockSize,
  0,
)!
const uboOrthographicCamera = createAndBindUBOToBase(
  gl,
  uboCameraBlockInfo.blockSize,
  1,
)!

fetch(API_ENDPOINT)
  .then((projects) => projects.json())
  .then(transformProjectEntries)
  .then((projects: Project[]) => {
    const viewGeoPartialProps = {
      cubeGeometry,
      labelGeometry,
      openButtonGeometry,
    }
    const projectsByYear = sortProjectEntriesByYear(projects)

    const projectsNode = new View(gl, {
      ...viewGeoPartialProps,
      name: 'Projects',
    })
    projectsNode.loadThumbnail()
    projectsNode.visibilityTweenFactor = 1

    projectsNode.setParent(boxesRootNode)

    const aboutNode = new View(gl, { ...viewGeoPartialProps, name: 'about' })
    aboutNode.loadThumbnail()
    aboutNode.visibilityTweenFactor = 1
    aboutNode.visible = true
    aboutNode.setParent(boxesRootNode)

    const aaaaaaNode = new View(gl, { ...viewGeoPartialProps, name: 'aa' })
    aaaaaaNode.loadThumbnail()
    aaaaaaNode.visibilityTweenFactor = 1
    aaaaaaNode.visible = false
    aaaaaaNode.setParent(aboutNode)

    const contactNode = new View(gl, {
      ...viewGeoPartialProps,
      name: 'contact',
      externalURL: 'mailto:connect@georgi-nikolov.com',
    })
    contactNode.loadThumbnail()
    contactNode.visibilityTweenFactor = 1
    contactNode.visible = true
    contactNode.setParent(boxesRootNode)

    const blogNode = new View(gl, {
      ...viewGeoPartialProps,
      name: 'archive',
      externalURL: 'https://archive.georgi-nikolov.com/',
    })
    blogNode.loadThumbnail()
    blogNode.visibilityTweenFactor = 1
    blogNode.visible = true
    blogNode.setParent(boxesRootNode)

    for (const [key, projects] of Object.entries(projectsByYear)) {
      const yearNode = new View(gl, { ...viewGeoPartialProps, name: key })
      yearNode.visibilityTweenFactor = 0
      yearNode.visible = false
      yearNode.setParent(projectsNode)
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i]
        const projectNode = new View(gl, {
          ...viewGeoPartialProps,
          name: project.title,
          project,
          hasLabel: true,
        })
        projectNode.visible = false
        projectNode.visibilityTweenFactor = 0
        projectNode.setParent(yearNode)
      }
    }
    projectsNode.visible = true

    const positionNodeWithinLevel = (
      node: SceneNode,
      idx: number,
      levelIdx: number,
    ): vec3 => {
      const position = getXYZForViewIdxWithinLevel(idx, levelIdx)
      node.setPosition(position).updateWorldMatrix()
      levelIdx++
      const children = node.children
      for (let i = 0; i < children.length; i++) {
        const child = node.children[i] as View
        positionNodeWithinLevel(child, i, levelIdx)
      }
      return position
    }

    const childrenRowHeightByView: { [key: string]: number } = {}

    traverseViewNodes(rootNode, (view) => {
      if (view instanceof View) {
        if (view.projectRoleNode) {
          transparentObjects.push(view.projectRoleNode as SceneNode)
        }
        if (view.openLabelNode) {
          transparentObjects.push(view.openLabelNode as SceneNode)
        }
        if (view.projectLabelNode) {
          transparentObjects.push(view.projectLabelNode)
        }
        opaqueObjects.push(view.projectThumbNode)
      } else {
        // if (!view.children.length) {
        //   opaqueObjects.push(view)
        // }
      }
      if (view.project) {
        return
      }
      childrenRowHeightByView[view.uid] = getChildrenRowTotalHeight(
        view.children.length,
      )
    })

    store.dispatch(setChildrenRowHeight(childrenRowHeightByView))

    positionNodeWithinLevel(boxesRootNode, 0, -1)
  })

store.subscribe(() => {
  const {
    ui: { activeItemUID },
  } = store.getState()
  if (hitView && activeItemUID !== oldActiveItemUID) {
    let parentNode = hitView.parentNode
    let urlPath = hitView.project ? hitView.project.uid : hitView.name
    while (parentNode) {
      const parent = parentNode as View
      const fragment = parent.project ? parent.project.uid : parent.name

      parentNode = parentNode.parentNode
      if (!fragment) {
        continue
      }
      urlPath = `${fragment}/${urlPath}`
    }
    if (urlPath) {
      document.title = `${hitView.name} | ${BASE_PAGE_TITLE}`
      history.replaceState(
        {},
        '',
        `${location.origin}/${urlPath.toLowerCase()}`,
      )
    } else {
      document.title = BASE_PAGE_TITLE
      history.replaceState({}, '', location.origin)
    }

    oldActiveItemUID = activeItemUID
  }
})
document.body.addEventListener('mousemove', onMouseMove)
document.body.addEventListener('click', onMouseClick)
// document.body.addEventListener('touchstart', (e) => e.preventDefault())
// document.body.addEventListener('touchmove', (e) => e.preventDefault())
requestAnimationFrame(updateFrame)

// let oldMX = 0
// let oldMY = 0
// store.subscribe(() => {
//   const state = store.getState().ui
//   const mouseXChanged = Math.abs(state.mousePos[0] - oldMX) > 100
//   const mouseYChanged = Math.abs(state.mousePos[1] - oldMY) > 100
//   if (mouseXChanged) {
//     oldMX = state.mousePos[0]
//   }
//   if (mouseYChanged) {
//     oldMY = state.mousePos[1]
//   }
//   if (mouseXChanged && mouseYChanged) {
//     console.log(state)
//   }
// })

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
    ui: { childrenRowHeights, isCurrentlyTransitionViews, activeItemUID },
  } = store.getState()

  if (isCurrentlyTransitionViews) {
    return
  }

  const [_hitView, isOpenLink] = getHoveredSceneNode(rayStart, rayDirection)
  hitView = _hitView

  if (isOpenLink && hitView.project) {
    open(hitView.project.url, '_blank')
    return
  }
  store.dispatch(setIsCurrentlyTransitionViews(true))

  const oldView = activeItemUID
    ? (boxesRootNode.findChild((child) => child.uid === activeItemUID) as View)
    : null

  if (oldView?.project && !hitView?.project) {
    traverseViewNodes(rootNode, (view) => {
      if (view !== oldView) {
        new Tween({
          durationMS: 500,
          onUpdate: (v) => {
            view.fadeFactor = clamp(
              mapNumberRange(v, 0, 1, View.FADED_OUT_FACTOR, 1),
              View.FADED_OUT_FACTOR,
              1,
            )
          },
        }).start()
      }
    })
    promisifiedTween({
      durationMS: 500,
      onUpdate: (v) => {
        oldView.metaLabelsRevealFactor = 1 - v
      },
    })
    // const siblings = oldView?.siblings
    // if (siblings) {
    //   const sibling = oldView.siblings
    //   promisifiedTween({
    //     durationMS: 500,
    //     onUpdate: (v) => {
    //       for (let i = 0; i < sibling.length; i++) {
    //         const view = siblings[i] as View
    //         view.metaLabelsRevealFactor = 1 - v
    //       }
    //     },
    //   })
    // }
  }

  if (!hitView) {
    store.dispatch(setIsCurrentlyTransitionViews(false))
    if (!oldView) {
      return
    }
    oldView.open = false
    if (!oldView.parentNode) {
      return
    }
    if (oldView.levelIndex - 2 < 0) {
      return
    }

    store.dispatch(setActiveItemUID(oldView.uid))
    hitView = oldView.parentNode as View

    toggleChildrenRowVisibility(oldView, false)
    store.dispatch(setActiveItemUID(oldView.parentNode.uid))
    // store.dispatch(setIsCurrentlyTransitionViews(false))

    // const levelOffset = oldView?.project ? 0 : 0
    const levelIndex = oldView.levelIndex - 2

    // const rowHeight = childrenRowHeights[oldView.parentNode.uid] //childrenRowHeights[oldView.uid]
    const rowHeight =
      childrenRowHeights[((oldView as View).parentNode as View).uid]

    // const newY =
    //   levelIndex === 0 ? 0 : -rowHeight / 2 - LAYOUT_LEVEL_Y_OFFSET * levelIndex
    const newY =
      levelIndex === 0
        ? 0
        : -rowHeight / 2 - LAYOUT_LEVEL_Y_OFFSET * levelIndex + CUBE_HEIGHT / 2
    const newZ = 8 + levelIndex * CAMERA_LEVEL_Z_OFFSET

    // debugger

    tweenCameraToPosition({
      newX: 0,
      newY,
      newZ,
    })
    return
  }

  if (hitView.externalURL) {
    if (hitView.externalURL.startsWith('mailto')) {
      open(hitView.externalURL)
    } else {
      open(hitView.externalURL, '_blank')
    }
    store.dispatch(setIsCurrentlyTransitionViews(false))
    return
  }

  if (hitView.project) {
    if (hitView.open) {
      store.dispatch(setIsCurrentlyTransitionViews(false))
      return
    }
    console.log('hit')
    hitView.open = true
    if (oldView) {
      oldView.open = false
    }
    new Tween({
      durationMS: 500,
      onUpdate: (v) => {
        hitView.metaLabelsRevealFactor = v
        if (oldView?.project) {
          hitView.fadeFactor = clamp(
            mapNumberRange(v, 0, 1, View.FADED_OUT_FACTOR, 1),
            View.FADED_OUT_FACTOR,
            1,
          )

          oldView.fadeFactor = clamp(
            mapNumberRange(v, 0, 1, 1, View.FADED_OUT_FACTOR),
            View.FADED_OUT_FACTOR,
            1,
          )
          oldView.metaLabelsRevealFactor = 1 - v
        } else {
          traverseViewNodes(rootNode, (view) => {
            if (view !== hitView) {
              view.fadeFactor = clamp(
                mapNumberRange(v, 0, 1, 1, View.FADED_OUT_FACTOR),
                View.FADED_OUT_FACTOR,
                1,
              )
            }
          })
        }
      },
    }).start()
    tweenCameraToPosition({
      newX: hitView.position[0],
      newY: hitView.position[1],
      newZ: hitView.position[2] + 5,
      // lookAtTweenDurationMS: 1200,
      lookAtDelayMS: 250,
      lookAtTweenEaseName: 'exp_Out',
      // lookAtDelayMS: 150,
      // hitView.position[0],
      // hitView.position[1],
      // hitView.position[2] - 100,
    })
    store.dispatch(setActiveItemUID(hitView.uid))
    store.dispatch(setIsCurrentlyTransitionViews(false))
    return
  }

  const activeLevelIdx = hitView.levelIndex - 2
  const prevLevelIdx = oldView ? oldView.levelIndex - 2 : 0
  const levelDiff = activeLevelIdx - prevLevelIdx

  if (levelDiff === 0) {
    hitView.open = hitView === oldView ? !hitView.open : true
    if (hitView === oldView) {
      toggleChildrenRowVisibility(hitView, hitView.open)
    } else {
      hitView.open = true
      if (oldView) {
        if (oldView.open) {
          await toggleChildrenRowVisibility(oldView, false)
        } else {
          toggleChildrenRowVisibility(oldView, false)
        }
        oldView.open = false
      }
      toggleChildrenRowVisibility(hitView, true)
    }
  } else if (levelDiff > 0) {
    hitView.open = true
    if (prevView) {
      prevView.open = false
    }
    toggleChildrenRowVisibility(hitView, hitView.open)
  } else if (levelDiff < 0) {
    hitView.open = !!hitView.findChild((child) => child === prevView)
    if (prevView) {
      prevView.open = false
    }
    const viewsToClose: View[] = []
    traverseViewNodes(rootNode, (view) => {
      if (view.findParentByName(View.MESH_WRAPPER_NAME)) {
        return
      }
      const viewLevel = view.levelIndex
      if (viewLevel <= hitView.levelIndex) {
        return
      }
      viewsToClose.push(view)
    })
    await toggleChildrenRowVisibility(viewsToClose, false)
    const prevSameLevelParent = oldView?.findParent(
      (parent) => parent.levelIndex === hitView.levelIndex,
    )
    toggleChildrenRowVisibility(hitView, hitView !== prevSameLevelParent)
  }
  console.log('----- end')

  const levelIndex = hitView.levelIndex - 2 + (hitView.open ? 1 : 0)
  const rowHeight = hitView.open
    ? childrenRowHeights[hitView.uid]
    : childrenRowHeights[(hitView.parentNode as View).uid]
  // console.log('hitView.open', hitView.open)

  const newY =
    levelIndex === 0
      ? 0
      : -rowHeight / 2 - LAYOUT_LEVEL_Y_OFFSET * levelIndex + CUBE_HEIGHT / 2
  const newZ = 8 + levelIndex * CAMERA_LEVEL_Z_OFFSET

  console.log(levelIndex, hitView.open)

  closeButton.fadeFactor = 1
  closeButton.setPosition([
    LAYOUT_COLUMN_MAX_WIDTH / 2 - CLOSE_BUTTON_WIDTH,
    newY + CUBE_HEIGHT,
    newZ - 8,
  ])
  closeButton.updateWorldMatrix()

  tweenCameraToPosition({
    newX: 0,
    newY,
    newZ,
    newLookAtX: 0,
    newLookAtY: newY,
    newLookAtZ: -100,
  })

  // console.log({ newX, newY, newZ })

  store.dispatch(setActiveItemUID(hitView.uid))
  store.dispatch(setIsCurrentlyTransitionViews(false))
}

function updateFrame(ts: DOMHighResTimeStamp) {
  const dt = ts - oldTime
  oldTime = ts

  requestAnimationFrame(updateFrame)

  // console.log(perspectiveCamera.position, perspectiveCamera.lookAt)

  // console.log(freeOrbitCamera.position)

  const {
    ui: { mousePos, activeItemUID },
  } = store.getState()
  const normX = (mousePos[0] / innerWidth) * 2 - 1
  const normY = 2 - (mousePos[1] / innerHeight) * 2 - 1
  const { rayStart, rayEnd, rayDirection } = projectMouseToWorldSpace(
    [normX, normY],
    OPTIONS.cameraFreeMode ? freeOrbitCamera : perspectiveCamera,
  )

  const [hitView, isOpenLink] = getHoveredSceneNode(rayStart, rayDirection)
  // debugLines.push(new Line(gl, rayStart, rayDirection))

  if (hitView) {
    if (isOpenLink) {
      if (hitView === prevHoverView) {
        if (openButtonHoverTransition) {
          new Tween({
            durationMS: 300,
            onUpdate: (v) => {
              hitView.openHoverFactor = v
            },
          }).start()
          openButtonHoverTransition = false
        }
      }
    }
  } else {
    const oldView = activeItemUID
      ? (boxesRootNode.findChild(
          (child) => child.uid === activeItemUID,
        ) as View)
      : null
    if (oldView) {
      if (!openButtonHoverTransition) {
        new Tween({
          durationMS: 300,
          onUpdate: (v) => {
            oldView.openHoverFactor = 1 - v
          },
        }).start()
        openButtonHoverTransition = true
      }
    }
  }
  prevHoverView = hitView

  const {
    ui: { showCubeHighlight },
  } = store.getState()

  if (hitView && hitView.uid !== activeItemUID && showCubeHighlight) {
    hoverCube.setPosition(hitView.position)
    store.dispatch(setIsHovering(true))
  } else {
    hoverCube.setPosition([100, 100, 100])
    // store.dispatch(setIsHovering(false))
    store.dispatch(setIsHovering(hitView && hitView.open && isOpenLink))
  }

  // update camera
  {
    // const {
    //   ui: { mousePos },
    // } = store.getState()
    // const mx = mousePos[0] / innerWidth - 0.5
    // const my = mousePos[1] / innerHeight - 0.5
    // const camX = perspectiveCamera.position[0]
    // const camY = perspectiveCamera.position[1]
    // // const camZ = perspectiveCamera.position[2]
    // const speed = dt * 0.001 * 2
    // const x = camX + (mx - camX) * speed * 2
    // const y = camY + (my - camY) * speed
    // const z = perspectiveCamera.position[2]
    // // console.log(mx, my)
    // perspectiveCamera.position = [x, y, z]
  }

  freeOrbitCamera.updateViewMatrix().updateProjectionViewMatrix()
  perspectiveCamera.updateViewMatrix().updateProjectionViewMatrix()

  gl.enable(gl.DEPTH_TEST)

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.1, 0.1, 0.1, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  // gl.enable(gl.BLEND)
  // gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA)
  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

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

  // gl.bindFramebuffer(gl.FRAMEBUFFER, fboCopy.framebuffer)
  gl.clearColor(0.1, 0.1, 0.1, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  cameraDebugger
    .preRender(OPTIONS.cameraFreeMode ? freeOrbitCamera : perspectiveCamera)
    .render()

  if (uboPerspectiveCamera) {
    // rootNode.render()

    for (let i = 0; i < opaqueObjects.length; i++) {
      const child = opaqueObjects[i]
      child.render()
    }
    for (let i = 0; i < transparentObjects.length; i++) {
      const child = transparentObjects[i]
      child.render()
    }

    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.FRONT)
    // gl.disable(gl.DEPTH_TEST)
    hoverCube.updateWorldMatrix()
    hoverCube.render()

    gl.disable(gl.CULL_FACE)
    // gl.enable(gl.DEPTH_TEST)

    // closeButton.render()
  }

  debugLines.forEach((rayLine) => rayLine.render())

  // let writeBuffer = fboBlurPing
  // let readBuffer = fboBlurPong
  // const blurIterations = OPTIONS.blurIterations

  // for (let i = 0; i < blurIterations; i++) {
  //   gl.bindFramebuffer(gl.FRAMEBUFFER, writeBuffer.framebuffer)
  //   gl.clearColor(0.1, 0.1, 0.1, 1.0)
  //   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  //   const radius = blurIterations - i - 1
  //   blurDirection[0] = i % 2 === 0 ? radius : 0
  //   blurDirection[1] = i % 2 === 0 ? 0 : radius

  //   gl.activeTexture(gl.TEXTURE0)
  //   gl.bindTexture(
  //     gl.TEXTURE_2D,
  //     i === 0 ? fboCopy.texture : readBuffer.texture,
  //   )
  //   blurQuad.updateUniform('u_blurDirection', blurDirection)
  //   blurQuad.render(1)

  //   const t = writeBuffer
  //   writeBuffer = readBuffer
  //   readBuffer = t
  // }

  // gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  // gl.activeTexture(gl.TEXTURE0)
  // gl.bindTexture(gl.TEXTURE_2D, fboCopy.texture)
  // gl.activeTexture(gl.TEXTURE1)
  // gl.bindTexture(gl.TEXTURE_2D, writeBuffer.texture)
  // gl.activeTexture(gl.TEXTURE2)
  // gl.bindTexture(gl.TEXTURE_2D, fboCopy.depthTexture!)

  // dofQuad.render(1)
}

function getHoveredSceneNode(
  rayStart: vec3,
  rayDirection: vec3,
): [View, boolean] {
  let prevRayTimeSample = Infinity
  let hitView!: View
  let isOpenLink = false

  traverseViewNodes(boxesRootNode, (child) => {
    const testInfo = child.testRayIntersection(rayStart, rayDirection)
    if (!testInfo) {
      return
    }
    const [rayTime, _isOpenLink] = testInfo
    if (rayTime !== null && rayTime < prevRayTimeSample) {
      prevRayTimeSample = rayTime
      hitView = child
      isOpenLink = _isOpenLink
    }
  })

  return [hitView, isOpenLink]
}

async function toggleChildrenRowVisibility(
  node: View | View[],
  visible: boolean,
  durationMS: number = TRANSITION_ROW_DURATION,
  easeName: easeType = TRANSITION_ROW_EASE,
) {
  const views = Array.isArray(node) ? node : node.children
  for (let i = 0; i < views.length; i++) {
    const child = views[i]
    child.loadThumbnail()
    if (visible) {
      child.visible = true
    }
  }
  return await Promise.all(
    views.map((child, i) =>
      promisifiedTween({
        durationMS,
        delayMS: TRANSITION_ROW_DELAY + (visible ? i * 50 : 0),
        easeName,
        onUpdate: (v) => {
          child.visibilityTweenFactor = visible ? v : 1 - v
        },
        onComplete: () => {
          if (!visible) {
            views[i].visible = false
          }
        },
      }),
    ),
  )
}

async function tweenCameraToPosition({
  newX,
  newY,
  newZ,
  positionDelayMS = 0,
  positionTweenDurationMS = TRANSITION_CAMERA_DURATION,
  positionTweenEaseName = TRANSITION_CAMERA_EASE,
  newLookAtX = newX,
  newLookAtY = newY,
  newLookAtZ = newZ - 100,
  lookAtDelayMS = 0,
  lookAtTweenDurationMS = TRANSITION_CAMERA_DURATION,
  lookAtTweenEaseName = TRANSITION_CAMERA_EASE,
}: CameraTransitionProps) {
  return Promise.all([
    promisifiedTween({
      durationMS: positionTweenDurationMS,
      delayMS: positionDelayMS,
      easeName: positionTweenEaseName,
      onUpdate: (v) => {
        perspectiveCamera.position[0] +=
          (newX - perspectiveCamera.position[0]) * v
        perspectiveCamera.position[1] +=
          (newY - perspectiveCamera.position[1]) * v
        perspectiveCamera.position[2] +=
          (newZ - perspectiveCamera.position[2]) * v

        perspectiveCamera.updateViewMatrix().updateProjectionViewMatrix()
      },
    }),
    promisifiedTween({
      durationMS: lookAtTweenDurationMS,
      delayMS: lookAtDelayMS,
      easeName: lookAtTweenEaseName,
      onUpdate: (v) => {
        perspectiveCamera.lookAt[0] +=
          (newLookAtX - perspectiveCamera.lookAt[0]) * v
        perspectiveCamera.lookAt[1] +=
          (newLookAtY - perspectiveCamera.lookAt[1]) * v
        perspectiveCamera.lookAt[2] +=
          (newLookAtZ - perspectiveCamera.lookAt[2]) * v

        perspectiveCamera.updateViewMatrix().updateProjectionViewMatrix()
      },
    }),
  ])

  // return
}

async function fadeInFadedOutView(
  rootNode: SceneNode,
  includeActive = false,
  durationMS = 500,
  easeName: easeType = 'exp_In',
) {
  return promisifiedTween({
    durationMS,
    easeName,
    onUpdate: (v) => {
      traverseViewNodes(rootNode, (child) => {
        if (!includeActive && child === prevView) {
          return
        }
        child.fadeFactor = mapNumberRange(v, 0, 1, View.FADED_OUT_FACTOR, 1)
      })
    },
  })
}

function makeCloseButtonTexture() {
  if (closeButtonTextureCanvas) {
    return closeButtonTextureCanvas
  }
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 64
  const cc = c.getContext('2d')!
  cc.strokeStyle = 'white'
  cc.lineWidth = 1
  const padding = c.width * 0.2
  cc.beginPath()
  cc.moveTo(padding, padding)
  cc.lineTo(c.width - padding, c.height - padding)
  cc.stroke()
  cc.beginPath()
  cc.moveTo(c.width - padding, padding)
  cc.lineTo(padding, c.height - padding)
  cc.stroke()
  closeButtonTextureCanvas = c
  return closeButtonTextureCanvas
}

function sizeCanvas() {
  $canvas.width = innerWidth * devicePixelRatio
  $canvas.height = innerHeight * devicePixelRatio
  $canvas.style.setProperty('width', `${innerWidth}px`)
  $canvas.style.setProperty('height', `${innerHeight}px`)
}
