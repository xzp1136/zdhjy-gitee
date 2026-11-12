// Pool interaction/motion tests isolate rendering; the material equations and
// independent render roots are tested against real data in flower-water.cjs.
exports.FlowerWaterRenderer=class {
 static async preload(){}static async create(){return new this();}
 sync(){}order(){}take(_id,image){image.node.active=true;image.customMaterial=null;}applySurface(){}dispose(){}
};
