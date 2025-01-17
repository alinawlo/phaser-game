import Phaser from 'phaser';
import MDP from './MDP';
import State from './State';

export default class MDPGraph {
    private scene;
    private mdp: MDP;
    private radius;
    private activeState;
    private nodes;
    public elements;
    private visible;
    private prevState: State;
    private beforePrevState: State;
    private widthCounter1=0;
    private speedCounter1=0;
    private speedLimit1=false;
    private widthCounter2=0;
    private speedCounter2=0;
    private speedLimit2=false;
    private cleared=false;


    constructor(scene: Phaser.Scene, mdp) {
        this.scene = scene;
        this.nodes = [];
        this.mdp = mdp;
        this.radius = 20; // do not change
        this.elements = [];
        this.visible = true;
        this.prevState= new State(["xxx"],{x: 0,y: 0});
        this.beforePrevState= new State(["xxxx"],{x: 0,y: 0});
    }

    createNodes() {
        // Create the nodes for each state
        this.activeState = this.mdp.getCurrentState;

        for (const stateName in this.mdp.states) {
            const state = this.mdp.states[stateName];
            const nodeColor = 0xffffff;
            const nodeOutlineColor = 0x000000; // Dark gray outline color
            // Set the outline style for the node
            const nodeOutline = this.scene.add.circle(
                state.position.x,
                state.position.y,
                this.radius + 2,
                nodeOutlineColor
            );
            this.elements.push(nodeOutline);
            nodeOutline.scrollFactorX = 0.01;
            nodeOutline.scrollFactorY = 0.01;
            nodeOutline.setStrokeStyle(2, nodeOutlineColor).setOrigin(0.5);

            const node = this.scene.add.circle(
                state.position.x,
                state.position.y,
                this.radius,
                nodeColor
            );
            node.scrollFactorX = 0.01;
            node.scrollFactorY = 0.01;
            node.setData('stateName', stateName);

            const nodeName = this.scene.add.sprite(
                state.position.x,
                state.position.y,
                state.icon,
            ).setDisplaySize(24,24).setScrollFactor(0.01,0.01);
            this.elements.push(nodeName);

            nodeName.setOrigin(0.5);
            nodeName.scrollFactorX = 0.01;
            nodeName.scrollFactorY = 0.01;

            // Add click event to the node
            this.nodes.push(node); // Store reference to the node
            this.elements.push(node);
        }
        this.updateNodeColors(0);
    }

    // method to decide which edge to add + arrow heads
    addEdge(startState, endState, curve) {
        const direction = this.getDirection(startState, endState);
        const arrowheadSize = 10; // Adjust the size of the arrowhead as needed
        let arrowheadX = endState.position.x;
        let arrowheadY = endState.position.y;
        let ellipse;
        if (direction.x < 0) {
            // left direction
            if (direction.y < 0) {
                // top left edge
                if (curve) {
                    ellipse = this.edgeBoilerPlate(startState, endState, 45, curve, true, 0, 0);
                    arrowheadX += this.radius + 2;
                    arrowheadY += this.radius - 3;
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, arrowheadSize, -arrowheadSize / 2, arrowheadSize, arrowheadSize / 2, 0xffffff);
                } else {
                    ellipse = this.edgeBoilerPlate(startState, endState, 45, curve, true, 0, 0);
                    arrowheadX += this.radius;
                    arrowheadY += this.radius;
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, 0, arrowheadSize, arrowheadSize, 0, 0xffffff);
                }
            } else if (direction.y > 0) {
                // bot left edge
                if (curve) {
                    arrowheadX += 18;
                    arrowheadY -= 11;
                    ellipse = this.edgeBoilerPlate(startState, endState, 135, curve, false, 0, 0);
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, -arrowheadSize / 2, -arrowheadSize, arrowheadSize / 2, -arrowheadSize, 0xffffff);
                } else {
                    arrowheadX += 20;
                    arrowheadY -= 20;
                    ellipse = this.edgeBoilerPlate(startState, endState, 135, curve, false, 0, 0);
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, 0, arrowheadSize, arrowheadSize, arrowheadSize, 0xffffff);
                }
            } else {
                // straight left edge
                if (curve == 0) {
                    arrowheadX += this.radius + 5;
                    arrowheadY += 5;
                    ellipse = this.edgeBoilerPlate(startState, endState, 180, curve, false, 0, 0);
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, arrowheadSize, -arrowheadSize / 2, arrowheadSize, arrowheadSize / 2, 0xffffff);
                } else {
                    ellipse = this.edgeBoilerPlate(startState, endState, 180, curve, false, 0, -18);
                    arrowheadX += 27;
                    arrowheadY += 2;
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, +arrowheadSize / 2 + 8, -5, -arrowheadSize / 2 + 8, -arrowheadSize - 2, 0xffffff);
                }
            }
        } else if (direction.x > 0) {
            // right direction
            if (direction.y < 0) {
                // top right edge
                if (curve) {
                    arrowheadX -= 7;
                    arrowheadY += 22;
                    ellipse = this.edgeBoilerPlate(startState, endState, 135, curve, true, 0, 0);
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, -arrowheadSize / 2, arrowheadSize, arrowheadSize / 2, arrowheadSize, 0xffffff);
                } else {
                    arrowheadX -= this.radius;
                    arrowheadY += this.radius;
                    ellipse = this.edgeBoilerPlate(startState, endState, 135, curve, true, 0, 0);
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, arrowheadSize, 0, arrowheadSize, arrowheadSize, 0xffffff);
                }
            } else if (direction.y > 0) {
                //bot right edge
                if (curve) {
                    ellipse = this.edgeBoilerPlate(startState, endState, 45, curve, false, 0, 0);
                    arrowheadX -= 13;
                    arrowheadY -= 7;
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, -arrowheadSize, arrowheadSize / 2, -arrowheadSize, -arrowheadSize / 2, 0xffffff);
                } else {
                    ellipse = this.edgeBoilerPlate(startState, endState, 45, curve, false, 0, 0);
                    arrowheadX -= 10;
                    arrowheadY -= 10;
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, 0, -arrowheadSize, -arrowheadSize, 0, 0xffffff);
                }
            } else {
                // straight right edge
                if (curve == 0) {
                    arrowheadX -= 15;
                    arrowheadY += 5;
                    ellipse = this.edgeBoilerPlate(startState, endState, 180, curve, true, 0, 0);
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, -arrowheadSize, +arrowheadSize / 2, -arrowheadSize, -arrowheadSize / 2, 0xffffff);
                } else {
                    ellipse = this.edgeBoilerPlate(startState, endState, 180, curve, true, 0, 18);
                    arrowheadX -= 15;
                    arrowheadY += 10;
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, -12, 6, -2, 12, 0xffffff);
                }
            }
        } else {
            if (direction.y < 0) {
                // top edge
                if (curve == 0) {
                    arrowheadX += 5;
                    arrowheadY += this.radius + 5;
                    ellipse = this.edgeBoilerPlate(startState, endState, 90, curve, true, 0, 0);
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, arrowheadSize / 2, arrowheadSize, -arrowheadSize / 2, arrowheadSize, 0xffffff);
                } else {
                    ellipse = this.edgeBoilerPlate(startState, endState, 90, curve, true, 18, 0);
                    arrowheadX += 8;
                    arrowheadY += 25;
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, arrowheadSize / 2 + 10, 0, -arrowheadSize / 2 + 15, +arrowheadSize, 0xffffff);
                }
            } else if (direction.y > 0) {
                // bot edge
                if (curve == 0) {
                    arrowheadX += 5;
                    arrowheadY -= this.radius - 5;
                    ellipse = this.edgeBoilerPlate(startState, endState, 90, curve, false, 0, 0);
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, -arrowheadSize / 2, -arrowheadSize, arrowheadSize / 2, -arrowheadSize, 0xffffff
                    );
                } else {
                    ellipse = this.edgeBoilerPlate(startState, endState, 90, curve, false, -18, 0);
                    arrowheadX += 8;
                    arrowheadY -= 15;
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, -arrowheadSize / 2 - 10, -arrowheadSize + 10, arrowheadSize / 2 - 15, -arrowheadSize, 0xffffff);
                }
            } else {
                // self edge
                const direction = curve;
                curve = this.radius * 2;

                if (direction == 1) {
                    // top
                    arrowheadX -= 10;
                    arrowheadY -= 8;
                    ellipse = this.selfEdge(startState, startState, 180, curve, false, 0, -(this.radius + 9));
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, -arrowheadSize / 2, -arrowheadSize, arrowheadSize / 2, -arrowheadSize, 0xffffff);
                } else if (direction == 2) {
                    // right
                    arrowheadX += this.radius - 2;
                    arrowheadY -= this.radius - 10;
                    ellipse = this.selfEdge(startState, startState, 90, curve, true, +(this.radius + 9), 0);
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, arrowheadSize, -arrowheadSize / 2, arrowheadSize, arrowheadSize / 2, 0xffffff);
                } else if (direction == 3) {
                    // bot
                    arrowheadX += this.radius;
                    arrowheadY += this.radius - 2;
                    ellipse = this.selfEdge(startState, startState, 180, curve, true, 0, +(this.radius + 9));
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, arrowheadSize / 2, arrowheadSize, -arrowheadSize / 2, arrowheadSize, 0xffffff);
                } else if (direction == 4) {
                    // left
                    arrowheadX -= 8;
                    arrowheadY += this.radius - 1;
                    ellipse = this.selfEdge(startState, startState, 90, curve, false, -(this.radius + 9), 0);
                    this.addArrowHead(arrowheadX, arrowheadY, 0, 0, -arrowheadSize, +arrowheadSize / 2, -arrowheadSize, -arrowheadSize / 2, 0xffffff);
                }
            }
        }
        return ellipse;
    }

    addArrowHead(arrowheadX, arrowheadY, x1, y1, x2, y2, x3, y3, colour) {
        const arrowhead = this.scene.add
            .triangle(arrowheadX, arrowheadY, x1, y1, x2, y2, x3, y3, colour)
            .setScrollFactor(0.01, 0.01);
        this.elements.push(arrowhead);
    }

    selfEdge(startState, endState, angle, curve, clockwise, offsetX, offsetY) {
        // Calculate the distance between the start and end state positions
        const direction = this.getDirection(startState, endState);
        const diagonalRadius =
            Phaser.Math.Distance.Between(
                startState.position.x,
                startState.position.y,
                endState.position.x,
                endState.position.y
            ) /
            2 -
            (this.radius - 5);
        const ellipse = new Phaser.Curves.Ellipse(0, 0, diagonalRadius, curve, 0, 180, clockwise, angle);
        const edge = this.scene.add
            .curve(
                startState.position.x + direction.x / 2 + offsetX,
                startState.position.y + direction.y / 2 + offsetY,
                ellipse
            )
            .setStrokeStyle(2, 0xffffff)
            .setScrollFactor(0.01, 0.01);
        this.elements.push(edge);
        return ellipse;
    }

    edgeBoilerPlate(startState, endState, angle, curve, clockwise, offsetX, offsetY) {
        // Calculate the distance between the start and end state positions
        const direction = this.getDirection(startState, endState);
        const diagonalRadius =
            Phaser.Math.Distance.Between(
                startState.position.x, startState.position.y, endState.position.x, endState.position.y) / 2
            - (this.radius + 1);
        const ellipse = new Phaser.Curves.Ellipse(0, 0, diagonalRadius, curve, 0, 180, clockwise, angle);
        const edge = this.scene.add
            .curve(startState.position.x + direction.x / 2 + offsetX, startState.position.y + direction.y / 2 + offsetY, ellipse)
            .setStrokeStyle(2, 0xffffff)
            .setScrollFactor(0.01, 0.01);
        this.elements.push(edge);
        
        return ellipse;
    }

    addActionProbability(startState, endState, ellipse, asset, probability , offsetX, offsetY, offsetX2?) {
        const midpointX = (startState.position.x + endState.position.x) / 2 + offsetX;
        const midpointY = (startState.position.y + endState.position.y) / 2 + offsetY;

        // Calculate the position of the red dot on the ellipse
        const dotPosition = ellipse.getPoint(0.5); // 0.5 represents the midpoint

        const transition = this.scene.add.sprite(
            dotPosition.x + midpointX,
            dotPosition.y + midpointY,
            asset
        ).setScrollFactor(0.01,0.01);
        
        let posX = dotPosition.x + midpointX - 9;
        if(offsetX2){
            posX = dotPosition.x + midpointX - 9 + offsetX2
        }
        const probabilityText = this.scene.add.text(
            posX,
            dotPosition.y + midpointY +10,
            probability,
            {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#ffffff',
                fixedWidth: 40,
                fixedHeight: 25,
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setScrollFactor(0.01, 0.01);
        
        this.elements.push(transition);
        this.elements.push(probabilityText);
    } 

    getDirection(startState, endState) {
        const start = new Phaser.Math.Vector2(startState.position.x, startState.position.y);
        const end = new Phaser.Math.Vector2(endState.position.x, endState.position.y);

        const direction = new Phaser.Math.Vector2();
        direction.copy(end).subtract(start);
        return direction;
    }

    updateNodeColors(d?) {
        let delay = 2000;
        // dont color node dark green when level starts
        if (d != null) {
            delay = d;
        }
        const currentState = this.mdp.getCurrentState();

        // Reset all node colors to the default color, white (0xffffff)
        for (const node of this.nodes) {
            node.setFillStyle(0xffffff);
        }

        // red color
        const goalNode = this.nodes.find(
            (node) => node.getData('stateName') === this.mdp.getGoalState().name
        );
        if (goalNode) {
            goalNode.setFillStyle(0xFF6961);
        }

        // Set the color of the active state node to green (0x00ff00)
        let activeNode = this.nodes.find(
            (node) => node.getData('stateName') === currentState.name
        );
    
        
        if (activeNode) {
            activeNode.setFillStyle(0x006400);

            // Delayed callback to reset the color back to the default (green) after 2 seconds
            this.scene.time.delayedCall(delay, () => {
                if(this.mdp.getCurrentState().name == activeNode.getData('stateName')){
                    let loop= false;

                    if(this.scene.scene.key=="level-03" && this.scene.getBossLives==1 && this.mdp.getCurrentState().name=="A"){
                        const finalNode = this.nodes.find(
                            (node) => node.getData('stateName') === this.mdp.getGoalState().name
                        );
                        this.clearNode(finalNode,this.mdp.getGoalState().name,0xFF6961)
                        const nodePic = this.scene.add.sprite(
                            this.mdp.getGoalState().position.x,
                            this.mdp.getGoalState().position.y,
                            "mdpportal2",
                        ).setDisplaySize(24,24).setScrollFactor(0.01,0.01);
                        this.elements.push(nodePic);
                        this.elements.push(activeNode)
                        nodePic.setOrigin(0.5);
                        nodePic.scrollFactorX = 0.01;
                        nodePic.scrollFactorY = 0.01;
                    }
                    
                    if(((this.scene.scene.key=="level-01") && (this.prevState.name=="C" || (this.prevState.name=="A" && this.cleared==false)))
                    || ((this.scene.scene.key=="level-02") && (this.prevState.name=="E" || this.prevState.name=="G" || this.prevState.name=="B"))){
                        if (this.prevState.name===currentState.name) {
                            loop = true
                            activeNode =this.clearNode(activeNode,currentState.name,0xffffff)
                        }else if(this.beforePrevState.name === this.prevState.name){
                            if((this.scene.scene.key=="level-01") && (this.speedLimit1==false && this.prevState.name=="C" || this.prevState.name=="A")
                            || ((this.scene.scene.key=="level-02") && (this.speedLimit2==false && this.prevState.name=="E" || this.prevState.name=="G" || this.prevState.name=="B"))){
                                const nodePic = this.scene.add.sprite(
                                    this.prevState.position.x,
                                    this.prevState.position.y,
                                    this.prevState.icon,
                                ).setDisplaySize(24,24).setScrollFactor(0.01,0.01);
                                this.elements.push(nodePic);
                                this.elements.push(activeNode)
                                nodePic.setOrigin(0.5);
                                nodePic.scrollFactorX = 0.01;
                                nodePic.scrollFactorY = 0.01;
                            }
                            loop=true;
                        }
                    }
                    if(this.mdp.getCurrentState().icon=="extra" && this.scene.heart>2 && this.cleared==false){
                        activeNode = this.clearNode(activeNode, currentState.name,0xffffff)
                        this.cleared=true;
                    }  

                    if((this.scene.scene.key=="level-01") && (this.mdp.getCurrentState().name == 'B' && ++this.widthCounter1== 3)
                    || (this.scene.scene.key=="level-02") && (this.mdp.getCurrentState().name == 'B' && ++this.widthCounter2== 3)){
                        activeNode = this.clearNode(activeNode, currentState.name,0xffffff)
                    }else if(loop===false){
                        if((this.scene.scene.key=="level-01") && (this.mdp.getCurrentState().name == 'C' && (++this.speedCounter1== 3))
                        || (this.scene.scene.key=="level-02") && (this.mdp.getCurrentState().name == 'E' && (++this.speedCounter2== 3))){
                            activeNode = this.clearNode(activeNode, currentState.name,0xffffff)
                            this.speedLimit2=true
                        }
                    }
                    activeNode.setFillStyle(0x00ff00);
                    this.beforePrevState=this.prevState;
                    this.prevState=currentState;
                }
            });
        }
    }

    showHealthNode(){
        let healthState;
        console.log(this.mdp.states)
        for (const stateName in this.mdp.states) {
            const state = this.mdp.states[stateName];
            if (state.icon == "extra\r" || state.icon == "extra") {
                healthState= state;
                console.log(healthState)
            }else{
                console.log("something went wrong here")
                
                return;
            }
        }

        const activeNode = this.nodes.find(
            (node) => node.getData('stateName') === healthState.name
        );

        if(this.cleared==true && this.mdp.getCurrentState().name!=healthState.name){
            this.cleared=false;
            const nodePic = this.scene.add.sprite(
                healthState.position.x,
                healthState.position.y,
                "extra",
            ).setDisplaySize(24,24).setScrollFactor(0.01,0.01);
            this.elements.push(nodePic);
            this.elements.push(activeNode)
            nodePic.setOrigin(0.5);
            nodePic.scrollFactorX = 0.01;
            nodePic.scrollFactorY = 0.01;
        }
    }
    

    clearNode(activeNode: any, name: string, color) : any {
        
        const nodeIndex = this.nodes.indexOf(this.nodes.find((node) => node.getData('stateName') === name));
        const newNode = this.scene.add.circle(
            activeNode.x,
            activeNode.y,
            this.radius,
            color
        );
        newNode.scrollFactorX = 0.01;
        newNode.scrollFactorY = 0.01;
        newNode.setData('stateName', name);
        newNode.setVisible(this.visible);

        const nodeName = this.scene.add.text(
            activeNode.x,
            activeNode.y,
        ).setDisplaySize(24,24).setScrollFactor(0.01,0.01);
        this.elements.push(nodeName);

        nodeName.setOrigin(0.5);
        nodeName.scrollFactorX = 0.01;
        nodeName.scrollFactorY = 0.01;
        nodeName.setVisible(this.visible)

        this.nodes.splice(nodeIndex,1,newNode)
        this.elements.push(newNode);

        return newNode;
    }

    setGraphVisible() {
        if (this.visible) {
            // mach den graph sichtbar
            for (let i = 0; i < this.elements.length; i++) {
                this.elements[i].setVisible(false);
            }
        } else {
            // mach den graph unsichtbar
            for (let i = 0; i < this.elements.length; i++) {
                this.elements[i].setVisible(true);
            }
        }
        this.visible = !this.visible; // change boolean
        return this.visible;
    }
    destroyGraphElements() {
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i].destroy();
        }
        this.elements = [];
    }
}
