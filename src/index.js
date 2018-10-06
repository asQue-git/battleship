import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Tile(props) {
    return (
        <button className={`square${props.className}`} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tiles: props.tiles,
        }
    }

    renderTile(i, j) {
        return <Tile
            key={(i*10 + j).toString()}
            className={this.state.tiles[i][j] === null ? "" : this.state.tiles[i][j] === 0 ? " water visited" : ` ship_${this.state.tiles[i][j]} visited`}
            onClick={() => this.props.onClick(i,j)} />;
    }

    render() {
        return this.props.tiles.map((row, i) => row.map((col, j) => this.renderTile(i,j)));
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);

        const tilesShips = new Array(10).fill(null).map(() => new Array(10).fill(null));
        const layout = this.generateInitialLayout(tilesShips);

        let scoreToFinish = 0;
        const ships = [];
        layout.map((ship, idx) => {
            ship.positions.map((position) => {
                tilesShips[position[0]][position[1]] = idx + 1;
                scoreToFinish++;
                return false;
            });
            ships.push(ship.ship);
            return false;
        });

        this.state = {
            ships: ships,
            tilesShips: tilesShips,
            tilesShots: new Array(10).fill(null).map(() => new Array(10).fill(null)),
            score: 0,
            scoreToFinish: scoreToFinish,
            isFinished: false,
            status: "Your move!"
        }
    }

    generateInitialLayout(tiles) {
        const shipTypes = {
            "carrier": { "size": 5, "count": 1 },
            "battleship": { "size": 4, "count": 1 },
            "cruiser": { "size": 3, "count": 1 },
            "submarine": { "size": 3, "count": 1 },
            "destroyer": { "size": 2, "count": 1 },
        };
        let layout = [];
        for(const shipType in shipTypes) {
            for(let i = 0; i < shipTypes[shipType].count; i++) {
                const positions = findValidPosition(tiles, shipTypes[shipType].size);
                layout.push({
                    "ship": shipType,
                    "positions": positions,
                });
            }
        }
        return layout;

        function findValidPosition(tiles, shipSize) {
            const width = tiles.length, // board width
                height = tiles[0].length; // board height
            let x, y, // coordinates of ships left top corner
                orientation, // ship orientation (1 = horizontal, 0 = vertical)
                isValidPosition = false,
                positions = []; // array of all occupied tiles (each tile is a 2d array of coordinates)
            while(!isValidPosition) { // iterative random search for valid position (100% exists)
                x = Math.floor(Math.random()*(width - shipSize + 1));
                y = Math.floor(Math.random()*(height - shipSize + 1));
                orientation = Math.floor(Math.random() * 2);
                isValidPosition = true;
                for(let i = 0; i < shipSize; i++) {
                    if (tiles[x+i*orientation][y+i*(!orientation)] !== null) {
                        isValidPosition = false;
                        break;
                    }
                }
            }
            for(let i = 0; i < shipSize; i++) {
                tiles[x+i*orientation][y+i*(!orientation)] = 1;
                positions.push([x+i*orientation, y+i*(!orientation)]);
            }
            return positions;
        }
    }

    handleClick(i,j) {
        const tilesShots = [...this.state.tilesShots];
        let score, status, isFinished;
        if (this.state.isFinished || tilesShots[i][j]) {
            return;
        }
        let shipIndex = this.state.tilesShips[i][j];
        if (!!this.state.tilesShips[i][j]) {
            status = `The ${this.state.ships[shipIndex - 1]} is under fire! Keep going!`;
            tilesShots[i][j] = shipIndex;
            score = this.state.score + 1;
        } else {
            status = "Raw :( Try again";
            tilesShots[i][j] = 0;
            score = this.state.score;
        }
        isFinished = this.state.scoreToFinish === score;

        if(isFinished) {
            status = "You won! Game is over=)";
        }
        this.setState({
            tilesShots: tilesShots,
            score: score,
            isFinished: isFinished,
            status: status,
        });
    }

    render() {
        return (
            <div className="game">
                <div className="game__board">
                    <Board
                        tiles={this.state.tilesShots}
                        onClick={(i,j) => this.handleClick(i,j)}
                    />
                </div>
                <div className="game__info">{this.state.status}</div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
