class topology {

  constructor(MainBoard){
    this.MainBoard = MainBoard;
    this.topology = [];
    this.maxCost = null;
    this.listNodeMaxCost = [];
    this.backBoneRadius;
    this.xctr = null;
    this.yctr = null;
    this.dcMax = null;
    this.wMax = null;
    this.queue = [];
    this.BFS = [];
    this.minNode = null;
    this.listBackBone = [];
    this.homeList = [];

    this.GenerateTopology();
    this.CalculateTopology();
    this.Classification();
    this.FindAllBackBone();
    this.FindBackBoneCenter();
    this.PrimDijsktra();

    this.BackBoneTraffic();
    this.SaveBackBoneTraffic();
    this.CalculateHopCount();

    this.CalculateUAndHoming();
  }


    //random topo
    GenerateTopology(){
      for(var i=0;i<TOTAL_NODE;i++){
        let x = Math.floor(Math.random() * 1000) + BOARD_WIDTH/10;
        let y = Math.floor(Math.random() * 1000) + BOARD_HEIGHT/10;
        this.node = new node(this.MainBoard,x,y,i)
        this.topology.push(this.node);
      }

      this.topology.forEach(node => {
        for(var i=0;i<TOTAL_NODE;i++){
          let traffic = new Traffic(i,0);
          node.traffic.push(traffic)
        }
      })



    }

/*
    //fix topo
    GenerateTopology(){

      for(var i=1;i<11;i++){
        for(var j=1;j<11;j++){
          let x = 100*j;
          let y = 100*i;

          if(j%2 == 0){
            this.node = new node(this.MainBoard,x,y,LABEL);
            this.topology.push(this.node);
            LABEL++;
          }else{
            this.node = new node(this.MainBoard,x,y+FIX_Y,LABEL);
            this.topology.push(this.node);
            LABEL++;
          }
        }
      }

    this.topology.forEach(node => {
      for(var i=0;i<TOTAL_NODE;i++){
        let traffic = new Traffic(i,0);
        node.traffic.push(traffic)
      }
    })

    }

*/
    CalculateTopology(){
      //Biết lưu lượng giữa nút i và i+2 là 1

      for(var i=2;i<TOTAL_NODE;i++){
        this.topology[i].w+=1;
        this.topology[i-2].w+=1;
        this.topology[i].traffic[i-2].traffic+=1;
        this.topology[i-2].traffic[i].traffic+=1;
      }
      //Lưu lượng giữa nút i và i+58 là 2
      for(var i=58;i<TOTAL_NODE;i++){
        this.topology[i].w+=2;
        this.topology[i-58].w+=2;
        this.topology[i].traffic[i-58].traffic+=2;
        this.topology[i-58].traffic[i].traffic+=2;
      }
      //lưu lượng giữa i và i+62 là 3
      for(var i=62;i<TOTAL_NODE;i++){
        this.topology[i].w+=3;
        this.topology[i-62].w+=3;
        this.topology[i].traffic[i-62].traffic+=3;
        this.topology[i-62].traffic[i].traffic+=3;
      }
      //lưu lượng giữa nút 13 và 47 là 18
      this.topology[12].w+=18;
      this.topology[46].w+=18;
      this.topology[12].traffic[46].traffic+=18;
      this.topology[46].traffic[12].traffic+=18;
      //lưu lượng giữa 34 và 69 là 20
      this.topology[33].w+=20;
      this.topology[68].w+=20;
      this.topology[33].traffic[68].traffic+=20;
      this.topology[68].traffic[33].traffic+=20;
      //lưu lượng giữa 20 và 38 là 30
      this.topology[19].w+=30;
      this.topology[37].w+=30;
      this.topology[19].traffic[37].traffic+=30;
      this.topology[37].traffic[19].traffic+=30;
      //Lưu lượng giữa nút 45 và 29 là 10
      this.topology[44].w+=10;
      this.topology[28].w+=10;
      this.topology[44].traffic[28].traffic+=10;
      this.topology[28].traffic[44].traffic+=10;

      //C Config
/*
      this.topology[3].traffic[10].traffic+=8;
      this.topology[10].traffic[3].traffic+=8;
      this.topology[13].traffic[37].traffic+=5;
      this.topology[37].traffic[13].traffic+=5;
      this.topology[15].traffic[30].traffic+=6;
      this.topology[30].traffic[15].traffic+=6;
      this.topology[40].traffic[58].traffic+=10;
      this.topology[58].traffic[40].traffic+=10;
*/
      this.topology.forEach((node) => {
        let nW = (node.w/CAPITAL);
        if(nW>W_SYSTEM){
          node.isBackBone = true;
          node.isAccess = false;
        }
      });

      //getMaxcost
      this.CalculateMaxCost();
      this.backBoneRadius = this.maxCost*PRARM
      }

      async CalculateMaxCost(){
        this.topology.forEach((nodei) => {
          this.topology.forEach((nodej) => {
            let value = Math.sqrt( (nodei.xAxis - nodej.xAxis)*(nodei.xAxis - nodej.xAxis) + (nodei.yAxis - nodej.yAxis)*(nodei.yAxis - nodej.yAxis) );
            if(value > this.maxCost){
              this.maxCost = value;
              this.listNodeMaxCost = [];
              this.listNodeMaxCost.push(nodei,nodej)
            }
          });
        });
      }

      Classification(){
        //In backbone Radius
        this.topology.forEach((node) => {
          if(node.isBackBone && !node.isClassified){
            this.topology.forEach((nodeNeedClassification) => {
              if(!nodeNeedClassification.isBackBone && nodeNeedClassification.label != node.label){
                let value = Math.sqrt( (node.xAxis - nodeNeedClassification.xAxis)*(node.xAxis - nodeNeedClassification.xAxis) + (node.yAxis - nodeNeedClassification.yAxis)*(node.yAxis - nodeNeedClassification.yAxis) );
                if(!nodeNeedClassification.isClassified && value < this.backBoneRadius){
                  node.isClassified = true;
                  nodeNeedClassification.backBoneParent = node;
                  nodeNeedClassification.isClassified = true;
                  nodeNeedClassification.isAccess = true;
                  nodeNeedClassification.isBackBone = false;
                }else{
                  return;
                }
              }
              else{
                return;
              }
            });
          }else{
            return;
          }
        });
      }

      FindAllBackBone(){
        let count = this.CheckTopology();

        if(count != 0){
          this.CenterGravity(this.MeritCalculate(this.Classification()));
          this.FindAllBackBone()
        }else{
          return;
        }
      }

      CheckTopology(){
        let count = 0;
        this.topology.forEach((node) => {
          if(!node.isClassified){
            count++;
          }
        });
        return count;
      }

      CenterGravity(){
        let xctrt = null;
        let ctrm = null;
        let yctrt = null;

        this.topology.forEach((node) => {
          if(!node.isClassified){
            xctrt += node.xAxis*node.w;
            ctrm += node.w;
            yctrt += node.yAxis*node.w;
          }
        });

        this.xctr = xctrt/ctrm;
        this.yctr = yctrt/ctrm;

        this.topology.forEach((node) => {
          if(!node.isClassified){
            node.dc = ROUND * Math.sqrt( (node.xAxis - this.xctr)*(node.xAxis - this.xctr)
                               + (node.yAxis - this.yctr)*(node.yAxis - this.yctr) );
            if(node.dc > this.dcMax){this.dcMax = node.dc}
            else if(node.w > this.wMax){this.wMax = node.w}
          }
        });

        //console.log("Center Gravity: (" + this.xctr + ", " + this.yctr + "). MaxDc: " + this.dcMax + ". MaxW: " + this.wMax);
      }

      MeritCalculate(){
        let meritMax = null;
        let nodeMeritMax = null;

        this.topology.forEach((node) => {
            if(!node.isClassified){
              let merit = (0.5*(this.dcMax - node.dc)/this.dcMax) + (0.5*node.w/this.wMax);
              if(merit>meritMax){
                meritMax = merit;
                nodeMeritMax = node;
              }
            }
        })

        if(nodeMeritMax!=null){
          nodeMeritMax.isBackBone = true;
          nodeMeritMax.backBoneParent = null;
        }
      }

      FindBackBoneCenter(){
        this.topology.forEach((node) => {
          if(node.isBackBone){
            this.listBackBone.push(node)
          }
        });

        let minMoment = 999999999;
        let minMomentNode = null;

        this.listBackBone.forEach((nodei) => {
          let moment = 0;

          this.listBackBone.forEach((nodej) => {

            if(nodei.label != nodej.label){
              let cost = ROUND * Math.sqrt( (nodei.xAxis - nodej.xAxis)*(nodei.xAxis - nodej.xAxis)
                                          + (nodei.yAxis - nodej.yAxis)*(nodei.yAxis - nodej.yAxis) );
              moment += cost*nodej.w;
            }

          })

          if(moment<minMoment){
            minMoment = moment;
            minMomentNode = nodei
          }
        });

        if(minMomentNode != null){
          this.topology[minMomentNode.label].isCenterNode = true;
        }
      }

      PrimDijsktra(){
        this.queue = this.listBackBone
        let processing = null;

        let minL = 999999999;
        let nodeMinL = null;

        this.queue.forEach((node) => {
            if(node.isCenterNode){
              processing = node;
              this.queue.splice(this.queue.indexOf(node), 1);
              this.BFS.push(node)
            }
        });

        this.queue.forEach((node) => {
          node.d = ALPHA*processing.d + ROUND * Math.sqrt( (node.xAxis - processing.xAxis)*(node.xAxis - processing.xAxis)
                                                         + (node.yAxis - processing.yAxis)*(node.yAxis - processing.yAxis) );
          node.PDParent = processing;

          if(node.d < minL){
            minL = node.d;
            nodeMinL = node
          }
        });

        processing = nodeMinL;
        this.queue.splice(this.queue.indexOf(processing), 1);
        this.BFS.push(processing)
        this.PDHelper(nodeMinL);
      }

      PDHelper(processing){
        if(this.queue.length == 1){
          this.BFS.push(this.queue[0]);
          return;
        }else{
          let minL = 999999999;
          let nodeMinL = null;

          this.queue.forEach((node) => {
            let L = ALPHA*processing.d + ROUND * Math.sqrt( (node.xAxis - processing.xAxis)*(node.xAxis - processing.xAxis)
                                                           + (node.yAxis - processing.yAxis)*(node.yAxis - processing.yAxis) );
            if(L < node.d){
              node.d = L;
              node.PDParent = processing
            }
          });

          this.queue.forEach((node) => {
            if(node.d < minL){
              minL = node.d;
              nodeMinL = node
            }
          });

          processing = nodeMinL;
          this.queue.splice(this.queue.indexOf(processing), 1);
          this.BFS.push(processing)
          this.PDHelper(nodeMinL);

        }
      }

      BackBoneTraffic(){
        this.topology.forEach((node) => {
          if(node.isAccess){
            this.topology[this.topology.indexOf(node.backBoneParent)].ListAccessNode.push(node);
          }
        });

        this.BFS.forEach((nodei) => {
          this.BFS.forEach((nodej) => {
            if(nodei.label != nodej.label){
              let tf = nodei.traffic[nodej.label].traffic;

              nodei.ListAccessNode.forEach((nodeiAccessList) => {
                tf += nodeiAccessList.traffic[nodej.label].traffic;
              });

              nodej.ListAccessNode.forEach((nodejAccessList) => {
                tf += nodejAccessList.traffic[nodei.label].traffic;
              });

              nodei.ListAccessNode.forEach((nodeiAccessList) => {
                nodej.ListAccessNode.forEach((nodejAccessList) => {
                  if(nodeiAccessList.label != nodei.label && nodejAccessList.label != nodei.label)
                  tf += nodeiAccessList.traffic[nodejAccessList.label].traffic;
                });
              });

              let traffic = new Traffic(nodej.label, tf);
              nodei.backBoneTraffic.push(traffic);
            }
          });
        });
      }

      SaveBackBoneTraffic(){
        this.BFS.forEach((node) => {
          node.backBoneTraffic.forEach((traffic) => {
            let t = new Traffic(traffic.label, traffic.traffic)
            node.processingTraffic.push(t)
          });
        });
      }

      CalculateHopCount(){
        this.BFS.forEach((node) => {
          if(node.PDParent != null){
            node.hopCount = node.PDParent.hopCount + 1
          }
        });

        this.BFS.forEach((nodei) => {
          this.BFS.forEach((nodej) => {
            if(nodei.label != nodej.label){
              let way = [];
              //way = this.FindTheWay(this.topology[2], this.topology[5])
              way = this.FindTheWay(nodei,nodej);
              //console.log("Đường đi từ " + nodei.label + " đến " + nodej.label )
              //console.log(way)
              this.ChooseHoming(nodei,nodej,way);
              let h = new Hop(nodej.label,way.length + 1);
              nodei.hop.push(h);
            }
          });
        });
      }

      ChooseHoming(nodei,nodej,way){
        if(way.length == 1){
          let h = new Home(nodei.label,nodej.label,way[0].label)
          this.homeList.push(h)
        }else if(way.length > 1){
          let minCost = 999999999;
          let minNode = null;
          way.forEach((node) => {
            let cost = ROUND*Math.sqrt( (nodei.xAxis-node.xAxis)*(nodei.xAxis-node.xAxis) + (nodei.yAxis-node.yAxis)*(nodei.yAxis-node.yAxis) )
            if(cost<minCost){
              minCost = cost;
              minNode = node
            }
          });
          //console.log(minNode)
          if(minNode != null){
            let h = new Home(nodei.label, nodej.label, minNode.label)
            this.homeList.push(h)
          }
        }
      }

      CalculateUAndHoming(){
        let BhopArr = [];
        BhopArr = this.SortByHop()
        console.log(BhopArr)

        BhopArr.forEach((hopNode) => {
          if(hopNode.hop > 1){
            let n = Math.floor(this.getBackBoneTraffic(this.topology[hopNode.nodei],this.topology[hopNode.nodej])/CAPITAL) + 1;
            if(n != 0){
              let u = this.getBackBoneTraffic(this.topology[hopNode.nodei],this.topology[hopNode.nodej])/ (n*CAPITAL);
              if( u < U_MIN){
                let newHome = null

                this.homeList.forEach((home) => {
                  if(home.nodeiLabel == hopNode.nodei && home.nodejLabel == hopNode.nodej){
                    newHome = this.topology[home.homeLabel]
                  }
                });

                this.TrafferTrafficAfterHoming(this.topology[hopNode.nodei],this.topology[hopNode.nodej], newHome)
              }
              //console.log("Độ sử dụng: ("+ hopNode.nodei + ", " + hopNode.nodej +"): " + u);
            }
            //console.log("Số liên kết: ("+ hopNode.nodei + ", " + hopNode.nodej +"): " + n);
          }
        });
        this.CalculateNewEraTraffic()
      }

      CalculateNewEraTraffic(){
        this.BFS.forEach((node) => {
          node.newEraTraffic.forEach((traffic) => {
            //console.log("Lưu lượng mới giữa: ("+ node.label + ", " + traffic.label +"): " + traffic.traffic);
            let n = Math.floor(traffic.traffic/CAPITAL) + 1
            console.log("Số liên kết mới giữa: ("+ node.label + ", " + traffic.label +"): " + n);
            let u = traffic.traffic / (CAPITAL*n)
            console.log("Độ sử dụng giữa: ("+ node.label + ", " + traffic.label +"): " + u);
            this.drawNewEra(node.xAxis, node.yAxis, this.topology[traffic.label].xAxis, this.topology[traffic.label].yAxis )
          });

        });

      }

      // TODO: wait to handle here
      TrafferTrafficAfterHoming(nodei, nodej, home){
        //console.log("Home của " + nodei.label + " và " + nodej.label + " là: " + home.label)
        let t = 0;
        nodei.processingTraffic.forEach((tra) => {
          if(tra.label == nodej.label){
            t += tra.traffic
          }
          if(tra.label == home.label){
            t += tra.traffic
          }
        });


      //  console.log(t)

        nodei.processingTraffic.forEach((tra) => {
          if(tra.label == home.label){
            tra.traffic = t + tra.traffic;
          }
        });

        if(nodei.newEraTraffic.length == 0){
          let traf = new Traffic(home.label, t)
          nodei.newEraTraffic.push(traf)
        }else{
          let countForNewEra = 0;
          nodei.newEraTraffic.forEach((traff) => {
            if(traff.label == home.label){
              countForNewEra ++;
              traff.traffic += t;
            }
          });

          if(countForNewEra == 0){
            let traf = new Traffic(home.label, t)
            nodei.newEraTraffic.push(traf)
          }

        }

      }

      getBackBoneTraffic(nodei,nodej){
        let returnT = null;
          nodei.backBoneTraffic.forEach((t) => {
            if(nodej.label == t.label){
              returnT = t.traffic
            }
          });
        return returnT;
      }

      SortByHop(){
        let Bhop = 1;
        let count = null;
        let BhopArr = []

        while(count != 0){
          count = 0;
          this.BFS.forEach((node) => {
            node.hop.forEach((hop) => {
              if(hop.hop == Bhop){
                let h = new HopNode(node.label, hop.label, hop.hop)
                BhopArr.push(h)
                count++;
              }
            });
          });
          Bhop++;
        }

        BhopArr.forEach((nodei) => {
            BhopArr.forEach((nodej) => {
              if(nodei.nodei == nodej.nodej && nodei.nodej == nodej.nodei){
                BhopArr.splice(BhopArr.indexOf(nodej),1);
              }
            });
        });

        BhopArr.reverse();
        return BhopArr;
      }

      Homing(){

      }

      FindTheWay(nodei,nodej){
        if(nodei.isCenterNode){
          let nodejWay = [];
          let nodejEnv = null;

          nodejEnv = nodej;
          while(nodejEnv.PDParent != null){
            nodejEnv = this.getPDParent(nodejEnv);
            nodejWay.push(nodejEnv)
          }
          nodejWay.reverse()
          nodejWay.shift();
          return nodejWay;
        } else if(nodej.isCenterNode){
          let nodeiWay = [];
          let nodeiEnv = null;

          nodeiEnv = nodei;
          while(nodeiEnv.PDParent != null){
            nodeiEnv = this.getPDParent(nodeiEnv);
            nodeiWay.push(nodeiEnv)
          }
          nodeiWay.reverse()
          nodeiWay.shift();
          return nodeiWay;
        }else if (nodei == nodej) {
          let way = [];
          return way;
        }else if (nodei == nodej.PDParent) {
          let way = [];
          return way;
        }else if (nodej == nodei.PDParent) {
          let way = [];
          return way;
        } else{
          let nodeiWay = [];
          let nodejWay = [];
          let wayFromItoJ = [];
          let nodeiEnv = null;
          let nodejEnv = null;

          nodeiEnv = nodei;
          while(nodeiEnv.PDParent != null){
            nodeiEnv = this.getPDParent(nodeiEnv);
            nodeiWay.push(nodeiEnv)
          }

          nodejEnv = nodej;
          while(nodejEnv.PDParent != null){
            nodejEnv = this.getPDParent(nodejEnv);
            nodejWay.push(nodejEnv)
          }


          if(nodeiWay.length >= nodejWay.length){
            let lastNode = null;
            nodeiWay.reverse();
            nodejWay.reverse();

            while(nodejWay.length != 0 && nodeiWay[0].label == nodejWay[0].label){
              lastNode = nodejWay.shift();
              nodeiWay.shift();
            }
            nodeiWay.reverse();
            nodeiWay.push(lastNode);
            wayFromItoJ = nodeiWay.concat(nodejWay)
            return wayFromItoJ;
          } else if(nodeiWay.length < nodejWay.length){
            let lastNode = null;
            nodeiWay.reverse();
            nodejWay.reverse();

            while(nodeiWay.length != 0 && nodeiWay[0].label == nodejWay[0].label){
              lastNode = nodejWay.shift();
              nodeiWay.shift();
            }

            nodeiWay.reverse();
            nodeiWay.push(lastNode);
            wayFromItoJ = nodeiWay.concat(nodejWay)
            return wayFromItoJ;
          }
        }

      }

      getPDParent(node){
        return node.PDParent
      }


  //Draw
  Draw(){
    this.topology.forEach((node) => {
      node.Draw()
      if(node.isCenterNode){
        node.DrawCenterNode()
        //node.DrawBackBoneRadius(this.backBoneRadius)
      }else if(node.isBackBone){
        node.DrawBackBone();
        node.DrawPDConnection();
        //node.DrawBackBoneRadius(this.backBoneRadius)
      }else if(node.isAccess){
        node.DrawConnectionToBackBone();
      }
    });

    //this.DrawMaxCost(this.listNodeMaxCost[0].xAxis,this.listNodeMaxCost[0].yAxis,this.listNodeMaxCost[1].xAxis,this.listNodeMaxCost[1].yAxis,)

    console.log(this.BFS)
    console.log(this.topology)
    console.log(this.homeList)
    console.log("Node MaXCOST: (" + this.listNodeMaxCost[0].label + ", " + this.listNodeMaxCost[1].label + ")")
    console.log("maxCost: " + this.maxCost )
    console.log("backboneRadius: " + this.backBoneRadius)

    this.SaveFile();
  }

  SaveFile(){

  }

  DrawMaxCost(xi,yi,xj,yj){
    this.MainBoard.context.strokeStyle = '#ff00ff';
    this.MainBoard.context.beginPath();
    this.MainBoard.context.moveTo(xi, yi);
    this.MainBoard.context.lineTo(xj, yj);
    this.MainBoard.context.stroke();
  }

  drawNewEra(xi,yi,xj,yj){
    this.MainBoard.context.strokeStyle = '#ff00ff';
    this.MainBoard.context.beginPath();
    this.MainBoard.context.moveTo(xi, yi);
    this.MainBoard.context.lineTo(xj, yj);
    this.MainBoard.context.stroke();
  }



}
