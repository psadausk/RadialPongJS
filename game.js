var fieldRadius = 300;
var playerSize = 1;
var player;
var field;
var canvas;
var stage;

//Player control variables
//velocity represents the current rotation speed of the player
//Positive represents clockwise, while negative is counter

var velocity = 200;
var maxVelocity = 50;

//Debugging tools
var nearestSquare;
var totalArcLine;
var actualArcLine;

window.onload = function(){

    createjs.Ticker.framerate  = 60;
    //var circleRadius = 300;
    canvas = document.getElementById("myCanvas");
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    stage = new createjs.Stage("myCanvas");

    stage.enableDOMEvents(true);
    fieldRadius = Math.min(canvas.width, canvas.height)/2 - 50;
    playerSize = fieldRadius/6;
    //Add the background
    field = new createjs.Shape();

    field.graphics.beginFill("DeepSkyBlue").drawCircle(canvas.width/2, canvas.height/2, fieldRadius);
    stage.addChild(field);

    player = new createjs.Shape();
    //player.graphics.beginFill("red").drawRect((canvas.width/2) - fieldRadius - 40, (canvas.height/2), 50, 50 );
    player.graphics.beginFill("red").drawRect(-playerSize/2,-playerSize/2, playerSize, playerSize );
    nearestSquare = new createjs.Shape();
    nearestSquare.graphics.beginFill("green").drawRect(-playerSize/2,-playerSize/2, playerSize, playerSize );

    totalArcLine = new createjs.Shape();
    totalArcLine.graphics.beginFill("yellow");

    actualArcLine = new createjs.Shape();
    actualArcLine.graphics.beginFill("blue");


    UpdatePlayerPosition(GetNearestPoint(new Victor(stage.mouseX, stage.mouseY)));


    createjs.Ticker.addEventListener("tick", HandleTick);

    stage.addChild(player);
    stage.addChild(nearestSquare);
    stage.addChild(totalArcLine);
    stage.addChild(actualArcLine);
    stage.update();
}

function HandleTick(event){
  if(!event.paused){
    UpdatePlayer(event.delta);
  }
}

function UpdatePlayer(delta){
  //Artifically cap the delta, so slowing the framerate doesn't make it jump too much
  delta = Math.max(delta, 100)
  var playerPosition = new Victor(player.x, player.y);
  //console.log("Player Start: " + GetVectorRelativeToLocal(playerPosition));

  var initalPoint = GetVectorRelativeToLocal(new Victor(player.x, player.y));
  var finalPoint = GetVectorRelativeToLocal(GetNearestPoint(new Victor(stage.mouseX, stage.mouseY)));

  var nearestVector = GetVectorRelativeToGlobal(finalPoint)
  nearestSquare.x = nearestVector.x;
  nearestSquare.y = nearestVector.y;

  //test input
  //var initalPoint = new Victor(2,1);
  //var finalPoint = new Victor(1,2);

  var angle = GetAngle(initalPoint, finalPoint);
  //var angle = Math.atan2(finalPoint.y - initalPoint.y, finalPoint.x - initalPoint.x);
  //var angle = Math.abs(Math.atan((initalPoint.y - finalPoint.y)/ (initalPoint.x - finalPoint.x)));
  //console.log("dot is " + dot);
  //console.log("Mag is " + mag);

  //console.log("Player:" + player.x + ", " + player.y);
  //console.log("initalPoint is " +  initalPoint);
  //console.log("finalPoint is " +  finalPoint);
  //var angle = Math.cos(dot/mag);
  var px = stage.mouseX;
  var py = stage.mouseY;
  //console.log("angle is " + angle);
  if(Math.abs(angle) > .01){

    //Get the actual arc length we're going to move
    var totalArcLength = angle * fieldRadius;

    //console.log("totalArcLength is " + totalArcLength);
    var arcLength = Math.min(Math.abs(totalArcLength), velocity);
    console.log(totalArcLength);
    if(totalArcLength < 0){
      arcLength *= -1;
    }
    var deltaArcLength = arcLength * delta/1000;
    //console.log(deltaArcLength);
    //Now calculate the angle at that point
    var angleToMove = deltaArcLength/fieldRadius;

    var cross = initalPoint.cross(finalPoint);
    console.log("angle to move " + 180/Math.PI * angleToMove);
    //totalArcLine.graphics.clear();
    //totalArcLine.graphics.arcTo(nearestVector.x, nearestVector.y, newPlayerPos.x, newPlayerPos.y, fieldRadius);
    var center = GetCurrentFieldCenterAbs();
    totalArcLine.graphics.clear();
    totalArcLine.graphics.beginFill("yellow");
    actualArcLine.graphics.clear();
    actualArcLine.graphics.beginFill("blue");
    //console.log(angleToMove);

    //Get the angle of the intial point relative to the 0 degree line
    var zeroDegreeVector = new Victor(fieldRadius, 0);
    initalPointAngle = GetAngle(zeroDegreeVector, initalPoint);
    finalPointAngle = GetAngle(zeroDegreeVector,finalPoint);
    actualAngle = initalPointAngle + angleToMove;

    console.log("Actual angle " + angleToMove * 180 / Math.PI);
    //console.log("Intial angle " + initalPointAngle * 180 / Math.PI);
    //console.log("Final angle " + finalPointAngle * 180 / Math.PI);
    if(cross > 0 ){
      totalArcLine.graphics.arc(center.x, center.y,fieldRadius, initalPointAngle/* * Math.PI*/, finalPointAngle /**Math.PI*/ , false).endFill();
      actualArcLine.graphics.arc(center.x, center.y,fieldRadius, initalPointAngle/* * Math.PI*/, actualAngle /**Math.PI*/ , false).endFill();
    } else {
      totalArcLine.graphics.arc(center.x, center.y,fieldRadius,  initalPointAngle /** Math.PI*/, finalPointAngle /**Math.PI*/, true).endFill();
      actualArcLine.graphics.arc(center.x, center.y,fieldRadius, initalPointAngle/* * Math.PI*/, actualAngle /**Math.PI*/ , true).endFill();
    }

    //console.log(initalPointAngle * 180/Math.PI);
    //console.log(finalPointAngle* 180/Math.PI);
    totalArcLine.graphics.endFill();
    actualArcLine.graphics.endFill();

    //var pX = fieldRadius * Math.cos(angleToMove);
    //var pY = fieldRadius * Math.sin(angleToMove);
    var pX = fieldRadius * Math.cos(actualAngle);
    var pY = fieldRadius * Math.sin(actualAngle);
    //console.log("new player local ps is (" +pX + ", " + pY + ")");

    var newPlayerPos = GetVectorRelativeToGlobal(new Victor(pX, pY));
    UpdatePlayerPosition(newPlayerPos);

  }

  stage.update();
}

function UpdatePlayerPosition(p){
  player.x = p.x;
  player.y = p.y

  //Now do the rotation.
  var angle = Math.atan2(stage.mouseY - player.y, stage.mouseX - player.x);
  angle = angle * (180/Math.PI);
  if(angle < 0) {
        //angle = 360 - (-angle);
  }

  player.rotation = angle
}

function GetNearestPoint(p){
  var mouseP = p;
  //var mouseP = new Victor(stage.mouseX - canvas.width/2, stage.mouseY - canvas.height/2);
  var fieldP = new Victor(canvas.width/2, canvas.height/2);
  //console.log("subtracting " + fieldP + " from " + mouseP);
  var v = new Victor(mouseP.x - fieldP.x, mouseP.y - fieldP.y).normalize();
  //console.log("subtracting " + fieldP + " from " + mouseP);
  return  fieldP.add(new Victor(v.x * fieldRadius, v.y * fieldRadius));
}

function GetAngle(v1, v2){
  var dot = v1.dot(v2)
  var mag = v1.magnitude() * v2.magnitude();
  var angle = Math.acos(dot/mag);
  var cross = v1.cross(v2);
  if(cross < 0){
    angle *= -1;
  }
  return angle;
}

//Takes in 2 points. The first is the point.
//The second is the relative point
function GetVectorRelativeToLocal(p1, relativePoint){
  relativePoint = typeof relativePoint !== 'undefined' ? relativePoint : GetCurrentFieldCenterAbs();
  return new Victor(p1.x - relativePoint.x, p1.y - relativePoint.y);
}

function GetVectorRelativeToGlobal(p1, relativePoint){
  relativePoint = typeof relativePoint !== 'undefined' ? relativePoint : GetCurrentFieldCenterAbs();
  return new Victor(p1.x + relativePoint.x, p1.y + relativePoint.y);
}

function GetCurrentFieldCenterAbs(){
  return new Victor(canvas.width/2, canvas.height/2);
}
