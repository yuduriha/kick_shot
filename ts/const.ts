namespace ks {
	const ball_radius = 28.5;
	const frame_thickness = 200; // クッションを含む外周の厚さ
	const cushion_thickness = 70; // クッションの厚さ。

	export class CONST {
		/**
		 * シーン識別子
		 */
		static readonly SCENE_KEY = {
			GAME: "scene_game",
		};

		/**
		 * 画面サイズ
		 */
		static readonly SCREEN = {
			width : 600,
			height: 800,
			BG_COLOR: 0x555555
		};

		/**
		 * 画面中心
		 */
		static readonly SCREEN_CENTER = {
			x: CONST.SCREEN.width / 2,
			y: CONST.SCREEN.height / 2,
		};

		/**
		 * ビリヤードの世界をゲーム画面上に表示するときの縮小率
		 */
		static readonly BILLIARDS_WORLD_SCALE = 0.25;

		/**
		 * ビリヤードのサイズ
		 */
		static readonly BILLIARDS = {
			TABLE: {
				LONG: 2540 * CONST.BILLIARDS_WORLD_SCALE,
				SHORT: 1270 * CONST.BILLIARDS_WORLD_SCALE,
				// クッションを含まない外周の厚さ
				FRAME_THICKNESS: (frame_thickness - cushion_thickness) * CONST.BILLIARDS_WORLD_SCALE,
				POINT_MARK_MARGIN: frame_thickness * 0.65 * CONST.BILLIARDS_WORLD_SCALE,
				CUSHION_THICKNESS: cushion_thickness * CONST.BILLIARDS_WORLD_SCALE,
			},
			BALL_RADIUS: ball_radius * CONST.BILLIARDS_WORLD_SCALE,
			POCKET: {
				ENTRANCE: 2 * ball_radius * 2.2 * CONST.BILLIARDS_WORLD_SCALE, // ポケットの入口はボールの2.2個分らしい。
				POS_OFFSET: 80 * CONST.BILLIARDS_WORLD_SCALE, // ポケットの隅からの位置。適当
				RADIUS: 70 * CONST.BILLIARDS_WORLD_SCALE, // ポケットの半径。適当
			},
		};
	}
}
