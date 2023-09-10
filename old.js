/*
//defining the interface


const circuit = new Circuit();

// Ring buffer of gates to process
*/


// just a dumb object oriented implementation



class Wire{
    // just stores the signal
    _value = 0;
    dependents = new Set;
    get value(){
        return this._value;
    }
    set value(val){
        if(val === this._value)return;
        this._value = val;
        for(let dependent of dependents){
            dependent.update();
        }
    }
}


class Gate{
    // update()
}

class NOT extends Gate{
    output = new Wire;
    constructor(input){
        this.input = input;
        input.dependents.add(this);
    }
    update(){
        this.output.value = this.input.value === 0 ? 1 : 0;
    }
}

class ManyToOne extends Gate{
    output = new Wire;
    inputs = new Set;
    constructor(...inputs){
        if(inputs[0] instanceof Array)inputs = inputs[0];
        for(let wire of inputs){
            wire.dependents.add(this);
            this.inputs.add(wire);
        }
    }
}

class ManyToMany extends Gate{
    outputs = new Set;
    inputs = new Set;
    constructor(...inputs){
        if(inputs[0] instanceof Array)inputs = inputs[0];
        for(let wire of inputs){
            wire.dependents.add(this);
            this.inputs.add(wire);
        }
    }
}


class OR extends ManyToOne{
    update(){
        let val = 0;
        for(let wire of this.wires){
            if(wire.value === 1){
                val = 1;
                break;
            }
        }
        this.output.value = val;
    }
}

class AND extends ManyToOne{
    update(){
        let val = 1;
        for(let wire of this.wires){
            if(wire.value === 0){
                val = 0;
                break;
            }
        }
        this.output.value = val;
    }
}

const inputs = new Array(8).fill(0).map(_=>new Wire);

class HalfAdder extends ManyToMany{
    constructor(){
        const and = new And;
        and.inputs[0].
    }
    update(){
    }
}








