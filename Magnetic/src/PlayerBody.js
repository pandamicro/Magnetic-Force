/**
 * Created by chenryoutou on 14-8-15.
 */



var Player = ccs.Armature.extend({

    _isMagnet : false,
    _isAttract : true,
    isMagnetUpdated : null,
    isAttractUpdated : null,
    mh : 0,

    weight : PLAYER_WEIGHT,
    maxSpeed : 200,
    r : 0,
    friction : PLAYER_INIT_FRICTION,
    elasticity : PLAYER_INIT_ELASTICITY,

    phyObj : null,

    _ignoreBodyRotation:false,

    isHitGround : false,
    isFrictPlaying : false,

    rocketMaxImpules : ROCKET_FORCE,
    rocketForce : null,
    rocketTime : ROCKET_FORCE_TIME,

    ctor : function(file, r, x, y) {
        this._super(file);
        this.rocketForce = cp.v(0,0);
        var size = this.getContentSize(),
            sx = r / size.width, sy = r / size.height;
        this.scale = sx > sy ? sx * 2 : sy * 2;
        this.r = r;

        this.maxSpeed = PLAYER_MAX_SPEED;

        this.initPhysics(x, y, this.r);

        //this.eatItem();


        this.fire_emitter = new cc.ParticleSystem(res.Fire_plist);
        this.fire_emitter.setPosition(0, 0);
        this.addChild(this.fire_emitter, 0);

    },

    setMagnet : function(magnet) {
        this._isMagnet = magnet;
        if (this.isMagnetUpdated)
            this.isMagnetUpdated();
    },
    getMagnet : function() {
        return this._isMagnet;
    },

    setAttract : function(attract) {
        this._isAttract = attract;
        if (this.isAttractUpdated)
            this.isAttractUpdated();
    },
    getAttract : function() {
        return this._isAttract;
    },

    initPhysics : function (x, y, r) {
        var origin = cc.p(x, y);

        this.phyObj = new CircleObject(this.weight, r, this.maxSpeed, this, origin);
        this.phyObj.setFriction(this.friction);
        this.phyObj.setElasticity(this.elasticity);
//        var body = this.phyObj.body;
//        body.setMoment(Infinity);
        this.phyObj.shape.setCollisionType(Player.COL_TYPE);
    },

    phyUpdate : function(dt) {
        var pos = this.phyObj.getPosition();
        this.x = pos.x;
        this.y = pos.y;
        this.rotation = -180 * this.phyObj.body.a / Math.PI;
        if (!this.isRocketOpen && this.rocketTime > 0) {
//            console.log("rock");
            this.rocketTime -= dt;
            this.calculateForce();
//            console.log("lllll");
        }
        else
        {
            this.calculateForce(cp.v(0,0));
        }
    },

//
//    jump : function (factor){
////        factor = factor || 1;
////        if(this.y < PLAYER_JUMP_TOP){
////            this.phyObj.body.vy += PLAYER_JUMP_ADD_SPEED_Y * factor;
////        }
//
//        if (!this.isJump){
//            this.isJump = true;
//
////            this.jump_f = cp.v(0, PLAYER_JUMP_FORCE); // be used in magnetic system.
//        }
//    },



    hitGround : function (point){
        if (this.fire_emitter) {
            var emitter_pos = this.convertToNodeSpace(point);
            this.fire_emitter.setPosition( emitter_pos );
        }

        if (this.isHitGround){

            return;
        }
        this.isHitGround = true;
        this.scheduleOnce(this.resetHitGround, PLAYER_PARTICLE_RESET_POS_INTERVAL);

        if(!this.isFrictPlaying && this.y < 100){

//            var v = cp.v(this.phyObj.body.vx, this.phyObj.body.vy);
//            var veloci = Math.pow(v.x * v.x + v.y * v.y, 1/2);
            var vx = this.phyObj.body.vx;

//            console.log(veloci);
//            console.log(vx);
            if(Math.abs(vx) > 130 ){
                this.isFrictPlaying = true;

                cc.audioEngine.playEffect(res.Frict1_ogg , false);
                this.scheduleOnce(this.resetFrictPlaying, 3.5);
            }
        }
    },
    resetFrictPlaying : function() {
        this.isFrictPlaying = false;
    },
    resetHitGround : function(){
        this.isHitGround = false;
        this.fire_emitter.setPosition(cc.p(0, 0));
    },

    eatItem : function () {
        // create sprite sheet
//        cc.spriteFrameCache.addSpriteFrames(res.Robot_plist);
//        this.spriteSheet = cc.SpriteBatchNode.create(res.Robot_png);
//        this.addChild(this.spriteSheet);
//
//        // init runningAction
//        var animFrames = [];
//        for (var i = 0; i < 8; i++) {
//            var str = "runner" + i + ".png";
//            var frame = cc.spriteFrameCache.getSpriteFrame(str);
//            animFrames.push(frame);
//        }
//
//        var animation = cc.Animation.create(animFrames, 0.1);
//        this.runningAction = cc.RepeatForever.create(cc.Animate.create(animation));

//        var frameCache = cc.spriteFrameCache;
//        frameCache.addSpriteFrames(res.Robot_plist);
//        var animCache = cc.animationCache;
//        animCache.addAnimations(res.Robot_plist);
//
//        var mouthOpen = animCache.getAnimation("Awaiting");
//        mouthOpen.setRestoreOriginalFrame(true);
//
//        this.runAction(cc.animate(mouthOpen));

    },
    /**
     * player armature animation play
     * @param index the animation index
     */
    repulsion : function (index) {
        var old_index = this.getAnimation().getCurrentMovementID();
        var current_name = this.getAnimation().getAnimationData().movementNames[index];
//        console.log(current_name);
        if (old_index !== current_name) {

            this.getAnimation().playWithIndex(index);
        }

    },
    attraction : function (index) {
        var old_index = this.getAnimation().getCurrentMovementID();
        var current_name = this.getAnimation().getAnimationData().movementNames[index];
//        console.log(current_name);
        if (old_index !== current_name) {

            this.getAnimation().playWithIndex(index);
        }
    },
    normal : function (index) {
        var old_index = this.getAnimation().getCurrentMovementID();
        var current_name = this.getAnimation().getAnimationData().movementNames[index];
//        console.log(current_name);
        if (old_index !== current_name) {

            this.getAnimation().playWithIndex(index);
        }
    },

    isRocketOpen : true,
//    jump_f : cp.v(0,0),
    setRocket : function(isOpen){
        this.isRocketOpen = isOpen;
        this.rocketTime = ROCKET_FORCE_TIME;
//        console.log("reset " + this.isRocketOpen + ",time : " + this.rocketTime);
//        this.jump_f.x = 0;
//        this.jump_f.y = 0;
    },
    /**
     * player will be go by rocket
     */
    rocketEject : function(){
//        console.log("open "+ this.isRocketOpen);
        if (this.isRocketOpen) {

            this.setRocket(false);
//            this.isRocketOpen = false;
            this.setScale(PLAYER_SCALE,PLAYER_SCALE);
            var sinR = this.phyObj.body.rot.y;
            var cosR = this.phyObj.body.rot.x;
            var impules = cp.v(-ROCKET_IMPULSE * sinR,ROCKET_IMPULSE * cosR);
            this.phyObj.body.applyImpulse(impules,cp.v(0,0));
        }
    },
    calculateForce : function (force) {
        if (force) {
            this.rocketForce = force;
        }else{
            var center_pos = this.phyObj.body.getPos();
            var radius = this.r;
            var sinR = this.phyObj.body.rot.y;
            var cosR = this.phyObj.body.rot.x;


            var button_pos = pAddp(center_pos,cp.v(-radius * sinR,-radius * cosR));
//            console.log("angel : " + this.phyObj.body.a);
            var current_force = ROCKET_FORCE  * (this.rocketTime / ROCKET_FORCE_TIME) * ROCKET_FORCE_TIME_RATE;
            this.rocketForce = cp.v(-current_force * sinR,current_force * cosR);
//            console.log("force : " + this.rocketForce.x + ",y : " + this.rocketForce.y);
        }

//        this.phyObj.body.applyImpulse(impulse,cp.v(0,0));

    }



});

var p = Player.prototype;
cc.defineGetterSetter(p, "isMagnet", p.getMagnet, p.setMagnet);
cc.defineGetterSetter(p, "isAttract", p.getAttract, p.setAttract);

Player.COL_TYPE = GLOBAL_COL_TYPE++;
