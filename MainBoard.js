class MainBoard {
    constructor(){
      this.canvas = null;
      this.context = null;
      this.init();
      this.Draw();
    }

    init(){
      //canvas setup
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d')
      this.canvas.width = BOARD_WIDTH;
      this.canvas.height = BOARD_HEIGHT;
      document.getElementById("mainboard").appendChild(this.canvas);
      this.context.fillStyle = "#212529";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

      let btnUpdate = document.getElementById("Update");

      //test Field
      this.topology = new topology(this);
      btnUpdate.addEventListener("click",()=>{
        this.context.fillStyle = "#212529";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.topology.Classification();
        this.topology.FindAllBackBone();
        this.topology.FindBackBoneCenter();
        this.topology.PrimDijsktra();

        this.topology.BackBoneTraffic();
        this.topology.SaveBackBoneTraffic();
        this.topology.CalculateHopCount();

        this.topology.CalculateUAndHoming();

        this.Draw();
      })
    }

    Draw(){
      this.topology.Draw()
    }

}

var m = new MainBoard();
