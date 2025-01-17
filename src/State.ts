export default class State {
    name: string;
    // Array of Transitions for a certain action (key)
    transitions: { [key: string]: { nextState: string; probability: number }[] };
    position: {x: number; y: number};
    icon:string

    constructor(name: Array<string>, position: { x: number; y: number }) {
        this.name = name.at(0);
        this.transitions = {};
        this.position = position;
        if(name.length>1){
            this.icon=name.at(1);
        }
    }
    
    // Adds a Transition the to current state to a next State, that corresponds to an action ("Killing a monster"), with a certain probability
    addActionTransition(action: string, nextState: string, probability: number) {
        if (probability < 0 || probability > 1) {
            throw new Error('Invalid probability');
        }
        // create list if action doesnt exist
        if (!this.transitions[action]) {
            this.transitions[action] = [];
        }
        // push new transition for the action
        this.transitions[action].push({ nextState, probability });
    }

    // Returns the name of the next state
    getNextState(action: string): string {
        // If action doesnt exist (no transition for an action), stay at the same state
        if (!(action in this.transitions)) {
            return this.name
        }

        const possibleTransitions = this.transitions[action];
        // Sum of probabilty of all the transitions for a specific action
        const totalProbabilities = 
        possibleTransitions.reduce(
            (sum, transition) => sum + transition.probability, 0
        );
        if(totalProbabilities > 1){
            throw new Error('Invalid probability');
        }
        const random = Math.random() * totalProbabilities;

        let cumulativeProbability = 0;
        // chose one of the transitions for the specific action
        for (const transition of possibleTransitions) {
            cumulativeProbability += transition.probability;
            if (random <= cumulativeProbability) {
                return transition.nextState;
            }
        }

        // If no transition is selected, return the current state
        return this.name;
    }
}