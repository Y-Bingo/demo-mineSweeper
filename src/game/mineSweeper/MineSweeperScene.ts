const GAP_ROW = 67; // 行高
const GAP_COL = 66; // 列宽

class MineSweeperScene extends eui.Component {
	// 组件
	private gp_mineMap: eui.Group;
	private gp_menu: eui.Group;
	private btn_reset: eui.Button;
	private btn_generate: eui.Button;
	private btn_shuffle: eui.Button;
	private btn_count: eui.Button;
	private btn_cover: eui.Button;
	private btn_start: eui.Button;
	private mineItemArr: MineItem[][];

	private model: MineSweeperModel;
	private isGaming: boolean = false;

	constructor() {
		super();
		this.skinName = skins.MineSweeper;
	}

	protected childrenCreated() {
		mouse.enable(this.stage);
		this.model = new MineSweeperModel();
		this.mineItemArr = this.generateMineItemMap(this.model.rows, this.model.cols);
		this.gp_menu.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchMenu, this);
		this.renderMap();
	}

	private generateMineItemMap(rows: number, cols: number): MineItem[][] {
		const arr = [];
		for (let row = 0; row < rows; row++) {
			arr[row] = [];
			for (let col = 0; col < cols; col++) {
				const mineItem = new MineItem(row, col);
				mineItem.y = row * 67;
				mineItem.x = col * 66;
				arr[row][col] = mineItem;
				this.gp_mineMap.addChild(mineItem);
			}
		}
		return arr;
	}

	private onLeftDown(e: egret.TouchEvent): void {
		const target = e.target as MineItem;
		const result = this.model.open(target.row, target.col);
		// console.log(target.row, target.col, target.index);
		if (result) {
			this.model.setMapCover(false);
			alert('you lost');
		}
		this.renderMap();
	}

	private onRightDown(e: egret.TouchEvent): void {
		const target = e.target as MineItem;
		const result = this.model.setFlag(target.row, target.col);
		if (result) {
			this.model.setMapCover(false);
			alert('you win！');
		}
		this.renderMap();
		// console.log(target.row, target.col, target.index);
	}

	private onTouchMenu(e): void {
		switch (e.target) {
			case this.btn_reset:
				this.reset();
				break;
			case this.btn_generate:
				this.model.generateMine();
				this.renderMap();
				break;
			case this.btn_shuffle:
				this.model.shuffleMine();
				this.renderMap();
				break;
			case this.btn_count:
				this.model.generateCount();
				this.renderMap();
				break;
			case this.btn_cover:
				this.model.setMapCover(true);
				this.renderMap();
				break;
			case this.btn_start:
				this.startGame(e);
				break;
		}
		console.log('点击菜单：', e.target.label);
	}

	/**
	 * 开始游戏
	 */
	private startGame(e: egret.Event): void {
		if (this.isGaming) return;
		this.isGaming = true;
		mouse.enableMouseRightButton(false);
		this.gp_mineMap.addEventListener(mouse.MouseEvent.LEFT_DOWN, this.onLeftDown, this);
		this.gp_mineMap.addEventListener(mouse.MouseEvent.RIGHT_DOWN, this.onRightDown, this);
	}

	/**
	 * 重置
	 */
	private reset(): void {
		this.isGaming = false;
		mouse.enableMouseRightButton(true);
		this.gp_mineMap.removeEventListener(mouse.MouseEvent.LEFT_DOWN, this.onLeftDown, this);
		this.gp_mineMap.removeEventListener(mouse.MouseEvent.RIGHT_DOWN, this.onRightDown, this);
		this.model.reset();
		this.renderMap();
	}

	/**
	 *  渲染地图
	 */
	private renderMap(): void {
		const { model, mineItemArr } = this;
		if (!model || !mineItemArr) {
			console.error('渲染数据异常！');
			return;
		}
		for (let row = 0; row < model.rows; row++) {
			for (let col = 0; col < model.cols; col++) {
				const mineItem = mineItemArr[row][col];
				// 是否有旗
				if (model.isFlag(row, col)) {
					mineItem.source = 'flag_jpg';
				}
				// 是否已经开了
				else if (!model.isOpen(row, col)) {
					mineItem.source = 'cube_jpg';
				}
				// 是否有雷
				else if (model.isMine(row, col)) {
					mineItem.source = this.isGaming ? 'bomb0_jpg' : 'bomb_jpg';
				} else {
					mineItem.source = `${model.getMineCount(row, col)}_jpg`;
				}
			}
		}
	}
}
