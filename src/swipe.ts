function detectSwipe(element: HTMLElement, callback: (direction: "up" | "down" | "left" | "right", evt: TouchEvent) => void) {
  element.addEventListener('touchstart', handleTouchStart, false);
  element.addEventListener('touchmove', handleTouchMove, false);

  var xDown: number = null;
  var yDown: number = null;

  function getTouches(evt: TouchEvent) {
    return evt.touches;
  }

  function handleTouchStart(evt: TouchEvent) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
  }

  function handleTouchMove(evt: TouchEvent) {
    if (!xDown || !yDown || evt.touches.length > 1) {
      return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
      if (xDiff > 0) {
        /* left swipe */
        callback("left", evt);
      } else {
        /* right swipe */
        callback("right", evt);
      }
    } else {
      if (yDiff > 0) {
        /* up swipe */
        callback("up", evt);
      } else {
        /* down swipe */
        callback("down", evt);
      }
    }
    /* reset values */
    xDown = null;
    yDown = null;
  }
}