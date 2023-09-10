export class Vin{
    constructor(owner,index){
        this.owner = owner;
        this.index = index;
    }
    source = null;
    connect(vout){
        if(this.source)this.source.disconnect(this);
        this.source = vout;
        vout.add(this);
    }
    disconnect(vout){
        vout.delete(this);
        this.source = null;
    }
    get value(){
        if(this.source === null)throw new Error("The source is null. Cannot read the value.");
        return this.source.value;
    }
    destroy(){
        if(this.source === null)return;
        this.source.disconnect(this);
    }
    update(){
        this.owner.update();
    }
}

export class Vout{
    constructor(owner,index){
        this.owner = owner;
        this.index = index;
    }
    _value = 2;
    connect(vin){
        vin.connect(this);
    }
    disconnect(vin){
        vin.disconnect(this);
    }
    vins = new Set;
    add(vin){
        this.vins.add(vin);
    }
    delete(vin){
        this.vins.delete(vin);
    }
    destroy(){
        for(let vin of this.vins){
            vin.disconnect(this);
        }
    }
    log(cb){
        this.logcb = cb;
    }
    set value(val){
        if(val === this._value)return;
        if(this.logcb)console.log(this.logcb(val));
        this._value = val;
        for(let vin of this.vins){
            vin.update();
        }
    }
    get value(){
        return this._value;
    }
}


export class VinRelay extends Vin{
    destination = null;// single link so no GC necessary
    update(){
        this.destination.value = this.value;
    }
}

export class Gate{
    inputs = [];
    changeIOSize(arr,n,constructor){
        if(n > arr.length){
            for(let i = arr.length; i < n; i++){
                arr.push(new constructor(this,i));
            }
            return;
        }
        //if it's shorter then destroy the rest
        for(let i = arr.length-1; i >= n; i--){
            arr.pop().destroy();
        }
    }
    setInputSize(n){
        this.changeIOSize(this.inputs,n,Vin);
    }
    outputs = [];
    setOutputSize(n){
        this.changeIOSize(this.outputs,n,Vout);
    }
    getOutputValues = function(){
        return this.outputs.map(v=>v.value)
    }
}


export class CompositeGate extends Gate{
    constructor(insize,outsize,args){
        super();
        this.setInputSize(insize);
        this.setOutputSize(outsize);
        for(let i = 0; i < args.length; i++){
            this.inputs[i].connect(args[i]);
        }
    }
    mappedInputs = [];
    setInputSize(n){
        let n0 = this.inputs.length;
        this.changeIOSize(this.inputs,n,VinRelay);
        this.changeIOSize(this.mappedInputs,n,Vout);
        for(let i = n0; i < n; i++){
            this.inputs[i].destination = this.mappedInputs[i];
        }
    }
    mappedOutputs = [];
    setOutputSize(n){
        let n0 = this.outputs.length;
        this.changeIOSize(this.mappedOutputs,n,VinRelay);
        this.changeIOSize(this.outputs,n,Vout);
        for(let i = n0; i < n; i++){
            this.mappedOutputs[i].destination = this.outputs[i];
        }
    }
    setInputValues = function(vals){
        for(let i = 0; i < vals.length; i++){
            this.mappedInputs[i].value = vals[i];
        }
    }
}

export class Not extends Gate{
    constructor(vout){
        super();
        this.setInputSize(1);
        this.setOutputSize(1);
        this.input = this.inputs[0];
        this.output = this.outputs[0];
        if(vout){
            this.input.connect(vout);
        }
    }
    update(){
        let v1 = this.input.value;
        if(v1 === 2)return 2;
        this.output.value = v1 === 0 ? 1 : 0;
    }
}

export class ManyToOneGate extends Gate{
    constructor(i_size = 0){
        super();
        this.setOutputSize(1);
        this.output = this.outputs[0];
        if(typeof i_size === "number"){
            this.setInputSize(i_size);
            return;
        }
        this.setInputSize(arguments.length);
        for(let i = 0; i < arguments.length; i++){
            this.inputs[i].connect(arguments[i]);
        }
        return;
    }
}

export class And extends ManyToOneGate{
    update(){
        let val = 1;
        for(let input of this.inputs){
            let v1 = input.value;
            if(v1 === 0){
                val = 0;
                break;
            }else if(v1 === 2){
                val = 2;
            }
        }
        this.output.value = val;
    }
}

export class Or extends ManyToOneGate{
    update(){
        let val = 0;
        for(let input of this.inputs){
            let v1 = input.value;
            if(v1 === 1){
                val = 1;
                break;
            }else if(v1 === 2){
                val = 2;
            }
        }
        this.output.value = val;
    }
}




