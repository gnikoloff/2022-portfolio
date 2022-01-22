import { vec2 } from 'gl-matrix'
import { Dispatch } from 'redux'
import { CombinedState } from '.'
import { ActionPayload } from '../interfaces'

const SET_ACTIVE_ITEM_UID = 'ui/SET_ACTIVE_ITEM_UID'
const SET_ACTIVE_LEVEL_IDX = 'ui/SET_ACTIVE_LEVEL_IDX'
const SET_MOUSE_POS = 'ui/SET_MOUSE_POS'
const SET_IS_HOVERING = 'ui/SET_IS_HOVERING'
const SET_SHOW_CUBE_HIGHLIGHT = 'ui/SET_SHOW_CUBE_HIGHLIGHT'
const SET_IS_CURRENTLY_TRANSITIONING_VIEW =
  'ui/SET_IS_CURRENTLY_TRANSITIONING_VIEW'

export interface UIState {
  activeItemUID: string | null
  activeLevelIdx: number
  mousePos: vec2
  isHovering: boolean
  isDisplayCursor: boolean
  isCurrentlyTransitionViews: false
  showCubeHighlight: boolean
}

const initialState = {
  activeItemUID: null,
  activeLevelIdx: -1,
  mousePos: [-1000, -1000],
  isHovering: false,
  isDisplayCursor: false,
  isCurrentlyTransitionViews: false,
  showCubeHighlight: true,
}

const views = (state = initialState, action: ActionPayload) => {
  switch (action.type) {
    case SET_ACTIVE_ITEM_UID: {
      return {
        ...state,
        activeItemUID: action.payload,
      }
    }
    case SET_ACTIVE_LEVEL_IDX: {
      return {
        ...state,
        activeLevelIdx: action.payload,
      }
    }
    case SET_MOUSE_POS: {
      return {
        ...state,
        mousePos: action.payload,
      }
    }
    case SET_IS_HOVERING: {
      return {
        ...state,
        isHovering: action.payload,
      }
    }
    case SET_SHOW_CUBE_HIGHLIGHT: {
      return {
        ...state,
        showCubeHighlight: action.payload,
      }
    }
    case SET_IS_CURRENTLY_TRANSITIONING_VIEW: {
      return {
        ...state,
        isCurrentlyTransitionViews: action.payload,
      }
    }
    default: {
      return state
    }
  }
}

export const setActiveItemUID = (activeItemUID: string) => ({
  type: SET_ACTIVE_ITEM_UID,
  payload: activeItemUID,
})

export const setActiveLevelIdx = (activeLevelIdx: number) => ({
  type: SET_ACTIVE_LEVEL_IDX,
  payload: activeLevelIdx,
})

export const setMousePos = (mousePos: vec2) => ({
  type: SET_MOUSE_POS,
  payload: mousePos,
})

export const setIsHovering =
  (isHovering: boolean) =>
  (dispatch: Dispatch, getState: () => CombinedState) => {
    const {
      ui: { isHovering: isHoveringOld },
    } = getState()
    if (isHovering !== isHoveringOld) {
      if (isHovering) {
        document.body.classList.add('hover')
        // debugger
      } else {
        document.body.classList.remove('hover')
      }
    }
    dispatch({ type: SET_IS_HOVERING, payload: isHovering })
  }

export const setShowCubeHighlight = (showCubeHighlight: boolean) => ({
  type: SET_SHOW_CUBE_HIGHLIGHT,
  payload: showCubeHighlight,
})

export const setIsCurrentlyTransitionViews = (
  isCurrentlyTransitionViews: boolean,
) => ({
  type: SET_IS_CURRENTLY_TRANSITIONING_VIEW,
  payload: isCurrentlyTransitionViews,
})

export default views
