function startTimer(seconds, onTick, onEnd){
  let t = seconds;
  onTick?.(t);
  const id = setInterval(()=>{
    t -= 1;
    onTick?.(t);
    if (t <= 0){ clearInterval(id); onEnd?.(); }
  },1000);
  return ()=>clearInterval(id);
}
window.XTimer = { startTimer };
