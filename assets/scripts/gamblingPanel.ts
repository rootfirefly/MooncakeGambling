import { _decorator, Component, Node, EventTouch, game, PhysicsSystem, Camera, geometry, Vec3, Collider, RigidBody, Label, ProgressBar, Vec2, BoxCollider, MeshCollider, Sprite, ICollisionEvent } from 'cc';
import { AudioManager } from './audioManager';
import { ResourceUtil } from './resourceUtil';
import { Rule } from './rule';
const { ccclass, property } = _decorator;

let _tempVec3 = new Vec3;
let _tempVec3_2 = new Vec3;
let _tempAABB = new geometry.AABB;


@ccclass('GamblingPanel')
export class GamblingPanel extends Component {
    @property(Node)
    public touchPanel: Node;

    @property(Camera)
    public mainCamera: Camera;

    @property(Node)
    public throwNode: Node;

    @property(Node)
    public dicesNode: Node;

    @property(Node)
    public bowlNode: Node;

    @property(Label)
    public resultLabel: Label;

    @property(Sprite)
    public resultSprite: Sprite;

    @property(ProgressBar)
    public progress: ProgressBar

    @property
    angular: number = 10;
    @property
    linear: number = 0.5;

    private _ray: geometry.Ray = new geometry.Ray;

    private _dices: Node[] = [];
    private _targetPositions: Vec3[] = [];
    private _isThrowing = false;
    private _isOver = true;

    private _ratio = 0;

    private _rule = new Rule();
    private _throwTime: number = 0;
    private _isAdd: boolean = true;

    private _bowlAABB: geometry.AABB = new geometry.AABB;
    private _outSizeSphere: geometry.Sphere = new geometry.Sphere(0, 1.3, 0, 1.5);

    start () {
        AudioManager.instance.init();

        this._dices = this.dicesNode.children.concat();
        this.resultLabel.string = "请抓起骰子进行游戏";

        let collider = this.bowlNode.getComponent(MeshCollider);
        // geometry.AABB.copy(this._bowlAABB, collider!.worldBounds)
        collider!.on('onCollisionEnter', this._onCollisionBowl, this);
    }

    /**
     * 当碰撞到碗到时候
     */
    private _onCollisionBowl (event: ICollisionEvent) {
        if (!this._isOver) {
            let rigidBody = event.otherCollider.node.getComponent(RigidBody);
            rigidBody?.getLinearVelocity(_tempVec3);
            if (_tempVec3.length() > 0.1) {
                AudioManager.instance.playSound(`rand${Math.floor(Math.random() * 4) + 1}`);
            }
        }
    }

    onEnable () {
        this.touchPanel.on(Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.touchPanel.on(Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.touchPanel.on(Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.touchPanel.on(Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    onDisable () {
        this.touchPanel.off(Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.touchPanel.off(Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.touchPanel.off(Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.touchPanel.off(Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    /**
     * 抓起骰子的时候计算骰子坐标
     */
    public mergeDices () {
        // 聚合起来
        this._targetPositions.length = 0;
        this._targetPositions.push(new Vec3);
        for (let i = 1; i < this._dices.length; i++) {
            Vec3.subtract(_tempVec3, this._dices[i].position, this._dices[0].position)
            _tempVec3.y = 0;
            Vec3.normalize(_tempVec3, _tempVec3);
            Vec3.multiplyScalar(_tempVec3, _tempVec3, 0.01)
            this._targetPositions.push(_tempVec3.clone());
        }
    }

    private _onTouchStart (eventTouch: EventTouch) {
        if (!this._isOver) {
            return false;
        }

        AudioManager.instance.playSound("pick");

        this.resultLabel.enabled = false;
        // this.resultLabel.string = "请注意力度";
        this.progress.node!.parent!.active = true;
        this.resultSprite.spriteFrame = null;
        this.resultSprite.node.active = false;

        this._throwTime = Date.now();
        this._isThrowing = true;
        this._dices.forEach((dice: Node) => {
            dice.getComponent(RigidBody)!.useGravity = false;
        });

        let hitPoint = this._getHitPoint(eventTouch)
        this.throwNode.setPosition(hitPoint);

        this._dices.sort((o1, o2) => {
            return Vec3.distance(o1.worldPosition, hitPoint) - Vec3.distance(o2.worldPosition, hitPoint)
        });
        this.mergeDices();
    }

    /**
     * 获取触摸点转换到3d空间的触摸点
     * @param eventTouch 
     * @returns 
     */
    private _getHitPoint (eventTouch: EventTouch) {
        this.mainCamera.screenPointToRay(eventTouch.getLocation().x, eventTouch.getLocation().y, this._ray);
        let hasHit = PhysicsSystem.instance.raycast(this._ray);
        if (hasHit) {
            let hitResults = PhysicsSystem.instance.raycastResults;
            for (let i = 0; i < hitResults.length; i++) {
                if (hitResults[i].collider.node.name == "throwPanel") {
                    return hitResults[i].hitPoint;
                }
            }
        }
        return new Vec3;
    }

    private _onTouchMove (eventTouch: EventTouch) {
        if (!this._isThrowing) {
            return;
        }
        let hitPoint = this._getHitPoint(eventTouch)
        this.throwNode.setPosition(hitPoint);
    }

    private _onTouchEnd (eventTouch: EventTouch) {
        if (!this._isThrowing) {
            return;
        }
        let subTime = Date.now() - this._throwTime;

        this.scheduleOnce(() => {
            this.throwDices();
        }, Math.max(0, 0.3 - subTime / 1000))
    }

    /**
     * 扔骰子
     */
    public throwDices () {
        this._isThrowing = false;
        this._isOver = false;
        this.progress.node!.parent!.active = false;

        this._ratio = this.progress.progress;
        let angular = (this._ratio + 1) * this.angular;
        let linear = (this._ratio + 1) * this.linear;

        this._dices.forEach((dice: Node) => {
            dice.getComponent(RigidBody)!.useGravity = true;
            // 随机一个旋转力
            dice.getComponent(RigidBody)!.setAngularVelocity(new Vec3(Math.random() * angular - angular / 2, 0, Math.random() * angular - angular / 2))

            // 根据坐标添加一个外扩方向力
            Vec3.subtract(_tempVec3, dice.worldPosition, this._targetPositions[0]);
            Vec3.normalize(_tempVec3, _tempVec3);
            Vec3.multiplyScalar(_tempVec3, _tempVec3, 10 + 10 * this._ratio);
            //  设置向下施加的力
            _tempVec3.y = -1 - 3 * this._ratio;
            dice.getComponent(RigidBody)!.setLinearVelocity(_tempVec3.clone());
        });
    }

    update (deltaTime: number) {
        if (this._isThrowing) {
            if (this._isAdd) {
                this.progress.progress += deltaTime;
                if (this.progress.progress >= 1) {
                    this._isAdd = false;
                }
            } else {
                this.progress.progress -= deltaTime;
                if (this.progress.progress <= 0) {
                    this._isAdd = true;
                }
            }

            if (this._targetPositions.length > 0) {
                this._dices.forEach((dice, index) => {
                    dice.getComponent(RigidBody)!.clearState();
                    dice.getPosition(_tempVec3);
                    Vec3.add(_tempVec3_2, this._targetPositions[index], this.throwNode.worldPosition)
                    Vec3.lerp(_tempVec3, _tempVec3, _tempVec3_2, deltaTime * 5);
                    dice.setWorldPosition(_tempVec3)
                })
            }
        }

        if (!this._isOver) {
            this.checkOver();
        }
    }

    /**
     * 检查是否结束
     * @returns 
     */
    public checkOver () {

        for (let i = 0; i < this._dices.length; i++) {
            let dice = this._dices[i];
            if (!this._checkInBowl(dice)) {
                this._isOver = true;
                ResourceUtil.setSpriteFrame("texture/th", this.resultSprite);
                this.resultSprite.node.active = true;

                AudioManager.instance.playSound(`lost`);
                return;
            }
        }

        let allStop = true;
        this._dices.forEach((dice) => {
            let rigidBody = dice.getComponent(RigidBody);
            if (!rigidBody!.isSleeping) {
                allStop = false;
            }
        });

        if (allStop) {
            this._isOver = true;
            let pointList: number[] = [];
            for (let i = 0; i < this._dices.length; i++) {
                let dice = this._dices[i];
                pointList.push(this.getDicePoint(dice));


            }
            console.log("pointList", pointList);
            let result = this._rule.checkList(pointList);;

            //this.resultLabel.string = result.label;
            ResourceUtil.setSpriteFrame("texture/" + result.image, this.resultSprite);
            this.resultSprite.node.active = true;
            if (result.hasOwnProperty("see")) {
                AudioManager.instance.playSound(result.see);
            } else {
                AudioManager.instance.playSound("win");
            }
        }
    }

    /**
     *  获取当前点数
     * @param dice 
     * @returns 
     */
    public getDicePoint (dice: Node) {
        let num = 0;
        let maxHeight = 0;
        dice.children.forEach((node) => {
            if (node.name.indexOf("num") != -1) {
                if (node.worldPosition.y > maxHeight) {
                    num = Number(node.name.substring(3));
                    maxHeight = node.worldPosition.y;
                }
            }
        });

        return num;
    }

    private _checkInBowl (dice: Node) {
        // obbCapsule
        let collider = dice.getComponent(BoxCollider);
        geometry.AABB.copy(_tempAABB, collider!.worldBounds);
        //   return geometry.intersect.aabbWithAABB(_tempAABB, this._bowlAABB);
        return geometry.intersect.sphereAABB(this._outSizeSphere, _tempAABB);
    }

}

