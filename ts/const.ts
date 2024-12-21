namespace ks {
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
			},
			BALL_RADIUS: 28.5 * CONST.BILLIARDS_WORLD_SCALE
		};
	}
}
