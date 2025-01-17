import State from "./State";

export default class MDP {
    private currentState: State;
    private goalState: State;
    states: { [key: string]: State };

    //Mdp with start and goal state
    constructor(startState: State, goalState: State) {
        this.currentState = startState;
        this.goalState = goalState;
        this.states = {};
    }

    // Add a state to the mdp
    addState(state: State) {
        if (!this.currentState) {
            this.currentState = state;
        }

        if (state.name in this.states) {
            throw new Error('State already exists');
        }

        this.states[state.name] = state;
    }

    // Set the next State if game isnt finished yet
    MDPcheck(action: string): State {
        if (!this.isGoalStateReached()) {
            const nextStateName = this.currentState.getNextState(action);
            const nextState = this.states[nextStateName];

            if (!nextState) {
                throw new Error('Invalid next state');
            }

            this.currentState = nextState;
            return this.currentState;
        }

        return this.currentState;
    }

    isGoalStateReached(): boolean {
        return this.currentState === this.goalState;
    }

    getGoalState(): State {
        return this.goalState;
    }

    getCurrentState(): State {
        return this.currentState;
    }
    setCurrentState(state : State){
        this.currentState = state;
    }

    /**
     * read content of file. First line includes all states, rest of file is all transitions
     * @param filename 
     */
    async readfile(filePath: string, width, MdpGraph): Promise<void> {
        try {
            const response = await fetch(filePath);
            if (response.ok) {
                const fileContent = await response.text();
                this.buildMdp(fileContent, width, MdpGraph);
            } else {
                throw new Error('Failed to fetch the file content.');
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    /**
     * build the MDP depending on content of str
     * @param str 
     */
    buildMdp(str : string, width, MdpGraph){
        // Access the first lines separately and add states with their coordination
        let lines = str.split(';');
        const states = lines[0].split('\n');
        for (const s of states){
            const p = s.split(',');
            const state = new State([p[0],p[3]],{x: (width - parseInt(p[1])),y: parseInt(p[2])});
            this.addState(state);
        }
        this.goalState = this.states[states[states.length-1][0]];
        this.currentState = this.states[states[0][0]];
        
        // Access the rest and add tranistions and build Graph
        lines = lines.slice(1);
        lines = lines[0].trim().split("\n") 
        MdpGraph.createNodes();   
                
        let ellipse = 0;
        for (const remLine of lines) {
            const pieces = remLine.trim().split(',');
            const f = this.states[pieces[0]];
            f.addActionTransition(pieces[2],pieces[1], parseFloat(pieces[3]));
            ellipse = MdpGraph.addEdge(this.states[pieces[0]],this.states[pieces[1]],parseInt(pieces[4]));
            MdpGraph.addActionProbability(this.states[pieces[0]], this.states[pieces[0]], ellipse, pieces[2], parseFloat(pieces[3]), parseInt(pieces[5]),parseInt( pieces[6]))
        }
    }
}