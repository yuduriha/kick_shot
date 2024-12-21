namespace ks {
	window.onload = () => {
		run();
	};
	/**
	 * エントリポイント
	 */
	function run() : void {
		new Phaser.Game({
			type: Phaser.AUTO,
			parent: 'phaser-canvas',
			width: CONST.SCREEN.width,
			height: CONST.SCREEN.height,
			backgroundColor: CONST.SCREEN.BG_COLOR,
			scale: {
				mode: Phaser.Scale.FIT,
				autoCenter: Phaser.Scale.CENTER_BOTH
			},
			scene: [
				GameScene,
			],
			fps: {
				target: 60
			}
		});
	}
}
