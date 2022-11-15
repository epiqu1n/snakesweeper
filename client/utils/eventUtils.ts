import { MouseEvent } from 'react';

/*
  0: Primary button (usually the left button)
  1: Secondary button (usually the right button)
  2: Auxiliary button (usually the mouse wheel button or middle button)
  3: 4th button (typically the "Browser Back" button)
  4 : 5th button (typically the "Browser Forward" button)
*/
export enum ClickTypeBase {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2
}

/*
  0: No button or un-initialized
  1: Primary button (usually the left button)
  2: Secondary button (usually the right button)
  4: Auxiliary button (usually the mouse wheel button or middle button)
  8: 4th button (typically the "Browser Back" button)
  16 : 5th button (typically the "Browser Forward" button)
*/
export enum ClickTypeMulti {
  NONE = 0,
  LEFT = 1,
  RIGHT = 2,
  LEFT_RIGHT = 3,
  MIDDLE = 4,
  LEFT_MIDDLE = 5,
  RIGHT_MIDDLE = 6,
  LEFT_RIGHT_MIDDLE = 7
}

interface CompleteClickHandler {
  (
    /** The single button associated with an event */
    button: ClickTypeBase,
    /** The highest combination of buttons that were held during a full mouse click */
    maxButtons: ClickTypeMulti
  ): void
};

/** Handles mouse clicks with multiple buttons */
export class MulticlickHandler {
  private maxButtonsHeld = 0;

  /**
   * Handles a click event
   * @param onCompleteClick Fires when all mouse buttons have been released
   */
  handleClick(event: globalThis.MouseEvent, onCompleteClick: CompleteClickHandler) {
    switch (event.type) {
      case 'mousedown':
        this.maxButtonsHeld = Math.max(event.buttons, this.maxButtonsHeld);
        break;
      case 'mouseup':
        if (event.buttons === 0) {
          if (typeof onCompleteClick === 'function') onCompleteClick(event.button, this.maxButtonsHeld);
          this.maxButtonsHeld = 0;
        }
        break;
    }
  }
}