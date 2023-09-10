import {Vin, Vout, VinRelay, Gate, CompositeGate, ManyToOneGate, Not, And, Or} from "./index.js";


class XorTest extends CompositeGate{
    constructor(){
        super(2,1,[...arguments]);
        this.output = this.outputs[0];
        let [i1, i2] = this.mappedInputs;
        let [i1n, i2n] = this.mappedInputs.map(relay=>new Not(relay).output);
        i1.log(v=>`Value ${v} at i1`);
        i2.log(v=>`Value ${v} at i2`);
        i1n.log(v=>`Value ${v} at i1n`);
        i2n.log(v=>`Value ${v} at i2n`);
        let a1 = new And(i1,i2n).output;
        a1.log(v=>`Value ${v} at a1`);
        let a2 = new And(i1n,i2).output;
        a1.log(v=>`Value ${v} at a2`);
        let out = new Or(a1,a2).output;
        out.log(v=>`Value ${v} at out`);
        out.connect(this.mappedOutputs[0]);
    }
}


class Xor extends CompositeGate{
    constructor(){
        super(2,1,[...arguments]);
        this.output = this.outputs[0];
        let [i1, i2] = this.mappedInputs;
        let [i1n, i2n] = this.mappedInputs.map(relay=>new Not(relay).output);
        let a1 = new And(i1,i2n).output;
        let a2 = new And(i1n,i2).output;
        let out = new Or(a1,a2).output;
        out.connect(this.mappedOutputs[0]);
    }
}

class Nand extends CompositeGate{
    constructor(){
        super(2,1,[...arguments]);
        this.output = this.outputs[0];
        let [i1, i2] = this.mappedInputs;
        let a = new And(i1,i2).output;
        let out = new Not(a).output;
        out.connect(this.mappedOutputs[0]);
    }
}


// SR Flip flop
class SR_FF extends CompositeGate{
    constructor(){
        super(2,2,[...arguments]);
        let nand1 = new Nand();
        let nand2 = new Nand();
        nand1.inputs[0].connect(nand2.output);
        nand2.inputs[0].connect(nand1.output);
        this.mappedInputs[0].connect(nand1.inputs[1]);
        this.mappedInputs[1].connect(nand2.inputs[1]);
        this.mappedOutputs[0].connect(nand1.output);
        this.mappedOutputs[1].connect(nand2.output);
    }
}

console.log("Simulating SR flip flop");
const sr = new SR_FF;
console.log(sr.getOutputValues());
sr.setInputValues([1,1]);
console.log(sr.getOutputValues());
sr.setInputValues([1,0]);
console.log(sr.getOutputValues());
sr.setInputValues([1,1]);
console.log(sr.getOutputValues());
sr.setInputValues([0,1]);
console.log(sr.getOutputValues());
sr.setInputValues([1,1]);
console.log(sr.getOutputValues());

//half adder

class HADD extends CompositeGate{
    constructor(){
        super(2,2,[...arguments]);
        let and = new And(...this.mappedInputs).output;
        let xor = new Xor(...this.mappedInputs).output;
        this.mappedOutputs[0].connect(and);
        this.mappedOutputs[1].connect(xor);
    }
}

console.log("Simulating half adder");
const hadd = new HADD;
console.log(hadd.getOutputValues());
hadd.setInputValues([0,0]);
console.log(hadd.getOutputValues());
hadd.setInputValues([0,1]);
console.log(hadd.getOutputValues());
hadd.setInputValues([1,0]);
console.log(hadd.getOutputValues());
hadd.setInputValues([1,1]);
console.log(hadd.getOutputValues());


// //simulate half adder
// const inputs = [new Vout, new Vout];
// const outputs = [new Vin, new Vin];
// 
// const and = new And(inputs[0],inputs[1]);
// And.output.connect(outputs[1]);



// let xor = new XorTest;
// let s1 = new Vout;
// let s2 = new Vout;
// s1.connect(xor.inputs[0]);
// s2.connect(xor.inputs[1]);
// 
// s1.log(v=>`value ${v} at source 1`);
// s2.log(v=>`value ${v} at source 2`);
// 
// console.log("Simulating XOR");
// 
// s1.value = 1;
// s2.value = 0;
// console.log(xor.output.value);




