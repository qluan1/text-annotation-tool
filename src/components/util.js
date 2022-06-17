import {useState, useRef} from 'react';

function getPixelRate() {
    let ctx = document.createElement("canvas").getContext("2d"),
    dpr = window.devicePixelRatio || 1,
    bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;
    return dpr / bsr;
}

function initializeHiPPICanvasProps (can, w, h, ratio) {
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + 'px';
    can.style.height = h + 'px';
    let context = can.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    return context;
}

function getViewport() {

    let viewPortWidth;
    let viewPortHeight;
   
    // the more standards compliant browsers 
    // (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
    if (typeof window.innerWidth != 'undefined') {
      viewPortWidth = window.innerWidth,
      viewPortHeight = window.innerHeight
    }
   
   // IE6 in standards compliant mode 
   // (i.e. with a valid doctype as the first line in the document)
    else if (typeof document.documentElement != 'undefined'
    && typeof document.documentElement.clientWidth !=
    'undefined' && document.documentElement.clientWidth != 0) {
       viewPortWidth = document.documentElement.clientWidth,
       viewPortHeight = document.documentElement.clientHeight
    }
   
    // older versions of IE
    else {
      viewPortWidth = document.getElementsByTagName('body')[0].clientWidth,
      viewPortHeight = document.getElementsByTagName('body')[0].clientHeight
    }
    return [viewPortWidth, viewPortHeight];
}

function handleMouseEdgeScrollOnElement(event, target, edge, step, timer) {
    let vpX = event.clientX;
    let vpY = event.clientY;
    let bdb = target.getBoundingClientRect();
    
    let isInLeftEdge = (vpX < bdb.left + edge);
    let isInTopEdge = (vpY < bdb.top + edge);
    let isInRightEdge = (vpX > bdb.right - edge);
    let isInBottomEdge = (vpY > bdb.bottom - edge);

    if ( ! ( isInLeftEdge || isInRightEdge || isInTopEdge || isInBottomEdge ) ) {

        clearTimeout( timer );
        return;
  
    }
    
    let targetWidth = Math.max(
        target.scrollWidth,
        target.offsetWidth,
        target.clientWidth
    );

    let targetHeight = Math.max(
        target.scrollHeight,
        target.offsetHeight,
        target.clientHeight
    );

    let maxScrollX = Math.round( targetWidth - bdb.right + bdb.left );
    let maxScrollY = Math.round( targetHeight - bdb.bottom + bdb.top );
    
    (function checkForElementScroll() {
        clearTimeout( timer );
        if ( adjustElementScroll() ) {
            timer = setTimeout( checkForElementScroll, 50 );
        }
  
    })();    

    function adjustElementScroll() {
        let currentScrollX = target.scrollLeft;
        let currentScrollY = target.scrollTop;

        let canScrollUp = (currentScrollY > 0);
        let canScrollDown = (currentScrollY < maxScrollY);
        let canScrollLeft = (currentScrollX > 0);
        let canScrollRight = (currentScrollX < maxScrollX);

        let nextScrollX = currentScrollX;
        let nextScrollY = currentScrollY;

        nextScrollX = (isInLeftEdge && canScrollLeft)? nextScrollX - step: nextScrollX;
        nextScrollX = (isInRightEdge && canScrollRight)? nextScrollX + step: nextScrollX;
        nextScrollY = (isInTopEdge && canScrollUp)? nextScrollY - step: nextScrollY;
        nextScrollY = (isInBottomEdge && canScrollDown)? nextScrollY + step: nextScrollY;

        nextScrollX = Math.max( 0, Math.min( maxScrollX, nextScrollX ) ); // sanity check
        nextScrollY = Math.max( 0, Math.min( maxScrollY, nextScrollY ) );

        if (
            ( nextScrollX !== currentScrollX ) ||
            ( nextScrollY !== currentScrollY )
            ) {

            target.scrollTo( nextScrollX, nextScrollY );
            return( true );

        } else {
            return( false );
        }              
    }
}


function handleMouseEdgeScroll(event, edge, step, timer) {
  let vpX = event.clientX;
  let vpY = event.clientY;
  let [vpw, vph] = getViewport();

  // get edge boundaries
  let edgeTop = edge;
  let edgeLeft = edge;
  let edgeBottom = (vph - edge);
  let edgeRight = (vpw - edge);

  let isInLeftEdge = (vpX < edgeLeft);
  let isInTopEdge = (vpY < edgeTop);
  let isInRightEdge = (vpX > edgeRight);
  let isInBottomEdge = (vpY > edgeBottom);

  if ( ! ( isInLeftEdge || isInRightEdge || isInTopEdge || isInBottomEdge ) ) {

      clearTimeout( timer );
      return;

  }

  let documentWidth = Math.max(
      document.body.scrollWidth,
      document.body.offsetWidth,
      document.body.clientWidth,
      document.documentElement.scrollWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
  );
  let documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.body.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
  );
  
  let maxScrollX = ( documentWidth - vpw );
  let maxScrollY = ( documentHeight - vph );

  (function checkForWindowScroll() {

      clearTimeout( timer );

      if ( adjustWindowScroll() ) {

          timer = setTimeout( checkForWindowScroll, 30 );

      }

  })();

    function adjustWindowScroll() {
        let currentScrollX = window.pageXOffset;
        let currentScrollY = window.pageYOffset;

        let canScrollUp = (currentScrollY > 0);
        let canScrollDown = (currentScrollY < maxScrollY);
        let canScrollLeft = (currentScrollX > 0);
        let canScrollRight = (currentScrollX < maxScrollX);

        let nextScrollX = currentScrollX;
        let nextScrollY = currentScrollY;

        nextScrollX = (isInLeftEdge && canScrollLeft)? nextScrollX - step: nextScrollX;
        nextScrollX = (isInRightEdge && canScrollRight)? nextScrollX + step: nextScrollX;
        nextScrollY = (isInTopEdge && canScrollUp)? nextScrollY - step: nextScrollY;
        nextScrollY = (isInBottomEdge && canScrollDown)? nextScrollY + step: nextScrollY;

        nextScrollX = Math.max( 0, Math.min( maxScrollX, nextScrollX ) ); // sanity check
        nextScrollY = Math.max( 0, Math.min( maxScrollY, nextScrollY ) );

        if (
            ( nextScrollX !== currentScrollX ) ||
            ( nextScrollY !== currentScrollY )
            ) {

            window.scrollTo( nextScrollX, nextScrollY );
            return( true );

        } else {

            return( false );

        }            
    }
}

function useStateRef(initVal) {
  let [val, setVal] = useState(initVal);
  const valRef = useRef(null);
  valRef.current = val;
  return [val, setVal, valRef];
}


function copyDisplaySettings(ds) {
    let nds = {};
    nds.fontSize = ds.fontSize;
    nds.fontFamily = ds.fontFamily;
    nds.padding = ds.padding;
    nds.charGap = ds.charGap;
    nds.lineGap = ds.lineGap;
    nds.labelFontSize = ds.labelFontSize;
    nds.labelFontFamily = ds.labelFontFamily;
    nds.labelGap = ds.labelGap;
    return nds;
}

export {
  getPixelRate, 
  initializeHiPPICanvasProps, 
  getViewport, 
  handleMouseEdgeScroll,
  handleMouseEdgeScrollOnElement,
  useStateRef,
  copyDisplaySettings
};