import React, { Component } from "react";

import StartModal from "../components/StartModal/StartModal";
import PrimaryButton from "../components/common/PrimaryButton";
import ResultsSmartComponent from "../smartComponents/ResultsSmartComponent";
import { api } from "../api/api";
import { proccessCurrentArena } from "../evaluation/arenaProccesing";
import { createMatrix } from "../gameLogic/tetris";
import { sequences } from "../lib/Sequences/sequences";
import { getRandomDiffSequence } from "../lib/sequenceHelper";
import "./PlayPage.css";

const arena = createMatrix(10, 20);

const player = {
  pos: {
    x: 0,
    y: 0,
  },
  matrix: null,
  score: 0,
};

class PlayPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      aggregateHeight: 0,
      bumpiness: 0,
      columnHeights: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentBumpiness: 0,
      currentColumnHeights: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentHoles: 0,
      diff: 0,
      diffIteration: 0,
      diffSequence: [],
      doubleRowsCleared: 0,
      down: 0,
      dropCounter: 0,
      dropInterval: 800,
      email: "",
      frameId: 0,
      holes: 0,
      isModalOpen: true,
      isGameOver: false,
      isPaused: false,
      isStarted: false,
      iteration: 0,
      lastTime: 0,
      left: 0,
      level: 1,
      playerMovements: [],
      quadripleRowsCleared: 0,
      right: 0,
      rowsCleared: 0,
      score: 0,
      sequence: [],
      speed: 0,
      singleRowsCleared: 0,
      trippleRowsCleared: 0,
      up: 0,
    };
  }

  getCanvas = (id) => {
    return document.getElementById(id);
  };

  getContext = (canvas) => {
    return canvas.getContext("2d");
  };

  componentDidMount() {
    document.addEventListener("keydown", (event) => {
      switch (event.keyCode) {
        case 32:
          const { isStarted } = this.state;
          event.preventDefault();
          if (isStarted) {
            let drop;
            while (drop !== 1) {
              drop = this.playerDrop();
            }
          }
          break;
        case 37:
          this.playerMove(-1);
          let left = this.getStateProperty("left");
          this.setState({ left: left + 1 });
          break;
        case 39:
          this.playerMove(1);
          let right = this.getStateProperty("right");
          this.setState({ right: right + 1 });
          break;
        case 38:
          event.preventDefault();
          this.playerRotate(-1);
          let up = this.getStateProperty("up");
          this.setState({ up: up + 1 });
          break;
        case 40:
          event.preventDefault();
          this.playerDrop();
          let down = this.getStateProperty("down");
          this.setState({ down: down + 1 });
          break;
        default:
          return null;
      }
    });
    this.setState({
      sequence: sequences[this.state.level],
      diffSequence: getRandomDiffSequence(),
    });
    const canvas = this.getCanvas("tetris");
    const context = this.getContext(canvas);

    const pieceCanvas = this.getCanvas("nextPieceCanvas");
    const pieceContext = this.getContext(pieceCanvas);

    pieceContext.scale(20, 20);
    context.scale(25, 25);
  }

  componentWillUnmount() {
    this.stopGame();
  }

  resetState = () => {
    this.setState({
      columnHeights: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentHoles: 0,
      currentBumpiness: 0,
      currentColumnHeights: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      doubleRowsCleared: 0,
      dropCounter: 0,
      dropInterval: 1000,
      frameId: 0,
      holes: 0,
      isGameOver: false,
      isPaused: false,
      isStarted: false,
      iteration: 0,
      lastTime: 0,
      quadripleRowsCleared: 0,
      rowsCleared: 0,
      speed: 0,
      score: 0,
      singleRowsCleared: 0,
      test: 0,
      trippleRowsCleared: 0,
    });
  };

  arenaSweep = () => {
    const {
      doubleRowsCleared,
      quadripleRowsCleared,
      rowsCleared,
      singleRowsCleared,
      trippleRowsCleared,
    } = this.state;

    let rowCount = 0;
    outer: for (let y = arena.length - 1; y > 0; --y) {
      for (let x = 0; x < arena[y].length; ++x) {
        if (arena[y][x] === 0) {
          continue outer;
        }
      }

      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row);
      ++y;

      rowCount++;
      const newRowCount = rowCount + rowsCleared;
      this.setState({ rowsCleared: newRowCount });
    }

    switch (rowCount) {
      case 1:
        const newSingleRowsCleared = singleRowsCleared + 1;
        this.setState({ singleRowsCleared: newSingleRowsCleared });
        player.score += rowCount * 10;
        break;
      case 2:
        const newDoubleRowsCleared = doubleRowsCleared + 1;
        this.setState({ doubleRowsCleared: newDoubleRowsCleared });
        player.score += rowCount * 20;
        break;
      case 3:
        const newTrippleRowsCleared = trippleRowsCleared + 1;
        this.setState({ trippleRowsCleared: newTrippleRowsCleared });
        player.score += rowCount * 30;
        break;
      case 4:
        const newQuadripleRowsCleared = quadripleRowsCleared + 1;
        this.setState({ quadripleRowsCleared: newQuadripleRowsCleared });
        player.score += rowCount * 40;
        break;
      default:
        return null;
    }
  };

  collide = (arena, player) => {
    const { isStarted } = this.state;

    if (isStarted) {
      const m = player.matrix;
      const o = player.pos;
      for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
          if (
            m[y][x] !== 0 &&
            (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0
          ) {
            return true;
          }
        }
      }
      return false;
    }
  };

  createPiece = (type) => {
    if (type === 0) {
      return [
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
    } else if (type === 1) {
      return [
        [0, 0, 2],
        [2, 2, 2],
        [0, 0, 0],
      ];
    } else if (type === 2) {
      return [
        [3, 0, 0],
        [3, 3, 3],
        [0, 0, 0],
      ];
    } else if (type === 3) {
      return [
        [4, 4],
        [4, 4],
      ];
    } else if (type === 4) {
      return [
        [5, 5, 0],
        [0, 5, 5],
        [0, 0, 0],
      ];
    } else if (type === 5) {
      return [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0],
      ];
    } else if (type === 6) {
      return [
        [0, 7, 0],
        [7, 7, 7],
        [0, 0, 0],
      ];
    }
  };

  handleEmailChange = (event) => {
    const { target } = event;
    const { value } = target;

    this.setState({ email: value });
  };

  changeStateValue = (property, value) => this.setState({ [property]: value });

  getStateProperty = (property) => {
    return this.state[property];
  };

  drawMatrix = (matrix, offset) => {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          this.getContext(this.getCanvas("tetris")).fillStyle = this.getColor(
            value
          );
          this.getContext(this.getCanvas("tetris")).fillRect(
            x + offset.x,
            y + offset.y,
            1,
            1
          );
        }
      });
    });
  };

  drawMatrix2 = (matrix, offset, canvas) => {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          canvas.getContext("2d").fillStyle = this.getColor(value);
          canvas.getContext("2d").fillRect(x + offset.x, y + offset.y, 1, 1);
        }
      });
    });
  };

  draw = () => {
    this.getContext(this.getCanvas("tetris")).fillStyle = "#000";
    this.getContext(this.getCanvas("tetris")).fillRect(
      0,
      0,
      this.getCanvas("tetris").width,
      this.getCanvas("tetris").height
    );

    this.drawMatrix(arena, { x: 0, y: 0 });
    this.drawMatrix(player.matrix, player.pos);
  };

  merge = (arena, player) => {
    const {
      iteration,
      up,
      right,
      down,
      left,
      playerMovements,
      speed,
    } = this.state;
    let newSpeed;

    if (iteration % 10 === 0 && speed <= 40) {
      newSpeed = speed + 5;
      this.setState({ speed: newSpeed });
    }

    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          arena[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
    const nextIteration = iteration + 1;
    const nextPlayerMovements = [up, right, down, left];
    this.setState({
      iteration: nextIteration,
      playerMovements: [...playerMovements, nextPlayerMovements],
      up: 0,
      right: 0,
      left: 0,
      down: 0,
    });
    proccessCurrentArena(arena, this.changeStateValue, this.getStateProperty);
  };

  rotate = (matrix, dir) => {
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }

    if (dir > 0) {
      matrix.forEach((row) => row.reverse());
    } else {
      matrix.reverse();
    }
  };

  playerDrop = () => {
    player.pos.y++;
    if (this.collide(arena, player)) {
      player.pos.y--;
      this.merge(arena, player);
      this.playerReset();
      this.arenaSweep();
      this.updateScore();
      return 1;
    }
    this.setState({ dropCounter: 0 });
    return 0;
  };

  playerMove = (offset) => {
    player.pos.x += offset;
    if (this.collide(arena, player)) {
      player.pos.x -= offset;
    }
  };

  playerReset = () => {
    const {
      aggregateHeight,
      columnHeights,
      diff,
      doubleRowsCleared,
      email,
      holes,
      iteration,
      level,
      playerMovements,
      quadripleRowsCleared,
      rowsCleared,
      score,
      singleRowsCleared,
      trippleRowsCleared,
    } = this.state;

    const piece = sequences[level - 1][iteration];

    player.matrix = this.createPiece(piece);
    player.pos.y = 0;
    player.pos.x =
      ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
    if (this.collide(arena, player)) {
      arena.forEach((row) => row.fill(0));
      api.post("/tetris", {
        aggregateHeight,
        columnHeights,
        diff,
        doubleRowsCleared,
        email,
        holes,
        iteration,
        level,
        playerMovements,
        quadripleRowsCleared,
        rowsCleared,
        score,
        singleRowsCleared,
        trippleRowsCleared,
      });
      this.stopGame();
    }
  };

  playerRotate = (dir) => {
    const pos = player.pos.x;
    let offset = 1;
    this.rotate(player.matrix, dir);
    while (this.collide(arena, player)) {
      player.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > player.matrix[0].length) {
        this.rotate(player.matrix, -dir);
        player.pos.x = pos;
        return;
      }
    }
  };

  update = (time = 0) => {
    const {
      dropCounter,
      dropInterval,
      lastTime,
      isGameOver,
      speed,
    } = this.state;
    const deltaTime = time - lastTime;
    let frame;
    let updatedDropCounter = dropCounter;
    this.setState({ dropCounter: (updatedDropCounter += deltaTime + speed) });
    if (dropCounter > dropInterval) {
      this.playerDrop();
    }

    this.setState({ lastTime: time });

    this.draw();
    if (!isGameOver) {
      frame = requestAnimationFrame(this.update);
    }
    this.setState({ frameId: frame });
  };

  updateScore = () => {
    this.setState({ score: player.score });
  };

  getColor = (value) => {
    const colors = [
      null,
      "#FF0D72",
      "#0DC2FF",
      "#0DFF72",
      "#F538FF",
      "#FF8E0D",
      "#FFE138",
      "#3877FF",
    ];

    return colors[value];
  };

  startGame = () => {
    const { diffIteration, diffSequence, level } = this.state;
    const newDiffIteration = diffIteration + 1;

    player.score = 0;
    this.resetState();
    this.setState(
      {
        diff: diffSequence[diffIteration],
        diffIteration: newDiffIteration,
        isStarted: true,
        isGameOver: false,
        frameId: 0,
        iteration: 0,
        sequence: sequences[level - 1],
      },
      () => {
        this.playerReset();
        this.updateScore();
        this.update();
      }
    );
  };

  pauseGame = () => {
    const { frameId, isPaused } = this.state;
    const pauseStatus = !isPaused;
    this.setState({ isPaused: pauseStatus });
    return isPaused
      ? requestAnimationFrame(this.update)
      : cancelAnimationFrame(frameId);
  };

  stopGame = () => {
    const { diffIteration, frameId, level } = this.state;
    cancelAnimationFrame(frameId);
    if (diffIteration === 3) {
      this.setState({
        diffIteration: 0,
        diffSequence: getRandomDiffSequence(),
      });
    }

    this.setState({
      isStarted: false,
      isPaused: false,
      isGameOver: true,
      sequence: sequences[level - 1],
      frameId: 0,
    });
  };

  getButtonLabel = (isPaused) => {
    return isPaused ? "Pokračovať" : "Pauza";
  };

  renderLevelButtons = () => {
    const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return levels.map((level) => {
      const label = `Level ${level}`;
      return (
        <PrimaryButton
          key={level}
          id={level}
          text={label}
          onClick={this.onLevelButtonClick}
        />
      );
    });
  };

  onLevelButtonClick = (event) => {
    const { isStarted } = this.state;
    const { target } = event;
    const { id } = target || 0;
    this.setState({ level: id, sequence: sequences[id - 1] });

    if (isStarted) {
      this.stopGame();
      this.resetState();
      arena.forEach((row) => row.fill(0));
    }
  };

  renderEmptyCanvas = (canvas) => {
    this.getContext(canvas).fillStyle = "#fff";
    this.getContext(canvas).fillRect(0, 0, canvas.width, canvas.height);
  };

  shouldRenderPiece = (pieceCanvas) => {
    const { diff, level, iteration } = this.state;

    const area = createMatrix(4, 4);
    switch (diff) {
      case 3:
        this.renderEmptyCanvas(pieceCanvas);
        break;
      case 2:
        if (iteration % 4 !== 0) {
          this.renderEmptyCanvas(pieceCanvas);
        } else {
          this.renderEmptyCanvas(pieceCanvas);
          this.drawMatrix2(area, { x: 0, y: 0 });
          this.drawMatrix2(
            this.createPiece(sequences[level - 1][iteration + 1]),
            { x: 0, y: 0 },
            pieceCanvas
          );
        }
        break;
      case 1:
        this.renderEmptyCanvas(pieceCanvas);
        this.drawMatrix2(area, { x: 0, y: 0 });
        this.drawMatrix2(
          this.createPiece(sequences[level - 1][iteration + 1]),
          { x: 0, y: 0 },
          pieceCanvas
        );
        break;
      default:
        return null;
    }
  };

  renderNextPiece = () => {
    const pieceCanvas = this.getCanvas("nextPieceCanvas");

    if (pieceCanvas) {
      this.shouldRenderPiece(pieceCanvas);
    }
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
  };

  render() {
    const {
      aggregateHeight,
      bumpiness,
      columnHeights,
      currentBumpiness,
      currentColumnHeights,
      currentHoles,
      diff,
      doubleRowsCleared,
      email,
      holes,
      isGameOver,
      isModalOpen,
      isPaused,
      isStarted,
      iteration,
      playerMovements,
      quadripleRowsCleared,
      rowsCleared,
      score,
      up,
      left,
      right,
      singleRowsCleared,
      trippleRowsCleared,
    } = this.state;

    return (
      <div className="container-fluid">
        <StartModal
          closeModal={this.closeModal}
          email={email}
          handleEmailChange={this.handleEmailChange}
          isModalOpen={isModalOpen}
        />
        <div className="row center-content">{this.renderLevelButtons()}</div>
        <div className="row">
          <div className="col-sm-6 main-text">
            Skóre: {score}
            <div>Nasledujúca kocka</div>
            <div>
              <canvas id="nextPieceCanvas" width={80} height={40} />
              {this.renderNextPiece()}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-1">
            <PrimaryButton
              disabled={isStarted}
              onClick={this.startGame}
              text="Nová hra"
              width={110}
            />
            <PrimaryButton
              disabled={!isStarted}
              onClick={this.pauseGame}
              text={this.getButtonLabel(isPaused)}
              width={110}
            />
          </div>
          <div className="col-sm-4 center-content">
            <canvas id="tetris" width={250} height={500} />
          </div>
          <div className="col-sm-6">
            <ResultsSmartComponent
              aggregateHeight={aggregateHeight}
              bumpiness={bumpiness}
              columnHeights={columnHeights}
              currentBumpiness={currentBumpiness}
              currentColumnHeights={currentColumnHeights}
              currentHoles={currentHoles}
              diff={diff}
              doubleRowsCleared={doubleRowsCleared}
              holes={holes}
              iteration={iteration}
              left={left}
              playerMovements={playerMovements}
              quadripleRowsCleared={quadripleRowsCleared}
              right={right}
              rowsCleared={rowsCleared}
              score={score}
              shouldRender={isGameOver}
              singleRowsCleared={singleRowsCleared}
              trippleRowsCleared={trippleRowsCleared}
              up={up}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default PlayPage;
