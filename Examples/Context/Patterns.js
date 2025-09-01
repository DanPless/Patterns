
(function() {
  const split = document.getElementById('split');
  const gutter = document.getElementById('split-gutter');
  const topPane = document.getElementById('pane-top');
  const bottomPane = document.getElementById('pane-bottom');

  if (!split || !gutter || !topPane || !bottomPane) return;

  function clamp(v, min, max){ return Math.min(max, Math.max(min, v)); }

  function gutterHeight(){
    const h = gutter.offsetHeight;
    return (h && h > 0) ? h : 6;
  }

  function availableHeight() {
    const rect = split.getBoundingClientRect();
    const footer = document.querySelector('.pager--sticky');
    const footerH = footer ? footer.getBoundingClientRect().height : 0;
    return Math.max(100, window.innerHeight - rect.top - footerH);
  }

  function layoutDefault() {
    const avail = availableHeight();
    split.style.height = avail + 'px';

    const gH = gutterHeight();
    const naturalTop = topPane.scrollHeight; // show all top by default if possible

    let topH = Math.min(naturalTop, avail - gH); // bottom starts at 0
    topH = clamp(topH, 0, avail - gH);

    split.style.gridTemplateRows = topH + 'px ' + gH + 'px ' + (avail - gH - topH) + 'px';
  }

  function startDrag(e) {
    e.preventDefault();
    const startY = (e.touches ? e.touches[0].clientY : e.clientY);
    const total = split.clientHeight;
    const gH = gutterHeight();
    const startTop = topPane.offsetHeight;

    function onMove(ev) {
      const y = (ev.touches ? ev.touches[0].clientY : ev.clientY);
      const dy = y - startY;
      const newTop = Math.min(total - gH, Math.max(0, startTop + dy));
      split.style.gridTemplateRows = newTop + 'px ' + gH + 'px ' + (total - gH - newTop) + 'px';
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, {passive:false});
    window.addEventListener('touchend', onUp);
  }

  function onGutterKey(e) {
    const total = split.clientHeight;
    const gH = gutterHeight();
    const rows = getComputedStyle(split).gridTemplateRows.split(' ');
    const topPx = parseFloat(rows[0]);
    const step = (e.shiftKey ? 40 : 10);
    let newTop = topPx;
    if (e.key === 'ArrowUp') newTop -= step;
    else if (e.key === 'ArrowDown') newTop += step;
    else return;
    e.preventDefault();
    newTop = Math.min(total - gH, Math.max(0, newTop));
    split.style.gridTemplateRows = newTop + 'px ' + gH + 'px ' + (total - gH - newTop) + 'px';
  }

  function relayout() { layoutDefault(); }
  window.addEventListener('resize', relayout);
  window.addEventListener('load', relayout);
  setTimeout(relayout, 0);
  setTimeout(relayout, 50);

  gutter.addEventListener('mousedown', startDrag);
  gutter.addEventListener('touchstart', startDrag, {passive:false});
  gutter.addEventListener('keydown', onGutterKey);
})();
