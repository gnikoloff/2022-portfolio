import { vec2, vec3 } from 'gl-matrix'
import { Dispatch } from 'redux'
import { CombinedState } from '.'
import { ActionPayload } from '../types'

const SET_MOUSE_POS = 'ui/SET_MOUSE_POS'
const SET_IS_HOVERING = 'ui/SET_IS_HOVERING'

export interface UIState {
  boxSize: vec3
  mousePos: vec2
  isDisplayCursor: boolean
  showChildrenRow: boolean
}

const initialState = {
  boxSize: [2, 1.2, 1.2],
  mousePos: [-1000, -1000],
  isDisplayCursor: false,
  showChildrenRow: true,
}

const views = (state = initialState, action: ActionPayload) => {
  switch (action.type) {
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
    default: {
      return state
    }
  }
}

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

export default views
