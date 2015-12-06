/// <reference path="easeljs/easeljs.d.ts" />
window.addEventListener("load", function() {
		new project.Main();
});
var project;
(function(project) {
		/**
		 * パーティクルデモのメインクラスです。
		 * @class project.Main
		 */
		var Main = (function() {
				/**
				 * @constructor
				 */
				function Main() {
								var _this = this;
								this.pathList = [];
								this.mousePositions = [];
								var canvasForEasel = document.createElement("canvas");
								this.stageEaselJS = new createjs.Stage(canvasForEasel);
								this.canvasForDisplay = document.getElementById("myCanvas");
								this.stageForDisplay = new createjs.Stage(this.canvasForDisplay);
								this.canvasForFadeout = document.createElement("canvas");
								if (createjs.Touch.isSupported()) {
										createjs.Touch.enable(this.stageForDisplay);
								}
								// Tickerを作成
								createjs.Ticker.timingMode = createjs.Ticker.RAF;
								createjs.Ticker.on("tick", this.handleTick, this);
								// 親子構造
								this.shapeCurve = new createjs.Shape();
								this.shapeCurve.mouseEnabled = true;
								this.stageEaselJS.addChild(this.shapeCurve);
								//document.body.appendChild(canvasForEasel)
								var max = 100;
								for (var i = 0; i < max; i++) {
										var p = new Path();
										p.setup(0, 0, 0.1 + i / max * 0.05, (20 * Math.random() * Math.random()) >> 0, i / max);
										this.pathList.push(p);
								}
								// リサイズイベント
								this.handleResize();
								window.addEventListener("resize", function() {
										_this.handleResize();
								});
						}
						/**
						 * エンターフレームイベント
						 */
				Main.prototype.handleTick = function() {
						var gCurve = this.shapeCurve.graphics;
						// 描画をリセット
						gCurve.clear().setStrokeStyle(1);
						var stageX = this.stageForDisplay.mouseX;
						var stageY = this.stageForDisplay.mouseY;
						this.mousePositions.unshift(new createjs.Point(stageX, stageY));
						for (var i = 0; i < this.pathList.length; i++) {
								var p = this.pathList[i];
								if (this.mousePositions.length > p.delayFrame) {
										var position = this.mousePositions[p.delayFrame];
										//    マウスの位置更新
										p.setMousePosition(position.x, position.y);
								}
								p.update();
						}
						for (var i = 0; i < this.pathList.length - 1; i++) {
								var p = this.pathList[i];
								// マウスの軌跡を変数に保存
								var p0x = p.point.x;
								var p0y = p.point.y;
								var p1x = p.prev.x;
								var p1y = p.prev.y;
								var p2x = p.prev2.x;
								var p2y = p.prev2.y;
								// カーブ用の頂点を割り出す
								var curveStartX = (p2x + p1x) / 2;
								var curveStartY = (p2y + p1y) / 2;
								var curveEndX = (p0x + p1x) / 2;
								var curveEndY = (p0y + p1y) / 2;
								// カーブは中間点を結ぶ。マウスの座標は制御点として扱う。
								gCurve.beginStroke(createjs.Graphics.getHSL((new Date().getTime() / 10) + (220 + (p.percent) * 90), 35, 20 + Math.random() * 30)).moveTo(curveStartX, curveStartY).curveTo(p1x, p1y, curveEndX, curveEndY).endStroke();
						}
						var contextForDisplay = this.canvasForDisplay.getContext("2d");
						var contextFadeout = this.canvasForFadeout.getContext("2d");
						contextForDisplay.setTransform(1, 0, 0, 1, 0, 0);
						contextForDisplay.globalAlpha = 0.97;
						contextForDisplay.clearRect(0, 0, innerWidth, innerHeight);
						contextForDisplay.drawImage(this.canvasForFadeout, 0, 0);
						contextFadeout.clearRect(0, 0, innerWidth, innerHeight);
						contextFadeout.globalCompositeOperation = "lighter";
						contextFadeout.drawImage(this.canvasForDisplay, 0, 0);
						this.stageEaselJS.update();
						contextFadeout.drawImage(this.stageEaselJS.canvas, 0, 0);
				};
				/**
				 * リサイズイベント
				 */
				Main.prototype.handleResize = function() {
						this.stageEaselJS.canvas.width = innerWidth;
						this.stageEaselJS.canvas.height = innerHeight;
						this.canvasForDisplay.width = innerWidth;
						this.canvasForDisplay.height = innerHeight;
						this.canvasForFadeout.width = innerWidth;
						this.canvasForFadeout.height = innerHeight;
				};
				return Main;
		})();
		project.Main = Main;
		var Path = (function() {
				function Path() {
								this.prev = new createjs.Point();
								this.prev2 = new createjs.Point();
								this.point = new createjs.Point();
								this.mouse = new createjs.Point();
								this.accel = 1;
						}
						/**
						 *
						 * @param x
						 * @param y
						 * @param _accele    マウスから離れて行く時の加速値
						 * @param _slowdown
						 * @param _maxspeed
						 */
				Path.prototype.setup = function(x, y, _accele, delayFrame, percent) {
						if (x === void 0) {
								x = 0;
						}
						if (y === void 0) {
								y = 0;
						}
						if (_accele === void 0) {
								_accele = 0.1;
						}
						if (delayFrame === void 0) {
								delayFrame = 0;
						}
						if (percent === void 0) {
								percent = 0.0;
						}
						this.prev2.x = this.prev.x = this.point.x = x;
						this.prev2.y = this.prev.y = this.point.y = y;
						this.delayFrame = delayFrame;
						this.percent = percent;
						//初期化
						this.vx = this.vy = 0.0;
						this.xx = innerWidth / 2 >> 0;
						this.yy = innerHeight / 2 >> 0;
						this.ac = _accele;
						this.de = 0.90;
						this.wd = 0.05;
						this.px0 = this.px1 = this.xx;
						this.py0 = this.py1 = this.yy;
				};
				Path.prototype.setMousePosition = function(x, y) {
						this.mouse.x = x;
						this.mouse.y = y;
				};
				Path.prototype.update = function() {
						this.prev2.x = this.prev.x;
						this.prev2.y = this.prev.y;
						this.prev.x = this.point.x;
						this.prev.y = this.point.y;
						// 参考
						// http://gihyo.jp/design/feature/01/frocessing/0004?page=1
						var px = this.xx;
						var py = this.yy;
						//加速度運動
						this.vx += (this.mouse.x - this.xx) * this.ac;
						this.vy += (this.mouse.y - this.yy) * this.ac;
						this.xx += this.vx;
						this.yy += this.vy;
						//新しい描画座標
						var x0 = px + this.vy * this.wd;
						var y0 = py - this.vx * this.wd;
						var x1 = px - this.vy * this.wd;
						var y1 = py + this.vx * this.wd;
						//描画座標
						this.px0 = x0;
						this.py0 = y0;
						this.px1 = x1;
						this.py1 = y1;
						//減衰処理
						this.vx *= this.de;
						this.vy *= this.de;
						this.point.x = this.xx;
						this.point.y = this.yy;
				};
				return Path;
		})();
})(project || (project = {}));
//# sourceMappingURL=main.js.map