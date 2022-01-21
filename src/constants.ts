import { easeType } from './lib/hwoa-rang-anim/dist'

export const API_ENDPOINT = 'http://192.168.2.123:3001/api'

export const LAYOUT_COLUMN_MAX_WIDTH = 14
export const LAYOUT_ITEMS_PER_ROW = 4
export const LAYOUT_LEVEL_Y_OFFSET = 5
export const LAYOUT_LEVEL_Z_OFFSET = 5

export const CAMERA_LEVEL_Z_OFFSET = 5

export const CUBE_WIDTH = (LAYOUT_COLUMN_MAX_WIDTH / 4) * 0.9
export const CUBE_HEIGHT = 2
export const CUBE_DEPTH = 0.2

export const LABEL_WIDTH = CUBE_WIDTH
export const LABEL_HEIGHT = 0.4
export const LABEL_MARGIN_Y = 0.1
export const LABEL_MARGIN_Z = 0.1

export const CAMERA_NEAR = 0.1
export const CAMERA_FAR = 30
export const CAMERA_FOCUS_OFFSET_Z = 5

export const TRANSITION_CAMERA_DURATION = 759
export const TRANSITION_CAMERA_EASE: easeType = 'exp_Out'
export const TRANSITION_ROW_DURATION = 750
export const TRANSITION_ROW_DELAY = 150
export const TRANSITION_ROW_EASE: easeType = 'exp_Out'
