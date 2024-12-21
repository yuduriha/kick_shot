"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ks;
(function (ks) {
    var CONST = (function () {
        function CONST() {
        }
        CONST.SCENE_KEY = {
            GAME: "scene_game",
        };
        CONST.SCREEN = {
            width: 600,
            height: 800,
            BG_COLOR: 0x555555
        };
        CONST.SCREEN_CENTER = {
            x: CONST.SCREEN.width / 2,
            y: CONST.SCREEN.height / 2,
        };
        CONST.BILLIARDS_WORLD_SCALE = 0.25;
        CONST.BILLIARDS = {
            TABLE: {
                LONG: 2540 * CONST.BILLIARDS_WORLD_SCALE,
                SHORT: 1270 * CONST.BILLIARDS_WORLD_SCALE,
            },
            BALL_RADIUS: 28.5 * CONST.BILLIARDS_WORLD_SCALE
        };
        return CONST;
    }());
    ks.CONST = CONST;
})(ks || (ks = {}));
var ks;
(function (ks) {
    var DIR;
    (function (DIR) {
        DIR[DIR["RIGHT"] = 0] = "RIGHT";
        DIR[DIR["LEFT"] = 1] = "LEFT";
        DIR[DIR["TOP"] = 2] = "TOP";
        DIR[DIR["BOTTOM"] = 3] = "BOTTOM";
    })(DIR || (DIR = {}));
    ;
    var GameScene = (function (_super) {
        __extends(GameScene, _super);
        function GameScene() {
            return _super.call(this, ks.CONST.SCENE_KEY.GAME) || this;
        }
        GameScene.prototype.preload = function () {
        };
        GameScene.prototype.create = function () {
            var _this = this;
            var graphic = this.add.graphics();
            var field = new Phaser.Geom.Rectangle(ks.CONST.SCREEN_CENTER.x - ks.CONST.BILLIARDS.TABLE.SHORT / 2, ks.CONST.SCREEN_CENTER.y - ks.CONST.BILLIARDS.TABLE.LONG / 2, ks.CONST.BILLIARDS.TABLE.SHORT, ks.CONST.BILLIARDS.TABLE.LONG);
            var ballArea = new Phaser.Geom.Rectangle(field.x + ks.CONST.BILLIARDS.BALL_RADIUS, field.y + ks.CONST.BILLIARDS.BALL_RADIUS, field.width - 2 * ks.CONST.BILLIARDS.BALL_RADIUS, field.height - 2 * ks.CONST.BILLIARDS.BALL_RADIUS);
            var randBallPos = function () {
                return {
                    x: Phaser.Math.Between(ballArea.x, ballArea.x + ballArea.width),
                    y: Phaser.Math.Between(ballArea.y, ballArea.y + ballArea.height),
                };
            };
            var callbackDraw;
            var draw = function () {
                if (callbackDraw) {
                    callbackDraw();
                }
            };
            var createBall = function (pos, draw) {
                var HIT_SIZE = 50;
                var circle = new Phaser.Geom.Circle(pos.x, pos.y, ks.CONST.BILLIARDS.BALL_RADIUS);
                var hitArea = _this.add.container(pos.x, pos.y);
                hitArea.setSize(HIT_SIZE, HIT_SIZE);
                hitArea.setInteractive({ draggable: true });
                hitArea.on('drag', function (pointer, dragX, dragY) {
                    if (!Phaser.Geom.Rectangle.ContainsPoint(ballArea, new Phaser.Geom.Point(dragX, dragY)))
                        return;
                    hitArea.setPosition(dragX, dragY);
                    circle.x = dragX;
                    circle.y = dragY;
                    draw();
                });
                return {
                    circle: circle,
                    hitArea: hitArea,
                };
            };
            var pos0 = randBallPos();
            var ball0 = createBall(pos0, function () {
                draw();
            });
            var pos1 = randBallPos();
            var ball1 = createBall(pos1, function () {
                draw();
            });
            var drawHitArea = function (hit) {
                var _a, _b;
                graphic.strokeRect(hit.x - ((_a = hit.input) === null || _a === void 0 ? void 0 : _a.hitArea.centerX), hit.y - ((_b = hit.input) === null || _b === void 0 ? void 0 : _b.hitArea.centerY), hit.width, hit.height);
            };
            var dir = DIR.RIGHT;
            var CUSHION_MARGIN = 20;
            var offset = 2;
            var cushionList = [
                {
                    x: field.x + field.width / 2, y: field.y - CUSHION_MARGIN / 2 - offset,
                    w: field.width, h: CUSHION_MARGIN,
                    onSelect: function () {
                        dir = DIR.TOP;
                    }
                },
                {
                    x: field.x + field.width / 2, y: field.y + field.height + CUSHION_MARGIN / 2 + offset,
                    w: field.width, h: CUSHION_MARGIN,
                    onSelect: function () {
                        dir = DIR.BOTTOM;
                    }
                },
                {
                    x: field.x + field.width + CUSHION_MARGIN / 2 + offset, y: field.y + field.height / 2,
                    w: CUSHION_MARGIN, h: field.height,
                    onSelect: function () {
                        dir = DIR.RIGHT;
                    }
                },
                {
                    x: field.x - CUSHION_MARGIN / 2 - offset, y: field.y + field.height / 2,
                    w: CUSHION_MARGIN, h: field.height,
                    onSelect: function () {
                        dir = DIR.LEFT;
                    }
                }
            ];
            var cushionHitList = [];
            cushionList.forEach(function (area) {
                var hitArea = _this.add.container(area.x, area.y);
                hitArea.setSize(area.w, area.h);
                hitArea.setInteractive();
                hitArea.on('pointerup', function () {
                    area.onSelect();
                    draw();
                });
                cushionHitList.push(hitArea);
            });
            var cushionPoint = function () {
                var _calcPoint = function (p1, p2, linePos, q1, q2) {
                    var l1 = p1 - linePos;
                    var l2 = p2 - linePos;
                    var sum = l1 + l2;
                    var ratio = (sum === 0) ? 0.5 : l1 / sum;
                    return q1 + (q2 - q1) * ratio;
                };
                switch (dir) {
                    case DIR.RIGHT:
                        return {
                            x: field.right,
                            y: _calcPoint(ball0.circle.x, ball1.circle.x, field.right, ball0.circle.y, ball1.circle.y),
                        };
                    case DIR.LEFT:
                        return {
                            x: field.left,
                            y: _calcPoint(ball0.circle.x, ball1.circle.x, field.left, ball0.circle.y, ball1.circle.y),
                        };
                    case DIR.TOP:
                        return {
                            x: _calcPoint(ball0.circle.y, ball1.circle.y, field.top, ball0.circle.x, ball1.circle.x),
                            y: field.top,
                        };
                    case DIR.BOTTOM:
                        return {
                            x: _calcPoint(ball0.circle.y, ball1.circle.y, field.bottom, ball0.circle.x, ball1.circle.x),
                            y: field.bottom,
                        };
                }
            };
            var color = {
                _0: 0x00ff00,
                _1: 0x0000ff,
            };
            var lineDot = function (isHorizon, x0, y0, x1, y1) {
                var _a, _b;
                var DOT_LEN = 5;
                var DOT_MARGIN = 2;
                var start, end;
                var key;
                if (isHorizon) {
                    start = x0;
                    end = x1;
                    key = {
                        constant: "y",
                        constant_val: y0,
                        move: "x",
                    };
                }
                else {
                    start = y0;
                    end = y1;
                    key = {
                        constant: "x",
                        constant_val: x0,
                        move: "y",
                    };
                }
                if (end - start == 0) {
                    console.log("長さ0の点線引こうとした");
                    return;
                }
                var lineTo = end - start > 0 ? 1 : -1;
                var current = start;
                while (1) {
                    var p0 = (_a = {},
                        _a[key.constant] = key.constant_val,
                        _a[key.move] = current,
                        _a);
                    current += lineTo * DOT_LEN;
                    var p1 = (_b = {},
                        _b[key.constant] = key.constant_val,
                        _b[key.move] = current,
                        _b);
                    current += lineTo * DOT_MARGIN;
                    if (Math.abs(end - start) > Math.abs(current - start)) {
                        graphic.lineBetween(p0.x, p0.y, p1.x, p1.y);
                    }
                    else {
                        return;
                    }
                }
                ;
            };
            var alpha = 0.5;
            callbackDraw = function () {
                graphic.clear();
                graphic.lineStyle(1, 0x00ff00, alpha);
                drawHitArea(ball0.hitArea);
                drawHitArea(ball1.hitArea);
                cushionHitList.forEach(function (area) { return drawHitArea(area); });
                graphic.lineStyle(2, 0xffffff, 1);
                graphic.strokeRectShape(field);
                graphic.strokeCircleShape(ball0.circle);
                graphic.strokeCircleShape(ball1.circle);
                graphic.lineStyle(2, 0xff0000);
                var cushion = cushionPoint();
                graphic.lineBetween(ball0.circle.x, ball0.circle.y, cushion.x, cushion.y);
                graphic.lineBetween(ball1.circle.x, ball1.circle.y, cushion.x, cushion.y);
                if (dir === DIR.RIGHT || dir === DIR.LEFT) {
                    graphic.lineStyle(1, color._0, alpha);
                    lineDot(true, ball0.circle.x, ball0.circle.y, cushion.x, ball0.circle.y);
                    lineDot(false, cushion.x, ball0.circle.y, cushion.x, cushion.y);
                    graphic.lineStyle(1, color._1, alpha);
                    lineDot(true, ball1.circle.x, ball1.circle.y, cushion.x, ball1.circle.y);
                    lineDot(false, cushion.x, ball1.circle.y, cushion.x, cushion.y);
                }
                else {
                    graphic.lineStyle(1, color._0, alpha);
                    lineDot(false, ball0.circle.x, ball0.circle.y, ball0.circle.x, cushion.y);
                    lineDot(true, ball0.circle.x, cushion.y, cushion.x, cushion.y);
                    graphic.lineStyle(1, color._1, alpha);
                    lineDot(false, ball1.circle.x, ball1.circle.y, ball1.circle.x, cushion.y);
                    lineDot(true, ball1.circle.x, cushion.y, cushion.x, cushion.y);
                }
            };
            draw();
        };
        return GameScene;
    }(Phaser.Scene));
    ks.GameScene = GameScene;
})(ks || (ks = {}));
var ks;
(function (ks) {
    window.onload = function () {
        run();
    };
    function run() {
        new Phaser.Game({
            type: Phaser.AUTO,
            parent: 'phaser-canvas',
            width: ks.CONST.SCREEN.width,
            height: ks.CONST.SCREEN.height,
            backgroundColor: ks.CONST.SCREEN.BG_COLOR,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            scene: [
                ks.GameScene,
            ],
            fps: {
                target: 60
            }
        });
    }
})(ks || (ks = {}));
