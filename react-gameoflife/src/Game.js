import React, {Component} from 'react';
import './Game.css';

const Cell_Size = 20;
const Width = 800;
const Height = 600;

class Cell extends Component {
    render() {
        const { x,y } = this.props; // Object destructuring
        return (
            <div className="Cell" style={{
                left: `${Cell_Size * x + 1}px`,
                top: `${Cell_Size * y + 1}px`,
                width: `${Cell_Size - 1}px`,
                height: `${Cell_Size -1}px`
            }} />
        );
    }
}

class Game extends Component {
    constructor() {
        super();
        this.rows = Height / Cell_Size;
        this.cols = Width / Cell_Size;
        this.board = this.makeEmptyBoard();
        console.log(this);
    }

    state = {
        cells: [],
        interval: 100,
        isRunning: false
    }

    makeEmptyBoard() {
        let board = [];
        for(let y = 0; y < this.rows; y++){
            board[y] = [];
            for(let x = 0; x < this.cols; x++){
                board[y][x] = false;
            }
        }
        return board;
    }

    makeCells() {
        let cells = [];
        for(let y = 0; y< this.rows; y++) {
            for(let x = 0; x< this.cols; x++) {
                if(this.board[y][x]) {
                    cells.push({ x,y })
                }
            }
        }
        return cells;
    }

    getElementOffset() {
        const rect = this.boardRef.getBoundingClientRect(); // "getBoundingClientRect" : returns the size of an element and its position relative to the viewport.
        const doc = document.documentElement; // "document.documentElement" : returns element <HTML>.

        return {
            x: (rect.left + window.pageXOffset) - doc.clientLeft, // "clientLeft" : gets the width of a <div> element's top and left border.
            y: (rect.top + window.pageYOffset) - doc.clientTop
        };
    }

    handleClick = (event) => {
        const elemOffset = this.getElementOffset();
        const offsetX = event.clientX - elemOffset.x;
        const offsetY = event.clientY - elemOffset.y;

        const x = Math.floor(offsetX / Cell_Size);
        const y = Math.floor(offsetY / Cell_Size);

        if(x >= 0 && x <= this.cols && y>= 0 && y <= this.rows) {
            this.board[y][x] = !this.board[y][x];
        }

        this.setState({cells: this.makeCells()});
    }

    runGame = () => {
        this.setState({isRunning: true});
        this.runIteration();
    }

    stopGame = () => {
        this.setState({isRunning: false});
        if(this.timeoutHandler) {
            window.clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    }

    runIteration() {
        console.log('running iteration');
        let newBoard = this.makeEmptyBoard();

        for(let y = 0; y < this.rows; y++) {
            for(let x = 0; x < this.cols; x++) {
                let neighbors = this.calculateNeighbors(this.board, x, y);
                if(this.board[y][x]) {
                    if(neighbors === 2 || neighbors === 3) {
                        newBoard[y][x] = true;
                    } else {
                        newBoard[y][x] = false;
                    }
                } else {
                    if(!this.board[y][x] && neighbors === 3) {
                        newBoard[y][x] = true;
                    }
                }
            }
        }

        this.board = newBoard;
        this.setState({cells: this.makeCells()});

        this.timeoutHandler = window.setTimeout(() => {
            this.runIteration();
        }, this.state.interval);
    }

    /**
     * Calculate the number of neighbors at point (x, y)
     * @param {Array} board
     * @param {int} x
     * @param {int} y
     */
    calculateNeighbors(board, x, y) {
        let neighbors = 0;
        const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
        for (let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            let y1 = y + dir[0];
            let x1 = x + dir[1];

            if (x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && board[y1][x1]) {
                neighbors++;
            }
        }

        return neighbors;
    }

    handleIntervalChange = (event) => {
        this.setState({interval: event.target.value});
    }


    render() {
        const { cells } = this.state;
        return(
            <div>
                <div className="Board"
                     style={{width: Width, height: Height,
                         backgroundSize: `${Cell_Size}px ${Cell_Size}px`}}
                     onClick={this.handleClick}
                     ref={(n) => {this.boardRef = n; }}>


                    {cells.map(cell => (
                        <Cell x={cell.x} y={cell.y}
                              key={`${cell.x}, ${cell.y}`} />
                    ))}
                </div>

                <div className="controls">
                    Update every <input value={this.state.interval}
                                        onChange={this.handleIntervalChange} /> msec
                    {this.isRunning ?
                        <button className="button"
                                onClick={this.stopGame}>Stop</button> :
                        <button className="button"
                                onClick={this.runGame}>Run</button>
                    }
                </div>
            </div>
        );
    }
}

export default Game;
