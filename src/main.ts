import { vec3 } from 'gl-matrix'
import * as dat from 'dat.gui'

import {
  CameraTransitionProps,
  Project,
  RowTransitionProps,
} from './interfaces'

import store from './store'

import {
  aboutSectionMultilineCanvas,
  aboutSectionSingleLineCanvas,
  aboutSectionTwoLineCanvas,
  capitalizeFirstLetter,
  getChildrenRowTotalHeight,
  getXYZForViewIdxWithinLevel,
  promisifiedLoadImage,
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
  PerspectiveCamera,
  SceneNode,
  createAndBindUBOToBase,
  createUniformBlockInfo,
  TextureAtlas,
  CameraDebug,
} from './lib/hwoa-rang-gl2'

import {
  mapNumberRange,
  deg2Rad,
  projectMouseToWorldSpace,
  clamp,
} from './lib/hwoa-rang-math'

import { Tween } from './lib/hwoa-rang-anim'

import MenuBox from './meshes/menu-box'
import View from './view'
import Line from './meshes/line'
import Floor from './meshes/floor'

import {
  API_ENDPOINT,
  BACKGROUND_COLOR,
  BASE_PAGE_TITLE,
  CAMERA_BASE_Z_OFFSET,
  CAMERA_FAR,
  CAMERA_LEVEL_Z_OFFSET,
  CAMERA_NEAR,
  CUBE_DEPTH,
  CUBE_HEIGHT,
  CUBE_WIDTH,
  LABEL_HEIGHT,
  LABEL_WIDTH,
  LAYOUT_LEVEL_Y_OFFSET,
  OPEN_BUTTON_HEIGHT,
  OPEN_BUTTON_WIDTH,
  TRANSITION_CAMERA_LOOKAT_DURATION,
  TRANSITION_CAMERA_LOOKAT_EASE,
  TRANSITION_CAMERA_POSITION_DURATION,
  TRANSITION_CAMERA_POSITION_EASE,
  TRANSITION_ROW_DELAY,
  TRANSITION_ROW_DURATION,
  TRANSITION_ROW_EASE,
} from './constants'

import './style.css'
import profilePicURL from './assets/profile-pic.png'

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

const $app = document.getElementById('app')!
const $canvas: HTMLCanvasElement = document.createElement('canvas')
sizeCanvas()
$app.appendChild($canvas)

const gl: WebGL2RenderingContext = $canvas.getContext('webgl2', {
  antialias: true,
  alpha: false,
})!

let oldTime = 0
let camMoveRadius = 3
let prevView!: View
let hitView!: View
let oldActiveItemUID: string
let prevHoverView!: View
let openButtonHoverTransition = false

const timeAsFloat32 = new Float32Array(1)
const cameraPositionOffset = vec3.fromValues(0, 0, CAMERA_BASE_Z_OFFSET)
const cameraLookAtOffset = vec3.create()
const activeTweens: Map<string, Tween> = new Map()
const debugLinesNode = new SceneNode()
const rootNode = new SceneNode()
const boxesRootNode = new SceneNode()

boxesRootNode.setParent(rootNode)

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
perspectiveCamera.position = [0, 0, CAMERA_BASE_Z_OFFSET]
perspectiveCamera.lookAt = [0, 0, 0]

const cameraDebugger = new CameraDebug(gl, perspectiveCamera)
const orbitController = new CameraController(freeOrbitCamera, $canvas)
if (!OPTIONS.cameraFreeMode) {
  orbitController.pause()
}

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
})
const openButtonGeometry = createPlane({
  width: OPEN_BUTTON_WIDTH,
  height: OPEN_BUTTON_HEIGHT,
})
const viewGeoPartialProps = {
  cubeGeometry,
  labelGeometry,
  openButtonGeometry,
}

const floor = new Floor(gl)
// Hover cube
const hoverCube = new MenuBox(gl, {
  geometry: cubeGeometry,
  solidColor: [0, 0, 1, 1],
})

// Get and set up UBOs that hold shared uniforms
const sharedUBOBlockInfo = createUniformBlockInfo(
  gl,
  hoverCube.program,
  'Shared',
  ['time', 'viewMatrix', 'projectionViewMatrix'],
)
const sharedUBO = createAndBindUBOToBase(gl, sharedUBOBlockInfo.blockSize, 0)!

fetch(API_ENDPOINT)
  .then((projects) => projects.json())
  .then(transformProjectEntries)
  .then((projects: Project[]) => {
    const projectsByYear = sortProjectEntriesByYear(projects)

    const projectsNode = boxesRootNode.findChild(
      (child) => child.name === 'projects',
    ) as View
    const aboutNode = boxesRootNode.findChild(
      (child) => child.name === 'about',
    ) as View
    const contactNode = boxesRootNode.findChild(
      (child) => child.name === 'contact',
    ) as View
    const blogNode = boxesRootNode.findChild(
      (child) => child.name === 'blog',
    ) as View

    const sortedYearsArr: [number, Project[]][] = Object.entries(projectsByYear)
      .map(([year, project]) => [parseInt(year, 10), project])
      .sort(([yearA], [yearB]) => (yearB as number) - (yearA as number))

    for (const [year, projects] of sortedYearsArr) {
      const yearNode = new View(gl, {
        ...viewGeoPartialProps,
        name: year.toString(),
      })
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

    const childrenRowHeightByView: { [key: string]: number } = {}

    traverseViewNodes(rootNode, (view) => {
      if (view.project) {
        return
      }
      childrenRowHeightByView[view.uid] = getChildrenRowTotalHeight(
        view.children.length,
      )
    })

    store.dispatch(setChildrenRowHeight(childrenRowHeightByView))

    positionNodeWithinLevel(boxesRootNode, 0, -1)
    toggleChildrenRowVisibility({
      node: [projectsNode, aboutNode, contactNode, blogNode],
      visible: true,
    })
  })

store.subscribe(() => {
  const {
    ui: { activeItemUID },
  } = store.getState()
  if (hitView && activeItemUID !== oldActiveItemUID) {
    document.title = hitView.name
      ? `${capitalizeFirstLetter(hitView.name)} | ${BASE_PAGE_TITLE}`
      : BASE_PAGE_TITLE
  }
  oldActiveItemUID = activeItemUID
})

initializeNavNodes()
document.body.addEventListener('mousemove', onMouseMove)
document.body.addEventListener('click', onMouseClick)
window.addEventListener('resize', onResize)
requestAnimationFrame(updateFrame)

function initializeNavNodes() {
  const projectsNode = new View(gl, {
    ...viewGeoPartialProps,
    name: 'projects',
  })
  projectsNode.loadThumbnail()
  projectsNode.visible = false
  projectsNode.setParent(boxesRootNode)

  const aboutNode = new View(gl, { ...viewGeoPartialProps, name: 'about' })
  aboutNode.visible = false
  aboutNode.setParent(boxesRootNode).loadThumbnail()

  const contactNode = new View(gl, {
    ...viewGeoPartialProps,
    name: 'contact',
  })
  contactNode.visible = false
  contactNode.setParent(boxesRootNode).loadThumbnail()

  const blogNode = new View(gl, {
    ...viewGeoPartialProps,
    name: 'blog',
    externalURL: 'https://archive.georgi-nikolov.com/',
  })
  blogNode.visible = false
  blogNode.setParent(boxesRootNode).loadThumbnail()

  const profilePicNode = new View(gl, {
    ...viewGeoPartialProps,
    interactable: false,
    name: 'profile-pic',
  })
  promisifiedLoadImage(profilePicURL).then((image) => {
    profilePicNode.loadThumbnail(image)
  })
  profilePicNode.visible = false
  profilePicNode.setParent(aboutNode)

  const nameNode = new View(gl, {
    ...viewGeoPartialProps,
    interactable: false,
    name: 'personal-name',
  })
  nameNode.loadThumbnail(aboutSectionTwoLineCanvas('name', 'Georgi', 'Nikolov'))
  nameNode.visible = false
  nameNode.setParent(aboutNode)

  const jobTitleNode = new View(gl, {
    ...viewGeoPartialProps,
    interactable: false,
    name: 'job-title',
  })
  jobTitleNode.loadThumbnail(
    aboutSectionTwoLineCanvas('job title', 'Frontend', 'Developer'),
  )
  jobTitleNode.visible = false
  jobTitleNode.setParent(aboutNode)

  const currentCountryNode = new View(gl, {
    ...viewGeoPartialProps,
    interactable: false,
    name: 'current-country',
  })
  currentCountryNode.loadThumbnail(
    aboutSectionTwoLineCanvas('lives in', 'Berlin', 'Germany'),
  )
  currentCountryNode.visible = false
  currentCountryNode.setParent(aboutNode)

  const fromCountryNode = new View(gl, {
    ...viewGeoPartialProps,
    interactable: false,
    name: 'from-country',
  })
  fromCountryNode.loadThumbnail(
    aboutSectionTwoLineCanvas('from', 'Sofia', 'Bulgaria'),
  )
  fromCountryNode.visible = false
  fromCountryNode.setParent(aboutNode)

  const currentWorkNode = new View(gl, {
    ...viewGeoPartialProps,
    interactable: false,
    name: 'current-work',
  })
  currentWorkNode.loadThumbnail(
    aboutSectionMultilineCanvas('position', ['Freelancer', 'AWWWARDS Jury']),
  )
  currentWorkNode.visible = false
  currentWorkNode.setParent(aboutNode)

  const skillsNode = new View(gl, {
    ...viewGeoPartialProps,
    interactable: false,
    name: 'skills',
  })
  skillsNode.loadThumbnail(
    aboutSectionMultilineCanvas('skills', [
      'Typescript',
      'WebGL WebGPU',
      'GLSL React Node.js',
    ]),
  )
  skillsNode.visible = false
  skillsNode.setParent(aboutNode)

  const techNode = new View(gl, {
    ...viewGeoPartialProps,
    interactable: false,
    name: 'website-tech',
  })
  techNode.loadThumbnail(
    aboutSectionMultilineCanvas('this site runs on', [
      'hwoa-rang-gl2',
      'hwoa-rang-tween',
      'gl-matrix redux',
    ]),
  )
  techNode.visible = false
  techNode.setParent(aboutNode)

  const twitterNode = new View(gl, {
    ...viewGeoPartialProps,
    name: 'twitter',
    externalURL: 'https://twitter.com/georgiNikoloff',
  })
  twitterNode.visible = false
  twitterNode.setParent(contactNode).loadThumbnail()

  const githubNode = new View(gl, {
    ...viewGeoPartialProps,
    name: 'github',
    externalURL: 'https://github.com/gnikoloff',
  })
  githubNode.visible = false
  githubNode.setParent(contactNode).loadThumbnail()

  const codepenNode = new View(gl, {
    ...viewGeoPartialProps,
    name: 'codepen',
    externalURL: 'https://codepen.io/gbnikolov',
  })
  codepenNode.visible = false
  codepenNode.setParent(contactNode).loadThumbnail()

  const mailNode = new View(gl, {
    ...viewGeoPartialProps,
    name: 'mail',
    externalURL: 'mailto:connect@georgi-nikolov.com',
  })
  mailNode.visible = false
  mailNode.setParent(contactNode).loadThumbnail()
}

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
    const line = new Line(gl, rayStart, rayEnd)
    line.setParent(debugLinesNode)
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

    hitView = oldView.parentNode as View

    toggleChildrenRowVisibility({
      node: oldView,
      visible: false,
    })
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
        : -rowHeight / 2 - LAYOUT_LEVEL_Y_OFFSET * levelIndex + CUBE_HEIGHT
    const newZ = CAMERA_BASE_Z_OFFSET + levelIndex * CAMERA_LEVEL_Z_OFFSET

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
    // debugger
    if (hitView.open) {
      store.dispatch(setIsCurrentlyTransitionViews(false))
      return
    }
    // console.log('hit')
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
      positionTweenDurationMS: 600,
      positionTweenEaseName: 'quad_InOut',
      lookAtTweenDurationMS: 900,
      lookAtTweenEaseName: 'quad_In',
    })
    prevView = hitView
    // prevView.hover = false
    store.dispatch(setActiveItemUID(hitView.uid))
    store.dispatch(setIsCurrentlyTransitionViews(false))
    return
  }

  const activeLevelIdx = hitView.levelIndex - 2
  const prevLevelIdx = oldView ? oldView.levelIndex - 2 : 0
  const levelDiff = activeLevelIdx - prevLevelIdx

  let levelOffset = 0
  let isParentActiveUID = false

  if (levelDiff === 0) {
    hitView.open = hitView === oldView ? !hitView.open : true

    if (hitView === oldView) {
      toggleChildrenRowVisibility({
        node: hitView,
        visible: hitView.open,
      })
    } else {
      hitView.open = true
      if (oldView) {
        if (oldView.open) {
          toggleChildrenRowVisibility({
            node: oldView,
            visible: false,
          })
        } else {
          toggleChildrenRowVisibility({
            node: oldView,
            visible: false,
          })
        }
        oldView.open = false
      }
      toggleChildrenRowVisibility({
        node: hitView,
        visible: true,
      })
    }
  } else if (levelDiff > 0) {
    hitView.open = true
    if (prevView) {
      prevView.open = false
    }
    toggleChildrenRowVisibility({
      node: hitView,
      visible: hitView.open,
    })
  } else if (levelDiff < 0) {
    hitView.open = !!hitView.findChild((child) => child === prevView)
    if (prevView) {
      prevView.open = false
      levelOffset = hitView.findChild((child) => child.uid === prevView.uid)
        ? 0
        : 1

      if (
        prevView.project &&
        !hitView.project &&
        prevView.parentNode === hitView
      ) {
        // hitView = hitView.parentNode as View
        levelOffset = -1
        isParentActiveUID = true
      }
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
    await toggleChildrenRowVisibility({
      node: viewsToClose,
      visible: false,
    })
    const prevSameLevelParent = oldView?.findParent(
      (parent) => parent.levelIndex === hitView.levelIndex,
    )
    toggleChildrenRowVisibility({
      node: hitView,
      visible: hitView !== prevSameLevelParent,
    })
  }
  // console.log('----- end')

  const levelIndex = hitView.levelIndex - 2 + (hitView.open ? 1 : 0)

  const rowHeight =
    levelOffset === -1
      ? childrenRowHeights[(hitView.parentNode as View).uid]
      : levelOffset === 1
      ? childrenRowHeights[hitView.uid]
      : hitView.open
      ? childrenRowHeights[hitView.uid]
      : childrenRowHeights[(hitView.parentNode as View).uid]

  const newY =
    levelIndex === 0
      ? 0
      : -rowHeight / 2 -
        LAYOUT_LEVEL_Y_OFFSET * (levelIndex + levelOffset) +
        CUBE_HEIGHT
  const newZ =
    CAMERA_BASE_Z_OFFSET + (levelIndex + levelOffset) * CAMERA_LEVEL_Z_OFFSET

  // console.log(levelIndex, hitView.open)

  tweenCameraToPosition({
    newX: 0,
    newY,
    newZ,
    newLookAtX: 0,
    newLookAtY: newY,
    newLookAtZ: -100,
  })

  console.log({ isParentActiveUID })
  if (isParentActiveUID) {
    hitView = hitView.parentNode as View
  }
  prevView = hitView
  store.dispatch(
    setActiveItemUID(
      isParentActiveUID ? (hitView.parentNode as View).uid : hitView.uid,
    ),
  )
  store.dispatch(setIsCurrentlyTransitionViews(false))
}

function updateFrame(ts: DOMHighResTimeStamp) {
  ts *= 0.001
  const dt = Math.min(ts - oldTime, 1)
  oldTime = ts

  requestAnimationFrame(updateFrame)

  const {
    ui: { mousePos, activeItemUID, showCubeHighlight },
  } = store.getState()

  const normX = (mousePos[0] / innerWidth) * 2 - 1
  const normY = 2 - (mousePos[1] / innerHeight) * 2 - 1
  const { rayStart, rayDirection } = projectMouseToWorldSpace(
    [normX, normY],
    OPTIONS.cameraFreeMode ? freeOrbitCamera : perspectiveCamera,
  )

  const [hitView, isOpenLink] = getHoveredSceneNode(rayStart, rayDirection)

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

  if (hitView && hitView.uid !== activeItemUID && showCubeHighlight) {
    store.dispatch(setIsHovering(true))
  } else {
    if (hitView && !hitView.project && showCubeHighlight) {
      store.dispatch(setIsHovering(true))
    } else {
      store.dispatch(setIsHovering(hitView && hitView.open && isOpenLink))
    }
  }

  // update camera
  const camHoverMoveRadius = hitView && hitView.project ? 1 : 3
  camMoveRadius += (camHoverMoveRadius - camMoveRadius) * dt

  const mx = (mousePos[0] / innerWidth - 0.5) * camMoveRadius
  const my = (1.0 - mousePos[1] / innerHeight - 0.5) * camMoveRadius
  const speed = dt * 2
  const x = mx + -mx * speed
  const y = my + -my * speed
  const z = 0
  const tx = cameraPositionOffset[0] + x
  const ty = cameraPositionOffset[1] + y
  const tz = cameraPositionOffset[2] + z
  perspectiveCamera.position[0] += (tx - perspectiveCamera.position[0]) * speed
  perspectiveCamera.position[1] += (ty - perspectiveCamera.position[1]) * speed
  perspectiveCamera.position[2] += (tz - perspectiveCamera.position[2]) * speed

  perspectiveCamera.lookAt[0] = 0
  perspectiveCamera.lookAt[1] = cameraLookAtOffset[1]
  perspectiveCamera.lookAt[2] = 0
  perspectiveCamera.updateViewMatrix().updateProjectionViewMatrix()

  freeOrbitCamera.updateViewMatrix().updateProjectionViewMatrix()

  // UBO for shared uniforms across all meshes with persp camera
  if (sharedUBO) {
    const viewMatrix = OPTIONS.cameraFreeMode
      ? freeOrbitCamera.viewMatrix
      : perspectiveCamera.viewMatrix
    const projViewMatix = OPTIONS.cameraFreeMode
      ? freeOrbitCamera.projectionViewMatrix
      : perspectiveCamera.projectionViewMatrix
    gl.bindBuffer(gl.UNIFORM_BUFFER, sharedUBO)

    // time
    timeAsFloat32[0] = ts
    gl.bufferSubData(
      gl.UNIFORM_BUFFER,
      sharedUBOBlockInfo.uniforms.time.offset,
      timeAsFloat32,
      0,
    )

    // view matrix
    gl.bufferSubData(
      gl.UNIFORM_BUFFER,
      sharedUBOBlockInfo.uniforms.viewMatrix.offset,
      viewMatrix as ArrayBufferView,
      0,
    )

    // projection + view matrix
    gl.bufferSubData(
      gl.UNIFORM_BUFFER,
      sharedUBOBlockInfo.uniforms.projectionViewMatrix.offset,
      projViewMatix as ArrayBufferView,
      0,
    )
  }

  gl.bindBuffer(gl.UNIFORM_BUFFER, null)

  gl.enable(gl.DEPTH_TEST)
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

  // gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferInfo.framebuffer)
  gl.clearColor(...BACKGROUND_COLOR)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  if (OPTIONS.cameraFreeMode) {
    cameraDebugger.preRender(freeOrbitCamera).render()
  }

  if (sharedUBO) {
    floor.render()
    rootNode.render()
  }

  debugLinesNode.render()
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

async function toggleChildrenRowVisibility({
  node,
  visible,
  durationMS = TRANSITION_ROW_DURATION,
  easeName = TRANSITION_ROW_EASE,
}: RowTransitionProps) {
  const views = Array.isArray(node) ? node : node.children
  for (let i = 0; i < views.length; i++) {
    const child = views[i]
    child.loadThumbnail()
    if (visible) {
      child.visible = true
    }
    child.tweenAnimMode = visible ? 0 : 1
  }
  let childTweenStaggerMS = 0
  if (visible) {
    if (views.length < 4) {
      childTweenStaggerMS = 130
    } else if (views.length < 4) {
      childTweenStaggerMS = 100
    } else {
      childTweenStaggerMS = 75
    }
  }
  return await Promise.all(
    views.map((child, i): Promise<null> => {
      return new Promise((resolve) => {
        const childTweenID = child.uid
        let tween: Tween | undefined
        if ((tween = activeTweens.get(childTweenID))) {
          tween.stop()
          activeTweens.delete(childTweenID)
        }
        tween = new Tween({
          durationMS,
          delayMS:
            TRANSITION_ROW_DELAY + (visible ? i * childTweenStaggerMS : 0),
          easeName,
          onUpdate: (v) => {
            child.visibilityTweenFactor = visible ? v : 1 - v
          },
          onComplete: () => {
            if (!visible) {
              views[i].visible = false
            }
            activeTweens.delete(childTweenID)

            resolve(null)
          },
        }).start()
        activeTweens.set(childTweenID, tween)
      })
    }),
  )
}

async function tweenCameraToPosition({
  newX,
  newY,
  newZ,
  positionDelayMS = 0,
  positionTweenDurationMS = TRANSITION_CAMERA_POSITION_DURATION,
  positionTweenEaseName = TRANSITION_CAMERA_POSITION_EASE,
  newLookAtX = newX,
  newLookAtY = newY,
  newLookAtZ = newZ - 100,
  lookAtDelayMS = 0,
  lookAtTweenDurationMS = TRANSITION_CAMERA_LOOKAT_DURATION,
  lookAtTweenEaseName = TRANSITION_CAMERA_LOOKAT_EASE,
}: CameraTransitionProps) {
  const posTweenID = 'camera-pos'
  let posTween: Tween | undefined
  if ((posTween = activeTweens.get(posTweenID))) {
    posTween.stop()
    activeTweens.delete(posTweenID)
  }
  posTween = new Tween({
    durationMS: positionTweenDurationMS,
    delayMS: positionDelayMS,
    easeName: positionTweenEaseName,
    onUpdate: (v) => {
      cameraPositionOffset[0] += (newX - cameraPositionOffset[0]) * v
      cameraPositionOffset[1] += (newY - cameraPositionOffset[1]) * v
      cameraPositionOffset[2] += (newZ - cameraPositionOffset[2]) * v

      // perspectiveCamera.updateViewMatrix().updateProjectionViewMatrix()
    },
    onComplete: () => {
      activeTweens.delete(posTweenID)
    },
  })
  activeTweens.set(posTweenID, posTween)

  const lookAtTweenID = 'camera-look-at'
  let lookAtTween: Tween | undefined
  if ((lookAtTween = activeTweens.get(lookAtTweenID))) {
    lookAtTween.stop()
    activeTweens.delete(lookAtTweenID)
  }
  lookAtTween = new Tween({
    durationMS: lookAtTweenDurationMS,
    delayMS: lookAtDelayMS,
    easeName: lookAtTweenEaseName,
    onUpdate: (v) => {
      cameraLookAtOffset[0] += (newLookAtX - cameraLookAtOffset[0]) * v
      cameraLookAtOffset[1] += (newLookAtY - cameraLookAtOffset[1]) * v
      cameraLookAtOffset[2] += (newLookAtZ - cameraLookAtOffset[2]) * v

      // perspectiveCamera.updateViewMatrix().updateProjectionViewMatrix()
    },
  })
  activeTweens.set(lookAtTweenID, lookAtTween)

  return Promise.all([posTween.start(), lookAtTween.start()])
}

function positionNodeWithinLevel(
  node: SceneNode,
  idx: number,
  levelIdx: number,
): vec3 {
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

function onResize() {
  perspectiveCamera.aspect = innerWidth / innerHeight
  perspectiveCamera.updateProjectionMatrix()
  sizeCanvas()
}

function sizeCanvas() {
  $canvas.width = innerWidth * devicePixelRatio
  $canvas.height = innerHeight * devicePixelRatio
  $canvas.style.setProperty('width', `${innerWidth}px`)
  $canvas.style.setProperty('height', `${innerHeight}px`)
}
