/**
 * 扫雷配置
 */
const MINE_SWEEPER_CONFIG = {
	/** 行数 */
	ROW: 10,
	/** 列数 */
	COL: 10,
	/** 雷数 */
	MINE: 15,
};

/**
 * 访问方向
 */
const D = [
	[-1, -1], // 左上
	[-1, 0], // 上
	[-1, 1], // 右上
	[0, -1], // 左
	[0, 1], // 右
	[1, -1], // 左下
	[1, 0], // 下
	[1, 1], // 右下
];

class MineSweeperModel {
	public rows: number;
	public cols: number;
	public mineNum: number;
	public mineMap: boolean[][];
	public flagMap: boolean[][];
	public coverMap: boolean[][];
	public countMap: number[][];

	constructor(rows: number = MINE_SWEEPER_CONFIG.ROW, cols: number = MINE_SWEEPER_CONFIG.COL, mineNum: number = MINE_SWEEPER_CONFIG.MINE) {
		this.rows = rows;
		this.cols = cols;
		this.mineNum = mineNum;
		this.mineMap = this.generateMap(rows, cols, false);
		this.flagMap = this.generateMap(rows, cols, false);
		this.coverMap = this.generateMap(rows, cols, false);
		this.countMap = this.generateMap(rows, cols, 0);
	}

	/**
	 * 生成地图数据
	 * @param rows
	 * @param cols
	 * @returns
	 */
	private generateMap<T>(rows: number, cols: number, defaultVal: T): T[][] {
		let arr = [];
		for (let row = 0; row < rows; row++) {
			arr[row] = [];
			for (let col = 0; col < cols; col++) {
				arr[row][col] = defaultVal;
			}
		}
		return arr;
	}

	/**
	 * 生成雷区
	 */
	public generateMine(): void {
		const rows = this.rows;
		const cols = this.cols;
		const mineMap = this.mineMap;
		const mineNum = this.mineNum;
		for (let i = 0; i < mineNum; i++) {
			mineMap[Math.floor(i / cols)][i % cols] = true;
		}
	}

	/**
	 * 洗雷区
	 */
	public shuffleMine(): void {
		// 使用knuth-shuffle 进行洗牌
		const rows = this.rows;
		const cols = this.cols;
		const mineMap = this.mineMap;
		let len = this.cols * this.rows;
		let randomIndex = 0;
		let ir = 0,
			ic = 0;
		let rr = 0,
			rc = 0;
		for (let i = len - 1; i >= 0; i--) {
			// 抽取一个位置出来
			randomIndex = Math.floor(Math.random() * i);
			// 与i位置上的元素进行交换
			rr = Math.floor(randomIndex / cols);
			rc = Math.floor(randomIndex % cols);
			ir = Math.floor(i / cols);
			ic = Math.floor(i % cols);

			[mineMap[rr][rc], mineMap[ir][ic]] = [mineMap[ir][ic], mineMap[rr][rc]];
		}
	}

	/**
	 * 计算数字区域
	 */
	public generateCount(): void {
		const rows = this.rows;
		const cols = this.cols;
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				// 移除本身是雷
				if (this.isMine(row, col)) this.countMap[row][col] = -8;

				for (let rr = row - 1; rr <= row + 1; rr++) {
					for (let cc = col - 1; cc <= col + 1; cc++) {
						if (!this.checkArea(rr, cc)) continue;
						if (!this.isMine(rr, cc)) continue;
						this.countMap[row][col]++;
					}
				}
			}
		}
	}

	/**
	 * 设置遮盖
	 * @param isCover
	 */
	public setMapCover(isCover: boolean = false): void {
		const rows = this.rows;
		const cols = this.cols;
		const coverMap = this.coverMap;
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				coverMap[row][col] = isCover;
			}
		}
	}

	public setFlag(row: number, col: number): boolean {
		if (!this.checkArea(row, col)) return;
		if (this.isOpen(row, col)) return;
		this.flagMap[row][col] = !this.flagMap[row][col];
		return this.checkMineLeft() === 0;
	}

	/**
	 *
	 * @param row
	 * @param col
	 * @returns true 为开到雷，false 为安全
	 */
	public open(row: number, col: number): boolean {
		// 越界不能打开
		if (!this.checkArea(row, col)) return false;
		// 有旗帜不能打开
		if (this.flagMap[row][col]) return false;
		// 已经打开过了不能打开
		if (!this.coverMap[row][col]) return false;
		// 覆盖移除
		this.coverMap[row][col] = false;

		// 如果有数字
		if (this.countMap[row][col] > 0) return false;
		// 有炸弹
		if (this.mineMap[row][col]) return true;
		// 遍历各个方向
		for (let i = 0; i < D.length; i++) {
			const nextRow = row + D[i][0];
			const nextCol = col + D[i][1];
			console.log('遍历:', nextRow, nextCol);
			this.open(nextRow, nextCol);
		}
	}

	/**
	 * 检查是否在范围内
	 * @param row
	 * @param col
	 */
	public checkArea(row: number, col: number): boolean {
		if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return false;
		return true;
	}

	public checkMineLeft(): number {
		const rows = this.rows;
		const cols = this.cols;
		const flagMap = this.flagMap;
		const mineMap = this.mineMap;
		let resMine = this.mineNum;
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				if (flagMap[row][col] && mineMap[row][col]) resMine--;
			}
		}
		return resMine;
	}

	/**
	 * 是否为雷区
	 * @param row
	 * @param col
	 * @returns
	 */
	public isMine(row: number, col: number): boolean {
		return this.checkArea(row, col) && this.mineMap[row][col];
	}

	/**
	 * 是否为旗子
	 * @param row
	 * @param col
	 * @returns
	 */
	public isFlag(row: number, col: number): boolean {
		return this.checkArea(row, col) && this.flagMap[row][col];
	}

	/**
	 * 是否已经打开
	 * @param row
	 * @param col
	 * @returns
	 */
	public isOpen(row: number, col: number): boolean {
		return this.checkArea(row, col) && !this.coverMap[row][col];
	}

	/**
	 * name
	 */
	public getMineCount(row: number, col: number) {
		return Math.max(0, this.countMap[row][col]);
	}

	/**
	 * 重置
	 */
	public reset(): void {
		const rows = this.rows;
		const cols = this.cols;
		this.mineMap = this.generateMap(rows, cols, false);
		this.flagMap = this.generateMap(rows, cols, false);
		this.coverMap = this.generateMap(rows, cols, false);
		this.countMap = this.generateMap(rows, cols, 0);
	}
}
