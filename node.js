class node {
  constructor(MainBoard, xAxis, yAxis, label){
    this.MainBoard = MainBoard;
    this.label = label;
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.w = null;
    this.dc = null;
    this.traffic = [];
    this.backBoneTraffic = [];
    this.backBoneParent = null;
    this.ListAccessNode = [];
    this.isCenterNode = false;
    this.isClassified = false;
    this.isAccess = false;
    this.isBackBone = false;
    this.merit = null;
    this.d = 0;
    this.PDParent = null;
    this.hopCount = 0;
    this.hop = [];
    this.home = null;
    this.liveConnection = null;
  }

  Draw(){
    this.MainBoard.context.fillStyle = '#fc0303';
    this.MainBoard.context.fillRect(this.xAxis,this.yAxis,1,1)
    this.MainBoard.context.font = "20px Arial";
    this.MainBoard.context.fillText(this.label, this.xAxis-10, this.yAxis-10);
  }

  DrawBackBone(){
    this.MainBoard.context.fillStyle = '#009933';
    this.MainBoard.context.fillRect(this.xAxis-10,this.yAxis-10,20,20)
    this.MainBoard.context.font = "20px Arial";
    this.MainBoard.context.fillText(this.label, this.xAxis-10, this.yAxis-10);
  }

  DrawBackBoneRadius(radius){
    this.MainBoard.context.strokeStyle = '#009933';
    this.MainBoard.context.beginPath();
    this.MainBoard.context.arc(this.xAxis,this.yAxis,radius,0, 2 * Math.PI);
    this.MainBoard.context.stroke();
  }

  DrawCenterNode(){
    this.MainBoard.context.fillStyle = '#ffff00';
    this.MainBoard.context.fillRect(this.xAxis-10,this.yAxis-10,20,20)
    this.MainBoard.context.font = "20px Arial";
    this.MainBoard.context.fillText(this.label, this.xAxis-10, this.yAxis-10);
  }

  DrawConnectionToBackBone(){
    this.MainBoard.context.strokeStyle = '#ffffff';
    this.MainBoard.context.beginPath();
    this.MainBoard.context.moveTo(this.backBoneParent.xAxis, this.backBoneParent.yAxis);
    this.MainBoard.context.lineTo(this.xAxis, this.yAxis);
    this.MainBoard.context.stroke();
  }

  DrawPDConnection(){
    this.MainBoard.context.strokeStyle = '#ffff00';
    this.MainBoard.context.beginPath();
    this.MainBoard.context.moveTo(this.PDParent.xAxis, this.PDParent.yAxis);
    this.MainBoard.context.lineTo(this.xAxis, this.yAxis);
    this.MainBoard.context.stroke();
  }

  DrawLiveConnection(){
    this.MainBoard.context.strokeStyle = '#ffff00';
    this.MainBoard.context.beginPath();
    this.MainBoard.context.moveTo(this.liveConnection.xAxis, this.liveConnection.yAxis);
    this.MainBoard.context.lineTo(this.xAxis, this.yAxis);
    this.MainBoard.context.stroke();
  }

  Clear(){

  }

}
