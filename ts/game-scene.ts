namespace ks {
	// クッションの方向
	enum DIR {
		RIGHT,
		LEFT,
		TOP,
		BOTTOM,
	};

	export class GameScene extends Phaser.Scene {
		constructor() {
			super(CONST.SCENE_KEY.GAME);
		}
		preload() {
		}
		create() {
			const graphic = this.add.graphics();

			// 台
			const field = new Phaser.Geom.Rectangle(CONST.SCREEN_CENTER.x - CONST.BILLIARDS.TABLE.SHORT / 2,
				CONST.SCREEN_CENTER.y - CONST.BILLIARDS.TABLE.LONG / 2,
				CONST.BILLIARDS.TABLE.SHORT,
				CONST.BILLIARDS.TABLE.LONG);

			// ボールが移動できる範囲
			const ballArea = new Phaser.Geom.Rectangle(field.x + CONST.BILLIARDS.BALL_RADIUS,
				field.y + CONST.BILLIARDS.BALL_RADIUS,
				field.width - 2 * CONST.BILLIARDS.BALL_RADIUS,
				field.height - 2 * CONST.BILLIARDS.BALL_RADIUS
			);

			// ボールの位置ランダム生成
			const randBallPos = () => {
				return {
					x: Phaser.Math.Between(ballArea.x, ballArea.x + ballArea.width),
					y: Phaser.Math.Between(ballArea.y, ballArea.y + ballArea.height),
				};
			};

			let callbackDraw: () => void | null;
			const draw = () => {
				if(callbackDraw) {
					callbackDraw();
				}
			};

			const createBall = (pos: {x: number, y: number}, draw: () => void) => {
				const HIT_SIZE = 50;
				const circle = new Phaser.Geom.Circle(pos.x,
					pos.y,
					CONST.BILLIARDS.BALL_RADIUS);

				const hitArea = this.add.container(pos.x, pos.y);
				hitArea.setSize(HIT_SIZE, HIT_SIZE);
				hitArea.setInteractive({draggable: true});

				hitArea.on('drag', (pointer: any, dragX: number, dragY: number) => {
					// 範囲外をドラックしたら何もしない。
					if(!Phaser.Geom.Rectangle.ContainsPoint(ballArea, new Phaser.Geom.Point(dragX, dragY))) return;

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

			const pos0 = randBallPos();
			const ball0 = createBall(pos0, () => {
				draw();
			});
			const pos1 = randBallPos();
			const ball1 = createBall(pos1, () => {
				draw();
			});

			const drawHitArea = (hit: Phaser.GameObjects.Container) => {
				graphic.strokeRect(hit.x - hit.input?.hitArea.centerX, hit.y - hit.input?.hitArea.centerY, hit.width, hit.height);
			};

			// クッション方向選択当たり判定
			let dir = DIR.RIGHT;
			const CUSHION_MARGIN = CONST.BILLIARDS.TABLE.FRAME_THICKNESS + CONST.BILLIARDS.TABLE.CUSHION_THICKNESS;
			const offset = 2;
			const cushionList = [
				// 上
				{
					x: field.x + field.width / 2, y: field.y - CUSHION_MARGIN / 2 - offset,
					w: field.width, h: CUSHION_MARGIN,
					onSelect: () => {
						dir = DIR.TOP;
					}
				},
				// 下
				{
					x: field.x + field.width / 2, y: field.y + field.height + CUSHION_MARGIN/ 2 + offset,
					w: field.width, h: CUSHION_MARGIN,
					onSelect: () => {
						dir = DIR.BOTTOM;
					}
				},
				// 右
				{
					x: field.x + field.width + CUSHION_MARGIN / 2 + offset, y: field.y + field.height / 2,
					w: CUSHION_MARGIN, h: field.height,
					onSelect: () => {
						dir = DIR.RIGHT;
					}
				},
				// 左
				{
					x: field.x - CUSHION_MARGIN / 2 - offset, y: field.y + field.height / 2,
					w: CUSHION_MARGIN, h: field.height,
					onSelect: () => {
						dir = DIR.LEFT;
					}
				}
			];

			let cushionHitList: Array<Phaser.GameObjects.Container> = [];

			cushionList.forEach(area => {
				const hitArea = this.add.container(area.x, area.y);
				hitArea.setSize(area.w, area.h);
				hitArea.setInteractive();

				hitArea.on('pointerup', () => {
					area.onSelect();
					draw()
				});
				cushionHitList.push(hitArea);
			});

			// クッション位置計算
			const cushionPoint = () => {
				const _calcPoint = (p1: number, p2: number, linePos: number, q1: number, q2: number) => {
					const l1 = p1 - linePos;
					const l2 = p2 - linePos;

					const sum = l1 + l2;
					const ratio = (sum === 0) ? 0.5 : l1 / sum;

					return q1 + (q2 - q1) * ratio;
				};

				switch(dir) {
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

			const color = {
				_0: 0xff00ff,
				_1: 0x0000ff,
			};

			const lineDot = (isHorizon: boolean, x0: number, y0: number, x1: number, y1: number) => {
				const DOT_LEN = 5; // 点線の長さ
				const DOT_MARGIN = 2; // 点線の余白
				let start, end;
				let key : {
					constant: ("x"|"y"),
					constant_val: number,
					move: string,
				};

				if(isHorizon) {
					start = x0;
					end = x1;
					key = {
						constant: "y",
						constant_val: y0,
						move: "x",
					};
				} else {
					start = y0;
					end = y1;
					key = {
						constant: "x",
						constant_val: x0,
						move: "y",
					};
				}

				if(end - start == 0) {
					return;
				}

				const lineTo = end - start > 0 ? 1 : -1;
				let current = start;

				while(1) {
					const p0 = {
						[key.constant]: key.constant_val,
						[key.move]: current,
					};

					current += lineTo * DOT_LEN;

					const p1 = {
						[key.constant]: key.constant_val,
						[key.move]: current,
					};

					current += lineTo * DOT_MARGIN;

					if(Math.abs(end - start) > Math.abs(current - start)) {
						graphic.lineBetween(p0.x, p0.y, p1.x, p1.y);
					} else {
						return;
					}
				};
			};

			const drawBall = () => {
				graphic.lineStyle(2, 0xffffff, 1);
				graphic.fillStyle(0xffffff);
				graphic.fillCircleShape(ball0.circle);

				graphic.fillStyle(0xffff00);
				graphic.fillCircleShape(ball1.circle);
			};

			const drawBg = () => {
				graphic.fillStyle(0x5d8165);
				const THICKNESS = CONST.BILLIARDS.TABLE.FRAME_THICKNESS + CONST.BILLIARDS.TABLE.CUSHION_THICKNESS;
				graphic.fillRect(
					field.left - THICKNESS,
					field.top - THICKNESS,
					field.width + 2 * THICKNESS,
					field.height + 2 * THICKNESS,
				);
			};

			const drawPocket = () => {
				graphic.fillStyle(0x0);

				const list = [
					// コーナー
					{x: field.left  - CONST.BILLIARDS.POCKET.POS_OFFSET, y: field.top    - CONST.BILLIARDS.POCKET.POS_OFFSET},
					{x: field.right + CONST.BILLIARDS.POCKET.POS_OFFSET, y: field.top    - CONST.BILLIARDS.POCKET.POS_OFFSET},
					{x: field.left  - CONST.BILLIARDS.POCKET.POS_OFFSET, y: field.bottom + CONST.BILLIARDS.POCKET.POS_OFFSET},
					{x: field.right + CONST.BILLIARDS.POCKET.POS_OFFSET, y: field.bottom + CONST.BILLIARDS.POCKET.POS_OFFSET},
					// センター
					{x: field.left  - CONST.BILLIARDS.POCKET.POS_OFFSET, y: field.centerY},
					{x: field.right + CONST.BILLIARDS.POCKET.POS_OFFSET, y: field.centerY},
				];

				list.forEach(pos => {
					graphic.fillCircle(pos.x, pos.y, CONST.BILLIARDS.POCKET.RADIUS);
				});
			};
			const drawOutFrame = () => {
				graphic.fillStyle(0x864a2b);
				const offset = CONST.BILLIARDS.TABLE.FRAME_THICKNESS + CONST.BILLIARDS.TABLE.CUSHION_THICKNESS;
				// 上
				graphic.fillRect(
					field.left - offset,
					field.top - offset,
					field.width + offset * 2,
					CONST.BILLIARDS.TABLE.FRAME_THICKNESS,
				);
				// 下
				graphic.fillRect(
					field.left - offset,
					field.bottom + CONST.BILLIARDS.TABLE.CUSHION_THICKNESS,
					field.width + offset * 2,
					CONST.BILLIARDS.TABLE.FRAME_THICKNESS,
				);
				// 左
				graphic.fillRect(
					field.left - offset,
					field.top - CONST.BILLIARDS.TABLE.FRAME_THICKNESS,
					CONST.BILLIARDS.TABLE.FRAME_THICKNESS,
					field.height + CONST.BILLIARDS.TABLE.FRAME_THICKNESS * 2,
				);

				// 右
				graphic.fillRect(
					field.right + CONST.BILLIARDS.TABLE.CUSHION_THICKNESS,
					field.top - CONST.BILLIARDS.TABLE.FRAME_THICKNESS,
					CONST.BILLIARDS.TABLE.FRAME_THICKNESS,
					field.height + CONST.BILLIARDS.TABLE.FRAME_THICKNESS * 2,
				);
			};
			const drawCushion = () => {
				graphic.fillStyle(0xb2d235);

				const polygonList = [
					[
						// 上
						field.left,
						field.top - CONST.BILLIARDS.TABLE.CUSHION_THICKNESS,
						field.right,
						field.top - CONST.BILLIARDS.TABLE.CUSHION_THICKNESS,
						field.right - CONST.BILLIARDS.POCKET.ENTRANCE,
						field.top,
						field.left + CONST.BILLIARDS.POCKET.ENTRANCE,
						field.top,
					],
					[
						// 下
						field.right - CONST.BILLIARDS.POCKET.ENTRANCE,
						field.bottom,
						field.left + CONST.BILLIARDS.POCKET.ENTRANCE,
						field.bottom,
						field.left,
						field.bottom + CONST.BILLIARDS.TABLE.CUSHION_THICKNESS,
						field.right,
						field.bottom + CONST.BILLIARDS.TABLE.CUSHION_THICKNESS,
					],
					[
						// 右上
						field.right + CONST.BILLIARDS.TABLE.CUSHION_THICKNESS,
						field.top,
						field.right + CONST.BILLIARDS.TABLE.CUSHION_THICKNESS,
						field.centerY - CONST.BILLIARDS.POCKET.ENTRANCE / 2,
						field.right,
						field.centerY - CONST.BILLIARDS.POCKET.ENTRANCE,
						field.right,
						field.top + CONST.BILLIARDS.POCKET.ENTRANCE,
					],

					[
						// 右下
						field.right,
						field.centerY + CONST.BILLIARDS.POCKET.ENTRANCE,
						field.right + CONST.BILLIARDS.TABLE.CUSHION_THICKNESS,
						field.centerY + CONST.BILLIARDS.POCKET.ENTRANCE / 2,
						field.right + CONST.BILLIARDS.TABLE.CUSHION_THICKNESS,
						field.bottom,
						field.right,
						field.bottom - CONST.BILLIARDS.POCKET.ENTRANCE,
					],
					[
						// 左上
						field.left - CONST.BILLIARDS.TABLE.CUSHION_THICKNESS,
						field.top,
						field.left - CONST.BILLIARDS.TABLE.CUSHION_THICKNESS,
						field.centerY - CONST.BILLIARDS.POCKET.ENTRANCE / 2,
						field.left,
						field.centerY - CONST.BILLIARDS.POCKET.ENTRANCE,
						field.left,
						field.top + CONST.BILLIARDS.POCKET.ENTRANCE,
					],
					[
						// 左下
						field.left,
						field.centerY + CONST.BILLIARDS.POCKET.ENTRANCE,
						field.left - CONST.BILLIARDS.TABLE.CUSHION_THICKNESS,
						field.centerY + CONST.BILLIARDS.POCKET.ENTRANCE / 2,
						field.left - CONST.BILLIARDS.TABLE.CUSHION_THICKNESS,
						field.bottom,
						field.left,
						field.bottom - CONST.BILLIARDS.POCKET.ENTRANCE,
					],
				];

				polygonList.forEach(points => {
					const polygon = new Phaser.Geom.Polygon(points);
					graphic.fillPoints(polygon.points, true);
				})
			};

			const POINT_RADIUS = 2;
			const drawPointMark = () => {
				// 長クッション ポイントマーク
				const _POINT_L = 8;

				graphic.lineStyle(2, 0xffffff, 1);
				graphic.fillStyle(0xffffff);

				for(let i = 1; i < _POINT_L; ++i) {
					if(i === _POINT_L/ 2) continue;

					const y = field.top + i / _POINT_L * field.height;

					graphic.fillCircle(field.left - CONST.BILLIARDS.TABLE.POINT_MARK_MARGIN,
						y, POINT_RADIUS);
						graphic.fillCircle(field.right + CONST.BILLIARDS.TABLE.POINT_MARK_MARGIN,
						y, POINT_RADIUS);
				}

				// 短クッション
				const _POINT_S = 4;
				for(let i = 1; i < _POINT_S; ++i) {
					const x = field.left + i / _POINT_S * field.width;

					graphic.fillCircle(x,
						field.top - CONST.BILLIARDS.TABLE.POINT_MARK_MARGIN, POINT_RADIUS);
						graphic.fillCircle(x,
						field.bottom + CONST.BILLIARDS.TABLE.POINT_MARK_MARGIN, POINT_RADIUS);
				}
			};
			const drawSpot = () => {
				graphic.lineStyle(2, 0xffffff, 1);
				graphic.fillStyle(0xffffff);

				const POINT = 4;
				for(let i = 1; i < POINT; ++i) {
					const y = field.top + i / POINT * field.height;
					graphic.fillCircle(field.centerX, y, POINT_RADIUS);
				}
			};

			const alpha = 0.5;
			callbackDraw = () => {
				graphic.clear();

				// ビリヤード台描画
				drawBg();
				drawOutFrame();
				drawCushion();
				drawPocket();
				drawPointMark();
				drawSpot();

				// ボール
				drawBall();

				// 移動ライン描画
				graphic.lineStyle(2, 0xff0000);
				const cushion = cushionPoint();
				graphic.lineBetween(ball0.circle.x, ball0.circle.y, cushion.x, cushion.y);
				graphic.lineBetween(ball1.circle.x, ball1.circle.y, cushion.x, cushion.y);

				// 補助線
				if(dir === DIR.RIGHT || dir === DIR.LEFT) {
					graphic.lineStyle(1, color._0, alpha);
					lineDot(true, ball0.circle.x, ball0.circle.y, cushion.x, ball0.circle.y); // 球からクッションに垂直な線
					lineDot(false, cushion.x, ball0.circle.y, cushion.x, cushion.y); // クッション上の線

					graphic.lineStyle(1, color._1, alpha);
					lineDot(true, ball1.circle.x, ball1.circle.y, cushion.x, ball1.circle.y); // 球からクッションに垂直な線
					lineDot(false, cushion.x, ball1.circle.y, cushion.x, cushion.y); // クッション上の線
				} else {
					graphic.lineStyle(1, color._0, alpha);
					lineDot(false, ball0.circle.x, ball0.circle.y, ball0.circle.x, cushion.y); // 球からクッションに垂直な線
					lineDot(true, ball0.circle.x, cushion.y, cushion.x, cushion.y);

					graphic.lineStyle(1, color._1, alpha);
					lineDot(false, ball1.circle.x, ball1.circle.y, ball1.circle.x, cushion.y); // 球からクッションに垂直な線
					lineDot(true, ball1.circle.x, cushion.y, cushion.x, cushion.y); // クッション上の線
				}

				// 当たり判定描画
				graphic.lineStyle(1, 0x00ff00, alpha);

				drawHitArea(ball0.hitArea);
				drawHitArea(ball1.hitArea);

				cushionHitList.forEach(area => drawHitArea(area));
			};
			draw();
		}
	}
}
