function DrawRect(x,y,w,h,cvs){
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.cvs = cvs;
}
function Snake(x,y,w,h){
  DrawRect.apply(this,arguments);
  this.children = [];
  this.paused = true;
}
function Food(x,y,w,h){
  DrawRect.apply(this,arguments);
}
function ChildSnake(x,y,w,h){
  DrawRect.apply(this,arguments);
}
function inHerit(child,parent){
  var F = function(){};
  F.prototype = parent.prototype;
  child.prototype = new F();
  child.prototype.constructor = child;
}
DrawRect.prototype.draw = function(color){
  this.cvs = cvs;
  cvs.fillStyle = 'rgba('+ color.join(',') + ',1)';
  cvs.fillRect(this.x,this.y,this.w,this.h);
  cvs.strokeRect(this.x,this.y,this.w,this.h);
};
inHerit(Snake,DrawRect);
inHerit(Food,DrawRect);
inHerit(ChildSnake,DrawRect);

Snake.prototype.init = function(opts){
  var pos = addPos(this.cvs);
  var _this = this, key;
  
  opts = opts || {};
  this.opts = {
    step  : opts.step || 20,
    snakeColor : opts.snakeColor || [255,0,0],
    bodyColor : opts.bodyColor || [128,128,128],
    foodColor : opts.foodColor || [0,0,255]
  };
  
  this.key = key = 39;
  this.food = new DrawRect(pos.x,pos.y,20,20);
  
  document.onkeydown = function(ev){   
    var code = ev.keyCode;
    
    if( code == 32 ){ 
      this.paused ? _this.play() : _this.pause();
      this.paused ? hideTip() : showTip();
      this.paused = !this.paused;
    }

    if( code == 37 && key != 39 || code == 38 && key != 40 || code == 39 && key != 37 || code == 40 && key != 38 )
    _this.key = key = code;
  };
    
};
  
Snake.prototype.play = function (){
  var _this = this;
  clearInterval(this.timer);
  this.timer = setInterval(function(){
    _this.move();
  },150);
};

Snake.prototype.pause = function(){
  clearInterval(this.timer);
};

Snake.prototype.createChild = function(){
  var _this = this;
  this.children.forEach(function(o){
    o.draw(_this.opts.bodyColor);
  });
};

Snake.prototype.move = function (){
  var colors, pos = {x:this.x,y:this.y},key = this.key,
    cvs = this.cvs, maxWidth = canvas.width - this.w,
    maxHeight = canvas.height - this.h;

  if( key == 37 )this.x -= this.opts.step;
  if( key == 38 )this.y -= this.opts.step;
  if( key == 39 )this.x += this.opts.step;
  if( key == 40 )this.y += this.opts.step;
  
  if( this.x < 0 || this.y < 0 || this.x > maxWidth || this.y > maxHeight ){
    clearInterval(this.timer);
    gameOver('撞墙,游戏结束！');
    return;
  }

  colors = cvs.getImageData(this.x,this.y,20,20).data.slice(112,115);

  if( checkData(colors,this.opts.bodyColor) ){
    clearInterval(this.timer);
    gameOver('把自己咬死！游戏结束！');
    return;          
  }

  if( checkData(colors,this.opts.foodColor) ){
    var newChild = this.children.slice(-1);
    var newPos = addPos(cvs);
    this.food.x = newPos.x; 
    this.food.y = newPos.y;
    this.children.push(new DrawRect(newChild.x,newChild.y,20,20));
  }
  
  for(var i=this.children.length-1;i>0; i--){
    this.children[i].x = this.children[i-1].x;
    this.children[i].y = this.children[i-1].y;
  }
  if(this.children[0]) this.children[0].x = pos.x;
  if(this.children[0]) this.children[0].y = pos.y;
 
  cvs.clearRect(0,0,800,600);
  this.draw(this.opts.snakeColor);
  this.food.draw(this.opts.foodColor);
  this.createChild();
};

function gameOver(txt){
  alert(txt);
  window.location.reload();
}

function showTip(){
  tips.style.display = 'block';
}

function hideTip(){
  tips.style.display = 'none';
}

function addPos(cvs){
  var x = getRand(0,40)*20, y = getRand(0,30)*20;
  var colors = cvs.getImageData(x,y,20,20).data;
  if( Number(colors.join('')) == 0 ) return {x:x,y:y};
  return addPos(cvs);
}

function checkData(arr1,arr2){
  if( arr1.length && arr2.length ){
    if( arr1[0] == arr2[0] && arr1[1] == arr2[1] && arr1[2] == arr2[2] ) return true;
    return false;
  }
  return false;
}

function getRand(x,y){
  return Math.floor(Math.random()*(y-x)+x);
}