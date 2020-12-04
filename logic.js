 var Sys = null;
 var Color = "rgb(255,0,255)";
        function sys() { }
        sys.prototype = {
            GameMap: [],
            PreviewMap: [],
            BlocksObj: [],
            Timer: null,
            HorizontalNum: 10,
            VerticalNum: 18, 
            IsGameOver: false,
            ScoreStrategy: [100, 300, 500, 800],
            LevelScores: [100, 20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000, 200000], 
            IsPlay: false, //The game is in progress.
            IsFirstPlay: true, 
            SmallGridNum: 6, 
            DirectionEnum: { left: 0, right: 1, up: 2, down: 3 },
            Speeds: [1000, 900, 800, 700, 600, 500, 400, 300, 200, 100],
            CurrentSpeed: 1000, 
            TypeEnum: { none: 0, block: 1, blocks: 2 },
            BlocksEnum: [0, 1, 2, 3, 4, 5, 6], 
            BlocksStateNum: [4, 4, 4, 2, 2, 2, 1],
            BlocksShapeMaps: [ 
                       [ 
                           [[[2, 1]], [[0, 2], [1, 2], [2, 2]]], 
                           [[[1, 0]], [[1, 1]], [[1, 2], [2, 2]]],
                           [[[0, 1], [1, 1], [2, 1]], [[0, 2]]],
                           [[[1, 0], [2, 0]], [[2, 1]], [[2, 2]]]
                       ],
                       [
                           [[[2, 0]], [[2, 1]], [[1, 2], [2, 2]]],
                           [[[0, 1]], [[0, 2], [1, 2]], [[2, 2]]],
                           [[[0, 0], [1, 0]], [[0, 1]], [[0, 2]]],
                           [[[0, 1], [1, 1], [2, 1]], [[2, 2]]] 
                       ],
                       [
                             [[[0, 0], [1, 0], [2, 0]], [[1, 1]]],
                           [[[1, 0]], [[0, 1], [1, 1]], [[1, 2]]],
                           [[[1, 1]], [[0, 2], [1, 2], [2, 2]]],
                           [[[0, 0]], [[0, 1], [1, 1]], [[0, 2]]]
                       ],
                       [
                          [[[0, 0]], [[0, 1], [1, 1]], [[1, 2]]],
                           [[[1, 1], [2, 1]], [[0, 2], [1, 2]]]
                       ],
                       [
                           [[[1, 0]], [[0, 1], [1, 1]], [[0, 2]]],
                           [[[0, 1], [1, 1]], [[1, 2], [2, 2]]] 
                       ],
                       [
                            [[[0, 0]], [[0, 1]], [[0, 2]], [[0, 3]]],
                           [[[0, 3]], [[1, 3]], [[2, 3]], [[3, 3]]]
                       ],
                       [
                             [[[0, 0], [0, 1]], [[1, 0], [1, 1]]]
                       ]
                      ],
            ColorEnum: [[0, 0], [-28, 0], [-56, 0], [-84, 0], [-112, 0], [-140, 0], [-168, 0], [0, 0], [-28, 0], [-56, 0]], //Enumeration of colors, corresponding to XBlocksEnum
            CreateGameMap: function() { 
                for (var i = 0; i < this.VerticalNum; i++) {
                    this.GameMap.push([]);
                    for (var j = 0; j < this.HorizontalNum; j++) {
                        this.GameMap[i][j] = {};
                        this.GameMap[i][j][Sys.TypeEnum.blocks] = null;
                    }
                }
            },
            GetBlocks: function() { 
                for (var i = 0; i < this.BlocksObj.length; i++) {
                    if (this.BlocksObj[i].isInGameMap) {
                        return this.BlocksObj[i];
                    }
                }
                return null;
            },
            AllowBlocksMove: function() {  //Whether to allow the square set to move
                var blocksItem = this.GetBlocks();
                var itemPosArray = this._getBlocksItemPosArray(blocksItem, false);
                return this.NoBlocksInthePlace(itemPosArray, blocksItem) && this.CheckBoundary(itemPosArray, blocksItem);
            },
            GetMaxAndMinItemPosArray: function(itemPosArray) {  //Get the maximum and minimum square location set
                itemPosArray.ItemPosXArray.sorts();
                itemPosArray.ItemPosYArray.sorts();
                return { maxItemPosX: itemPosArray.ItemPosXArray[itemPosArray.ItemPosXArray.length - 1], maxItemPosY: itemPosArray.ItemPosYArray[itemPosArray.ItemPosYArray.length - 1], minItemPosX: itemPosArray.ItemPosXArray[0], minItemPosY: itemPosArray.ItemPosYArray[0] };
            },
            NoBlocksInthePlace: function(itemPosArray, blocksItem) { //Check whether there are already squares in the game box
                return this._isOverMapChild(itemPosArray, blocksItem) ? false : true;
            },
            CheckBoundary: function(itemPosArray, blocksItem) { //Have you reached the border?
                var maxAndMinItemPosArray = this.GetMaxAndMinItemPosArray(itemPosArray);
                var isNotToBoundary = false;
                switch (blocksItem.currentDirectionEnum) {
                    case this.DirectionEnum.left:
                        isNotToBoundary = (maxAndMinItemPosArray.minItemPosX > 0)
                        break;
                    case this.DirectionEnum.right:
                        isNotToBoundary = (maxAndMinItemPosArray.maxItemPosX < this.HorizontalNum - 1)
                        break;
                    case this.DirectionEnum.down:
                        isNotToBoundary = (maxAndMinItemPosArray.maxItemPosY < this.VerticalNum - 1);
                        break;
                }
                return isNotToBoundary;
            },
            _isOverMapChild: function(itemPosArray, blocksItem) { //Detect whether elements in a game box will be overwritten
                var isOverMapChild = false;
                for (var i = 0; i < itemPosArray.ItemPosYArray.length; i++) {
                    var itemX = itemPosArray.ItemPosXArray[i];
                    var itemY = itemPosArray.ItemPosYArray[i];
                    if (blocksItem.currentDirectionEnum == this.DirectionEnum.left) {
                        itemX--;
                    }
                    else if (blocksItem.currentDirectionEnum == this.DirectionEnum.right) {
                        itemX++;
                    }
                    else if (blocksItem.currentDirectionEnum == this.DirectionEnum.down) {
                        itemY++;
                    }
                    if (this.GameMap[itemY] && this.GameMap[itemY][itemX] && this.GameMap[itemY][itemX][this.TypeEnum.blocks] != null) {
                        isOverMapChild = true;
                        break;
                    }
                }
                return isOverMapChild;
            },
            _getBlocksItemPosArray: function(blocksItem, isRelative) {  //Gets the location collection of the box set，isRelative=trueGet the position of the square relative to the square set map, otherwise it is the position of the square relative to the game map
                var itemPosXArray = [];
                var itemPosYArray = [];
                for (var i = 0; i < blocksItem.blocks.length; i++) {
                    if (isRelative) {
                        itemPosXArray.push(blocksItem.blocks[i].x);
                        itemPosYArray.push(blocksItem.blocks[i].y);
                    }
                    else {
                        itemPosXArray.push(blocksItem.blocks[i].x + blocksItem.x);
                        itemPosYArray.push(blocksItem.blocks[i].y + blocksItem.y);
                    }
                }
                return { ItemPosXArray: itemPosXArray, ItemPosYArray: itemPosYArray };
            },
            GetBlocksInitPos: function(blocks) { //Get the initial position of the box
                var blocksItem = null;
                if (!blocks)
                    blocksItem = this.GetBlocks();
                else
                    blocksItem = blocks;
                var itemPosArray = this._getBlocksItemPosArray(blocksItem, true);
                itemPosArray.ItemPosXArray = itemPosArray.ItemPosXArray.filter();
                itemPosArray.ItemPosYArray = itemPosArray.ItemPosYArray.filter();
                var childsNumX = itemPosArray.ItemPosXArray.length;
                var childsNumY = itemPosArray.ItemPosYArray.length;
                var maxAndMinItemPosArray = this.GetMaxAndMinItemPosArray(itemPosArray);
                if (blocks) //Get the initial position of the square set in the preview map
                    return { x: (this.SmallGridNum - childsNumX - 1) / 2 + 0.5 - maxAndMinItemPosArray.minItemPosX, y: (this.SmallGridNum - childsNumY - 1) / 2 + 0.5 - maxAndMinItemPosArray.minItemPosY };
                else //Get the initial position of the square set in the game map
                    return { x: parseInt((this.HorizontalNum - childsNumX - 1) / 2) + 1 - maxAndMinItemPosArray.minItemPosX, y: -(childsNumY + maxAndMinItemPosArray.minItemPosY) };
            },
            GetNextActiviteBrocks: function() { 
                for (var i = 0; i < this.BlocksObj.length; i++) {
                    if (this.BlocksObj[i].isInGameMap) {
                        this.BlocksObj.removeAt(i);
                    }
                }
                this.BlocksObj[0].isInGameMap = true;
                var itemPos = this.GetBlocksInitPos();
                this.BlocksObj[0].x = itemPos.x;
                this.BlocksObj[0].y = itemPos.y;
                this.BlocksObj[0].AddToMap(false, false);
                this.CreateBlocks();
            },
            PlayGame: function() { //Start the game
                this.IsPlay = true;
                this.NaturalMove();
                if (!this.IsFirstPlay) {
                    return;
                }
                this.GetNextActiviteBrocks();
            },
            AddToGameMapGrid: function() { //Add to the game map grid
                var blocks = this.GetBlocks();
                blocks.UseGrid(this.GameMap, blocks);
            },
            GetScore: function() { //Score processing
                var rowIndexArray = [];
                for (var i = 0; i < this.VerticalNum; i++) { //Get the number of rows with full rows
                    var entireRow = true;
                    for (var j = 0; j < this.HorizontalNum; j++) {
                        if (this.GameMap[i][j][this.TypeEnum.blocks] == null) {
                            entireRow = false;
                            break;
                        }
                    }
                    if (entireRow)
                        rowIndexArray.push(i);
                }
                if (rowIndexArray.length > 0) {
                    this._FreeMapGrid(rowIndexArray);
                    document.getElementById("score").innerText = this.ScoreStrategy[rowIndexArray.length - 1] + parseInt(document.getElementById("score").innerText);
                    this.CheckTheLevel();
                }
            },
            CheckTheLevel: function() { //Detect whether to move on to the next level
                var currentScore = parseInt(document.getElementById("score").innerText);
                var speedList = document.getElementById("speed");
                var currentLevel = parseInt(speedList.options[speedList.selectedIndex].text) - 1;
                var levelScore = this.LevelScores[currentLevel];
                if (currentScore >= levelScore) {
                    if (currentLevel < this.LevelScores.length) {
                        var element = document.getElementById("gameOver");
                        element.innerText = "Congratulations on passing the " + (speedList.selectedIndex + 1) + " round";
                        element.style.display = "block";
                        this.PauseGame();
                        document.getElementById("btnStart").disabled = true;
                        document.getElementById("speed").disabled = true;
                        this._goToNextLevel.delay(3000);
                    }
                    else {
                        this._finishAllTheLevel(element);
                    }
                }
            },
            _goToNextLevel: function() { //Move on to the next level and speed up.
                Sys.IsPlay = true;
                document.getElementById("btnStart").disabled = false;
                var speedList = document.getElementById("speed");
                speedList.disabled = false;
                speedList.options[speedList.selectedIndex + 1].selected = true;
                Sys.CurrentSpeed = Sys.Speeds[speedList.selectedIndex + 1];
                Sys.NaturalMove();
                document.getElementById("gameOver").style.display = "none";
            },
            _finishAllTheLevel: function() { //Complete all game levels
                this.PauseGame();
            },
            _FreeMapGrid: function(rowIndexArray) { //Release the grid with full rows from the game map
                var gameMap = this.GameMap;
                var startIndex = rowIndexArray[0];
                var len = rowIndexArray.length;
                var maxIndex = startIndex + len - 1;
                for (var i = startIndex; i <= maxIndex; i++) {
                    for (var j = 0; j < this.HorizontalNum; j++) {
                        if (gameMap[i][j][this.TypeEnum.blocks] != null) {
                            document.getElementById("map").removeChild(gameMap[i][j][this.TypeEnum.blocks].domElement);
                            gameMap[i][j][this.TypeEnum.blocks] = null;
                        }
                    }
                }
                this.ResetMapGrid(rowIndexArray);
            },
            ResetMapGrid: function(rowIndexArray) { //Reset the game grid
                var gameMap = this.GameMap;
                var maxIndex = rowIndexArray[0];
                var len = rowIndexArray.length;
                for (var i = maxIndex - 1; i >= 0; i--) {
                    for (var j = 0; j < this.HorizontalNum; j++) {
                        if (gameMap[i][j][this.TypeEnum.blocks] != null) {
                            this._resetMapElement(gameMap[i][j][this.TypeEnum.blocks].domElement, len);
                            gameMap[i + len][j][this.TypeEnum.blocks] = gameMap[i][j][this.TypeEnum.blocks];
                            gameMap[i][j][this.TypeEnum.blocks] = null;
                        }
                    }
                }
            },
            _resetMapElement: function(element, len) { 
                element.style.top = (parseInt(element.style.top) + 28 * len) + "px";
            },
            InitSpeed: function() { //Initialize the game level
                var speedList = document.getElementById("speed");
                if (speedList.options.length == 0) {
                    for (var i = 0; i < this.Speeds.length; i++) {
                        var varItem = new Option(i + 1, this.Speeds[i]);
                        speedList.options.add(varItem);
                    }
                }
                this.SetSpeedSelected();
            },
            SetSpeedSelected: function() { //Selected level
                var speedList = document.getElementById("speed");
                for (var i = 0; i < speedList.options.length; i++) {
                    if (speedList.options[i].value == this.CurrentSpeed) {
                        speedList.options[i].selected = true;
                        break;
                    }
                }
            },
            GameOver: function() { //Game over
                this.IsGameOver = true;
                this.PauseGame();
                var element = document.getElementById("gameOver");
                element.innerText = "Game Over!";
                element.style.display = "block";
                document.getElementById("btnStart").value = "Retry";
            },
            PauseGame: function() { //Pause the game
                this.IsPlay = false;
                clearInterval(this.Timer);
            },
            CreateBlocks: function() { //Create a set of squares
                var currentNum = this.BlocksEnum.length.getRandom();
				console.log(currentNum);
				
				if(currentNum == 0){					
					Color = "rgb(21,100,166)";
				}else if (currentNum == 1){
					Color ="rgb(54,153,47)";
				}else if (currentNum == 2){
					Color ="rgb(233,212,0)";
				}else if (currentNum == 3){
					Color ="rgb(137,64,135)";
				}else if (currentNum == 4){
					Color ="rgb(219,132,1)";
				}else if (currentNum == 5){
					Color ="rgb(87,175,187)";
				}else if (currentNum == 6){
					Color ="rgb(203,10,15)";
				}
				
                var blocks = new Blocks(0, 0, this.BlocksStateNum[currentNum], currentNum, this.ColorEnum[currentNum]);
                blocks.Init();
                if (this.BlocksObj.length == 3)
                    Sys.BlocksObj.pop();
                Sys.BlocksObj.push(blocks);
            },
            NaturalMove: function() { //Natural fall
                this.Timer = setInterval("Moving()", Sys.CurrentSpeed);
            }
        }
        function Base() { } //Define the base class
        Base.prototype.AddToMap = function(isAddToPreviewMap, isMoving) { //Add a set of squares to map
            for (var i = 0; i < this.blocks.length; i++) {
                var element = null;
                if (!this.isInGameMap) { //If the square set is in the preview map
                    element = document.createElement("DIV");
                    document.getElementById("PreviewMap").appendChild(element);
                    this.blocksElement.push(element);
                    this.blocks[i].domElement = element;
                }
                else
                    element = this.blocksElement[i];
                if (!isAddToPreviewMap && !isMoving) //When moving from Preview map to Game map
                    document.getElementById("map").appendChild(element);
                element.style.position = "absolute";
                element.style.left = ((this.x + this.blocks[i].x) * 28) + "px"; //Sets the location of the map where the element is located
                element.style.top = ((this.y + this.blocks[i].y) * 28) + "px";
                element.style.backgroundPositionX = this.color[0];
                element.style.backgroundPositionY = this.color[1];
				element.style.backgroundColor = this.Cloor;
            }
        }
        Base.prototype.UseGrid = function(map, blocksItem) { //The set of squares is added to the game map
            for (var i = 0; i < blocksItem.blocks.length; i++) {
                var itemX = blocksItem.x + blocksItem.blocks[i].x;
                var itemY = blocksItem.y + blocksItem.blocks[i].y;
                if (blocksItem.y < 0) {
                    Sys.GameOver();
                    return;
                }
                map[itemY][itemX] = {};
                map[itemY][itemX][this.type] = blocksItem.blocks[i];
            }
        }
        function Block(x, y) { //Define a square structure
            this.x = x;
            this.y = y;
			this.Cloor = Color;
            this.type = Sys.TypeEnum.block;
            this.domElement = null;
        }
        function Blocks(x, y, state, blocksEnum, colorEnum) { //Square set class
            this.x = x;
            this.y = y;
            this.state = state;
            this.blocksEnum = blocksEnum; 
             this.color = colorEnum;
            this.type = Sys.TypeEnum.blocks;
            this.blocks = []; 
            this.blocksElement = []; 
            this.currentState = 0;
            this.isInGameMap = false; 
            this.currentDirectionEnum = Sys.DirectionEnum.down; //Default direction down
        }
        Blocks.prototype = new Base();
        Blocks.prototype.Init = function() {
            var blocksPoses = Sys.BlocksShapeMaps[this.blocksEnum];
            this.currentState = Sys.BlocksStateNum[this.blocksEnum].getRandom();
            var blocksPos = blocksPoses[this.currentState]; 
            for (var i = 0; i < blocksPos.length; i++) {
                for (var j = 0; j < blocksPos[i].length; j++) {
                    var block = new Block(blocksPos[i][j][0], blocksPos[i][j][1]);
                    this.blocks.push(block);
                }
            }
            var itemPos = Sys.GetBlocksInitPos(this); 
            this.x = itemPos.x;
            this.y = itemPos.y;
			this.Cloor = Color;
            this.AddToMap(true, false);
        }
        Blocks.prototype.ChangeShape = function() {
            var gameMap = Sys.GameMap;
            var allowChangeShape = true;
            var blocksPoses = Sys.BlocksShapeMaps[this.blocksEnum];
            var num = Sys.BlocksStateNum[this.blocksEnum];
            var currentState1 = -1;
            this.currentState == num - 1 ? currentState1 = 0 : currentState1 = this.currentState + 1;
            var blocksPos = blocksPoses[currentState1];
            var k = 0;
            for (var i = 0; i < blocksPos.length; i++) { 
                for (var j = 0; j < blocksPos[i].length; j++) {
                    var block = this.blocks[k];
                    var itemX = this.x + blocksPos[i][j][0];
                    var itemY = this.y + blocksPos[i][j][1];
                    if ((itemX > Sys.HorizontalNum - 1) || (itemX < 0) || (itemY > Sys.VerticalNum - 1) || itemY >= 0 && gameMap[itemY][itemX] != null && gameMap[itemY][itemX][Sys.TypeEnum.blocks] != null) {
                        allowChangeShape = false;
                        break;
                    }
                    k++;
                }
            }
            if (allowChangeShape)//If deformation is allowed
            {
                this.currentState == num - 1 ? this.currentState = 0 : this.currentState++; //Set the state of the next deformation
                k = 0;
                for (var i = 0; i < blocksPos.length; i++) {
                    for (var j = 0; j < blocksPos[i].length; j++) {
                        var block = this.blocks[k];
                        block.x = blocksPos[i][j][0];
                        block.y = blocksPos[i][j][1];
                        k++;
                    }
                }
                this.AddToMap(false, true);
            }
        }
        Blocks.prototype.BlocksMoveDown = function(isMoving) { 
            this.currentDirectionEnum = Sys.DirectionEnum.down;
            if (!Sys.AllowBlocksMove()) { 
                Sys.AddToGameMapGrid(); 
                Sys.GetScore(); 
                Sys.GetNextActiviteBrocks(); 
            }
            else { //Fall into one frame
                this.y++;
                this.AddToMap(false, isMoving);
            }
        }
        Number.prototype.getRandom = function() {
            var num = this;
            var i = this + 1;
            while (i >= num) {
                i = Math.round(Math.random() * 10);
            }
            return i;
        }
        Array.prototype.sorts = function() { return this.sort(compare); } 
        function compare(a, b) { return a - b; } 
        Array.prototype.removeAt = function(dx) { 
            if (isNaN(dx) || dx > this.length) { return false; }
            for (var i = 0, n = 0; i < this.length; i++) {
                if (this[i] != this[dx])
                    this[n++] = this[i];
            }
            this.length -= 1;
        }
        Array.prototype.filter = function() { //Clear duplicate values in the array
            var arr = [];
            for (var i = 0; i < this.length; i++) {
                if (!arr.contains(this[i]))
                    arr.push(this[i]);
            }
            return arr;
        }
        Array.prototype.contains = function(item) { //Check whether the array contains an element
            for (var i = 0; i < this.length; i++) {
                if (this[i] == item)
                    return true;
            }
            return false;
        }
        Function.prototype.delay = function(time) { var timer = setTimeout(this, time); } //Function delay time millisecond execution
        window.onload = InitGame;
        function InitGame() {//Initialize the game
            Sys = new sys();
            Sys.BlocksObj = [];
            Sys.InitSpeed(); 
            Sys.CreateGameMap(); 
            Sys.CreateBlocks(); 
        }
        function GameStart(element) {
            if (element.value == "Start game") { 
                element.value = "Pause game";
                Sys.PlayGame();
                Sys.IsFirstPlay = false;
            }
            else if (element.value == "Pause game") { 
                element.value = "Start game"
                Sys.PauseGame();
            }
            else { 
                window.location.reload();
            }
        }
        function Moving() {//move
            Sys.GetBlocks().BlocksMoveDown(false);
        }
        function ChangeSpeed(e) {//Switch level
            var speedlist = document.getElementById("speed");
            Sys.CurrentSpeed = speedlist.options[speedlist.selectedIndex].value;
            if (!Sys.IsGameOver) {
                clearInterval(Sys.Timer);
                this.NaturalMove();
            }
        }
        function keyDown(e) { //Keystroke operation
            if (Sys.IsGameOver || !Sys.IsPlay) return;
            var blocks = Sys.GetBlocks();
            if (e.keyCode == 37) {  //left
                blocks.currentDirectionEnum = Sys.DirectionEnum.left;
                if (Sys.AllowBlocksMove())
                    blocks.x--;
                if (blocks.x != 0)
                    blocks.AddToMap(false, true);
            }
            else if (e.keyCode == 38) {  //up
                blocks.currentDirectionEnum = Sys.DirectionEnum.up;
                blocks.ChangeShape();
            }
            else if (e.keyCode == 39) { //right
                blocks.currentDirectionEnum = Sys.DirectionEnum.right;
                var oldX = blocks.x;
                if (Sys.AllowBlocksMove())
                    blocks.x++;
                if (blocks.x != oldX)
                    blocks.AddToMap(false, true);
            }
            else if (e.keyCode == 40)  //down
            {
                blocks.currentDirectionEnum = Sys.DirectionEnum.down;
                blocks.BlocksMoveDown(true);
            }
        }