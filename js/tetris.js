(() => {
  const canvas = document.getElementById('tetrisCanvas');
  const ctx = canvas.getContext('2d');
  const cols = 10, rows = 20, cell = 30;
  const colors = [null, '#00e5ff', '#356bff', '#ff9f1c', '#ffe600', '#43e65b', '#b84dff', '#ff4d69'];
  const shapes = [
    [],
    [[1,1,1,1]],
    [[1,0,0],[1,1,1]],
    [[0,0,1],[1,1,1]],
    [[1,1],[1,1]],
    [[0,1,1],[1,1,0]],
    [[0,1,0],[1,1,1]],
    [[1,1,0],[0,1,1]]
  ];
  let board, piece, score, lines, level, running, over, lastTime, dropCounter, animation;
  const scoreEl = document.getElementById('tetrisPunts');
  const linesEl = document.getElementById('tetrisLinies');
  const levelEl = document.getElementById('tetrisNivell');
  const message = document.getElementById('tetrisMissatge');
  function emptyBoard() { return Array.from({length: rows}, () => Array(cols).fill(0)); }
  function newPiece() {
    const type = 1 + Math.floor(Math.random() * 7);
    const matrix = shapes[type].map(row => row.slice());
    return {matrix, x: Math.floor((cols - matrix[0].length) / 2), y: 0, type};
  }
  function collision(p, dx=0, dy=0, matrix=p.matrix) {
    for (let y=0; y<matrix.length; y++) for (let x=0; x<matrix[y].length; x++) {
      if (!matrix[y][x]) continue;
      const nx=p.x+x+dx, ny=p.y+y+dy;
      if (nx < 0 || nx >= cols || ny >= rows || (ny >= 0 && board[ny][nx])) return true;
    }
    return false;
  }
  function rotate(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
  }
  function drawCell(x, y, color) {
    ctx.fillStyle = color; ctx.fillRect(x*cell, y*cell, cell-1, cell-1);
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.strokeRect(x*cell+1, y*cell+1, cell-3, cell-3);
  }
  function draw() {
    ctx.fillStyle = '#050914'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle = 'rgba(85,120,190,.13)';
    for(let x=0;x<=cols;x++){ctx.beginPath();ctx.moveTo(x*cell,0);ctx.lineTo(x*cell,canvas.height);ctx.stroke();}
    for(let y=0;y<=rows;y++){ctx.beginPath();ctx.moveTo(0,y*cell);ctx.lineTo(canvas.width,y*cell);ctx.stroke();}
    board.forEach((row,y)=>row.forEach((v,x)=>{if(v)drawCell(x,y,colors[v]);}));
    if(piece) piece.matrix.forEach((row,y)=>row.forEach((v,x)=>{if(v)drawCell(piece.x+x,piece.y+y,colors[piece.type]);}));
  }
  function updateStats(){scoreEl.textContent=score;linesEl.textContent=lines;levelEl.textContent=level;}
  function spawn(){piece=newPiece(); if(collision(piece)){running=false;over=true;message.textContent='Partida acabada! Prem Iniciar / reiniciar per tornar-hi.';}}
  function merge(){piece.matrix.forEach((row,y)=>row.forEach((v,x)=>{if(v && piece.y+y>=0)board[piece.y+y][piece.x+x]=piece.type;}));}
  function clearLines(){let count=0; for(let y=rows-1;y>=0;y--){if(board[y].every(v=>v)){board.splice(y,1);board.unshift(Array(cols).fill(0));count++;y++;}} if(count){lines+=count;score += [0,100,300,500,800][count]*level;level=1+Math.floor(lines/10);message.textContent=`Has completat ${count} línia${count>1?'es':''}!`;updateStats();}}
  function lock(){merge();clearLines();spawn();}
  function move(dx,dy){if(!running)return; if(!collision(piece,dx,dy)){piece.x+=dx;piece.y+=dy;return true;} if(dy>0){lock();} return false;}
  function turn(){if(!running)return;const rotated=rotate(piece.matrix);let offset=0;while(collision(piece,0,0,rotated)){offset=offset===0?1:-offset+(offset>0?-1:1);if(Math.abs(offset)>2)return;}piece.x+=offset;piece.matrix=rotated;}
  function hardDrop(){if(!running)return;while(!collision(piece,0,1))piece.y++;lock();}
  function start(){cancelAnimationFrame(animation);board=emptyBoard();piece=null;score=0;lines=0;level=1;running=true;over=false;lastTime=0;dropCounter=0;message.textContent='Juga amb les fletxes del teclat o els controls.';updateStats();spawn();draw();animation=requestAnimationFrame(loop);canvas.focus();}
  function loop(time=0){if(!running){draw();return;}const delta=time-lastTime;lastTime=time;dropCounter+=delta;if(dropCounter>Math.max(100,800-(level-1)*65)){move(0,1);dropCounter=0;}draw();animation=requestAnimationFrame(loop);}
  document.addEventListener('keydown',e=>{const keys=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];if(keys.includes(e.key))e.preventDefault();if(!running){if(e.key.startsWith('Arrow')||e.key===' ')start();else return;}if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')move(-1,0);else if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')move(1,0);else if(e.key==='ArrowDown'||e.key.toLowerCase()==='s')move(0,1);else if(e.key==='ArrowUp'||e.key.toLowerCase()==='w')turn();else if(e.key===' ')hardDrop();draw();});
  document.querySelectorAll('[data-tetris]').forEach(button=>button.addEventListener('click',()=>{if(!running){start();}const action=button.dataset.tetris;if(action==='left')move(-1,0);if(action==='right')move(1,0);if(action==='down')move(0,1);if(action==='rotate')turn();if(action==='drop')hardDrop();draw();}));
  document.getElementById('tetrisReiniciar').addEventListener('click',start);
  board=emptyBoard();score=0;lines=0;level=1;running=false;over=false;piece=null;updateStats();draw();
})();
