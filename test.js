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

class AddCarry extends CompositeGate{
    constructor(){
        super(3,2,[...arguments]);
        let [i1,i2,i3] = this.mappedInputs;
        let xor12 = new Xor(i1,i2).output;
        let p1 = new Xor(xor12,i3).output;
        let p2 = new Or(new And(i1,i2).output,new And(xor12,i3).output).output;
        this.mappedOutputs[0].connect(p2);
        this.mappedOutputs[1].connect(p1);
    }
}

const intToBits = function(n){
    let arr = [];
    for(let i = 31; i >= 0; i--){
        arr.push((n>>>i)&1);
    }
    return arr;
}

const ac = new AddCarry;

console.log("Adder component");
for(let i = 0; i < 8; i++){
    const input = intToBits(i).slice(-3);
    ac.setInputValues(input);
    console.log(input,ac.getOutputValues());
}


class Add32 extends CompositeGate{
    constructor(){
        super(64,32,[...arguments]);
        let inputs = this.mappedInputs;
        let a2 = new HADD(inputs[31],inputs[63]);
        let carry = a2.outputs[0];
        this.mappedOutputs[31].connect(a2.outputs[1]);
        for(let i = 30; i >= 0; i--){
            let a3 = new AddCarry(inputs[i],inputs[i+32],carry);
            carry = a3.outputs[0];
            this.mappedOutputs[i].connect(a3.outputs[1]);
        }
    }
}




class AddN extends CompositeGate{
    constructor(n,...args){
        super(n*2,n,args);
        let inputs = this.mappedInputs;
        let a2 = new HADD(inputs[n-1],inputs[n*2-1]);
        let carry = a2.outputs[0];
        this.mappedOutputs[n-1].connect(a2.outputs[1]);
        for(let i = n-2; i >= 0; i--){
            let a3 = new AddCarry(inputs[i],inputs[i+n],carry);
            carry = a3.outputs[0];
            this.mappedOutputs[i].connect(a3.outputs[1]);
        }
    }
}

let add32 = new AddN(32);
add32.setInputValues([...intToBits(114514),...intToBits(1919)]);
console.log(parseInt(add32.getOutputValues().join(""),2),114514+1919,add32.getOutputValues());


class BitsAndN extends CompositeGate{
    constructor(n,...args){
        super(n+1,n,args);
        let inputs = this.mappedInputs.slice(0,n);
        let flag = this.mappedInputs[n];
        for(let i = 0; i < inputs.length; i++){
            this.mappedOutputs[i].connect(new And(inputs[i],flag).output);
        }
    }
}

class MulN extends CompositeGate{
    constructor(n,...args){
        super(n*2,n,args);
        let inputs = this.mappedInputs;
        let digits1 = inputs.slice(0,n);
        let digits2 = inputs.slice(n);
        let acc = new BitsAndN(n,...digits1,digits2[n-1]).outputs;
        let res = [];
        res[n-1] = acc.pop();
        for(let k = n-1; k > 0; k--){
            console.log(k);
            let filteredDigits = new BitsAndN(k,...digits1.slice(-k),digits2[k-1]).outputs;
            acc = new AddN(k,...acc,...filteredDigits).outputs;
            res[k-1] = acc.pop();
        }
        for(let i = 0; i < n; i++){
            this.mappedOutputs[i].connect(res[i]);
        }
    }
}

let mul32 = new MulN(32);
mul32.setInputValues([...intToBits(114514),...intToBits(1919)]);
console.log(parseInt(mul32.getOutputValues().join(""),2),114514*1919,mul32.getOutputValues());
console.log((114514*1919).toString(2));


class Float{
    constructor(arr){
        this.sign = arr[0];
        this.exp = arr.slice(1,9);
        this.frac = arr.slice(9);
    }
}

class IEEE754_mul32{
    constructor(...args){
        super(64,32,args);
        let inputs = this.mappedInputs;
        let float1 = new Float(inputs.slice(0,n));
        let float2 = new Float(inputs.slice(n));
        let result = [];
        result[0] = new Xor(float1.sign,float2.sign).output;
        //add the exponent part



    }
}




