class MineItem extends eui.Image {
	public row: number;
	public col: number;
	public index: number;

	constructor(row: number, col: number ) {
		super();
		this.row = row || 0;
		this.col = col || 0;
		this.index = (row + 1) * col + col;
	}
}
