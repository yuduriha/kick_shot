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
			const graphicHit = this.add.graphics();

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
				graphicHit.strokeRect(hit.x - hit.input?.hitArea.centerX, hit.y - hit.input?.hitArea.centerY, hit.width, hit.height);
			};

			// クッション方向選択当たり判定
			let dir = DIR.RIGHT;
			const CUSHION_MARGIN = 20;
			const offset = 2;
			const cushionList = [
				// 上
				{
					x: field.x + field.width / 2, y: field.y - CUSHION_MARGIN / 2 -offset,
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
				return {
					x: 0,
					y: 0,
				}
			};

			callbackDraw = () => {
				// 当たり判定描画
				graphicHit.clear();
				graphicHit.setAlpha(0.5);
				graphicHit.lineStyle(1, 0x00ff00);

				drawHitArea(ball0.hitArea);
				drawHitArea(ball1.hitArea);
				// graphicHit.strokeRectShape(ballArea);

				cushionHitList.forEach(area => drawHitArea(area));

				// 台とボール描画
				graphic.clear();
				graphic.lineStyle(2, 0xffffff);

				graphic.strokeRectShape(field);
				graphic.strokeCircleShape(ball0.circle);
				graphic.strokeCircleShape(ball1.circle);

				// 移動ライン描画
				graphic.lineStyle(2, 0xff0000);
				const cushion = cushionPoint();
				graphic.lineBetween(ball0.circle.x, ball0.circle.y, cushion.x, cushion.y);
				graphic.lineBetween(ball1.circle.x, ball1.circle.y, cushion.x, cushion.y);
			};

			draw();
		}

		update() {
		}
	}
}
