// shiny edges
const grid = document.querySelector(".xo");
document.addEventListener("mousemove", (e) => {
  grid.style.setProperty("--x", e.x + "px");
  grid.style.setProperty("--y", e.y + "px");
});

// tic-tac-toe

class LimitedArray {
  constructor(maxLength) {
    this.maxLength = maxLength;
    this.items = [];
  }

  add(content, row, column) {
    if (this.items.length >= this.maxLength) {
      const removedItem = this.items.shift();
      this.disappear(removedItem.row, removedItem.column);
    }

    // Add item
    this.items.push({ content, row, column });
  }

  getItems() {
    return this.items;
  }
  size() {
    return this.items.length;
  }
  reset() {
    this.items = [];
  }

  disappear(row, column) {
    const el = document.querySelector(
      `table tr:nth-child(${row}) td:nth-child(${column})`
    );
    const content = el.querySelector(":is(b,i)");
    if (!content) return;
    content.classList.add("marked");
    setTimeout(() => {
      content.addEventListener(
        "transitionend",
        () => {
          el.innerHTML = "&nbsp;";
        },
        { once: true }
      );
    }, 0);
  }
}

const moves = new LimitedArray(6);
const table = document.querySelector("table.xo");

function checkWinner() {
  // Simple win check for three in a row for b (X) or i (O)
  const winLines = [
    [
      [1, 1],
      [1, 2],
      [1, 3],
    ],
    [
      [2, 1],
      [2, 2],
      [2, 3],
    ],
    [
      [3, 1],
      [3, 2],
      [3, 3],
    ],
    [
      [1, 1],
      [2, 1],
      [3, 1],
    ],
    [
      [1, 2],
      [2, 2],
      [3, 2],
    ],
    [
      [1, 3],
      [2, 3],
      [3, 3],
    ],
    [
      [1, 1],
      [2, 2],
      [3, 3],
    ],
    [
      [1, 3],
      [2, 2],
      [3, 1],
    ],
  ];

  for (const line of winLines) {
    let bCount = 0,
      iCount = 0;
    for (const [r, c] of line) {
      const cell = document.querySelector(
        `table tr:nth-child(${r}) td:nth-child(${c})`
      );
      if (!cell) continue;
      if (cell.querySelector("b")) bCount++;
      if (cell.querySelector("i")) iCount++;
    }
    if (bCount === 3) return "X";
    if (iCount === 3) return "O";
  }
  return null;
}

function isCellEmpty(row, col) {
  const cell = document.querySelector(
    `table tr:nth-child(${row}) td:nth-child(${col})`
  );
  return cell && !cell.querySelector(":is(b,i)");
}

function aiPlay() {
  // AI plays O (i)
  // Strategy: try to win, block player, else random

  // Find all empty cells
  let emptyCells = [];
  for (let r = 1; r <= 3; r++) {
    for (let c = 1; c <= 3; c++) {
      if (isCellEmpty(r, c)) emptyCells.push([r, c]);
    }
  }
  if (emptyCells.length === 0) return;

  // Try to win
  for (const [r, c] of emptyCells) {
    placeTempMark(r, c, "i");
    if (checkWinner() === "O") {
      removeTempMark(r, c);
      playMove(r, c, "<i>⭘</i>");
      return;
    }
    removeTempMark(r, c);
  }
  // Try to block player
  for (const [r, c] of emptyCells) {
    placeTempMark(r, c, "b");
    if (checkWinner() === "X") {
      removeTempMark(r, c);
      playMove(r, c, "<i>⭘</i>");
      return;
    }
    removeTempMark(r, c);
  }

  // Else pick random empty cell
  const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  playMove(r, c, "<i>⭘</i>");
}

function placeTempMark(row, col, mark) {
  const cell = document.querySelector(
    `table tr:nth-child(${row}) td:nth-child(${col})`
  );
  if (!cell) return;
  cell.dataset.temp = mark;
  if (mark === "b") cell.innerHTML = "<b>⨯</b>";
  else if (mark === "i") cell.innerHTML = "<i>⭘</i>";
}

function removeTempMark(row, col) {
  const cell = document.querySelector(
    `table tr:nth-child(${row}) td:nth-child(${col})`
  );
  if (!cell) return;
  if (cell.dataset.temp) {
    cell.innerHTML = "&nbsp;";
    delete cell.dataset.temp;
  }
}

function playMove(row, col, content) {
  const cell = document.querySelector(
    `table tr:nth-child(${row}) td:nth-child(${col})`
  );
  if (!cell) return;
  if (cell.querySelector(":is(b,i)")) return; // cell occupied

  // Add remaining-life UI
  content += `<div class="remaining-life">
    <div class="circle filled"></div>
    <div class="circle filled"></div>
    <div class="circle filled"></div>
  </div>`;

  cell.innerHTML = content;
  moves.add(content, row, col);

  table.classList.toggle("player-2s-turn");
}

document.querySelectorAll(".xo td").forEach((item, index) => {
  item.addEventListener("click", function (e) {
    const el = e.target.closest("td");
    if (el.querySelector(":is(b,i)")) return;

    // Player's turn (X - b)
    const player2sTurn = table.classList.contains("player-2s-turn");
    if (player2sTurn) return; // Wait for AI

    const row = Math.floor(index / 3) + 1;
    const column = (index % 3) + 1;
    playMove(row, column, "<b>⨯</b>");

    // Check win
    if (checkWinner()) return;

    // AI plays after short delay
    setTimeout(() => {
      aiPlay();
    }, 300);
  });
});

// Reset button
document.querySelector(".reset-btn").addEventListener("click", (e) => {
  document.querySelectorAll(".xo td").forEach((item) => {
    item.innerHTML = "&nbsp;";
  });
  table.classList.remove("player-2s-turn");
  moves.reset();
});
