import { easeType } from './lib/hwoa-rang-anim'

export const API_ENDPOINT = 'http://192.168.2.123:3001/api'

export const BASE_PAGE_TITLE = document.title

export const BACKGROUND_COLOR: [number, number, number, number] = [
  0.1, 0.1, 0.1, 1,
]
export const BACKGROUND_COLOR_GLSL = `vec4(${BACKGROUND_COLOR.join(',')})`
export const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'

export const LAYOUT_COLUMN_MAX_WIDTH = 14
export const LAYOUT_ITEMS_PER_ROW = 4
export const LAYOUT_LEVEL_Y_OFFSET = 9
export const LAYOUT_LEVEL_Z_OFFSET = 5

export const CUBE_WIDTH = 3
export const CUBE_HEIGHT = 2
export const CUBE_DEPTH = 0.2

export const LABEL_WIDTH = CUBE_WIDTH
export const LABEL_HEIGHT = 0.4
export const LABEL_MARGIN_Y = 0.1
export const LABEL_MARGIN_Z = 0.1

export const OPEN_BUTTON_WIDTH = 0.6
export const OPEN_BUTTON_HEIGHT = 0.4
export const OPEN_BUTTON_MARGIN_Y = 0.3
export const OPEN_BUTTON_MARGIN_Z = 0.3

export const CAMERA_NEAR = 0.1
export const CAMERA_FAR = 60
export const CAMERA_FOCUS_OFFSET_Z = 5
export const CAMERA_BASE_Z_OFFSET = 8
export const CAMERA_LEVEL_Z_OFFSET = 5

export const TRANSITION_CAMERA_POSITION_DURATION = 700
export const TRANSITION_CAMERA_POSITION_EASE: easeType = 'exp_InOut'
export const TRANSITION_CAMERA_LOOKAT_DURATION = 1500
export const TRANSITION_CAMERA_LOOKAT_EASE: easeType = 'quad_Out'
export const TRANSITION_ROW_DURATION = 1000
export const TRANSITION_ROW_DELAY = 150
export const TRANSITION_ROW_EASE: easeType = 'exp_Out'
export const TRANSITION_LOAD_IMAGE_DURATION = 400
