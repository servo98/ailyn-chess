const config = {
  draggable: true,
  position: 'start',
  pieceTheme: 'img/chesspieces/custom/{piece}.png',
};

const game = new Chess();

const board1 = Chessboard('board1', config);

const test = document.getElementById('test');

const botonIniciar = document.getElementById('boton1');
const botonParar = document.getElementById('boton2');

const resetB = document.getElementById('reset');

const estadoInput = document.getElementById('estado');

const highlight1 = 'highlight1-32417';

let leyendo = false;
let port;

let ancho = 8;
let alto = 8;

let reader = null;
let anteriorCadena =
  '0000000000000000111111111111111111111111111111110000000000000000';

const GAME_STATES = {
  WHITE_SELECTING: 'WHITE_SELECTING',
  WHITE_PLACING: 'WHITE_PLACING',
  BLACK_SELECTING: 'BLACK_SELECTING',
  BLACK_PLACING: 'BLACK_PLACING',
};
let currentState = GAME_STATES['WHITE_SELECTING'];

let from = '';
let to = '';

/** must do
 * 1.- white_selecting
 * 2.- white_place
 * 3.- black selecting
 * 4.- black_place
 */

test.addEventListener('click', () => {
  console.log(game.ascii());
});

botonIniciar.addEventListener('click', async () => {
  estadoInput.value = 'leyendo';
  try {
    leyendo = true;
    port = await navigator.serial.requestPort();

    await port.open({ baudRate: 9600 });

    reader = port.readable.getReader();
    let cadena = '';
    while (leyendo) {
      const { value, done } = await reader.read();
      cadena += new TextDecoder().decode(value);
      if (cadenaCompleta(cadena)) {
        const cadenaLimpia = cadena.replace('f', '');
        //TODO
        const diffIndex = indexDeCambio(anteriorCadena, cadenaLimpia);
        const coords = indexToChessCoords(diffIndex);
        console.log(`ESTADO: ${currentState}, index: ${diffIndex}`);
        switch (currentState) {
          case GAME_STATES['WHITE_SELECTING']: {
            from = coords;
            tooglehighlightSquare(from);
            highlightValid(from);
            console.log('Blanca seleccionada', from);
            currentState = GAME_STATES['WHITE_PLACING'];
            break;
          }
          case GAME_STATES['WHITE_PLACING']: {
            to = coords;
            tooglehighlightSquare(from);
            console.log(`Moviendo blanca: ${from}-${to}`);
            board1.move(`${from}-${to}`);
            game.move({
              from,
              to,
              promotion: 'q',
            });
            currentState = GAME_STATES['BLACK_SELECTING'];
            break;
          }
          case GAME_STATES['BLACK_SELECTING']: {
            from = coords;
            tooglehighlightSquare(from);
            console.log('Negra seleccionada', from);
            currentState = GAME_STATES['BLACK_PLACING'];
            break;
          }
          case GAME_STATES['BLACK_PLACING']: {
            to = coords;
            tooglehighlightSquare(from);
            console.log(`Moviendo negra: ${from}-${to}`);
            board1.move(`${from}-${to}`);
            game.move({
              from,
              to,
              promotion: 'q',
            });
            currentState = GAME_STATES['WHITE_SELECTING'];
            break;
          }
        }
        cadena = '';
      }
      if (done) break;
    }
  } catch (error) {
    console.error('ERROR en leer puerto', error);
  }
});

botonParar.addEventListener('click', async () => {
  leyendo = false;
  estadoInput.value = 'parado';
  reader.cancel();
  await port.close();
});

resetB.addEventListener('click', () => {
  board1.start();
});

function cadenaCompleta(cadenaLimpia) {
  return cadenaLimpia.split('')[cadenaLimpia.length - 1] == 'f';
}

function tieneCero(cadenaLimpia) {
  return cadenaLimpia.includes('0');
}

function indexToChessCoords(index) {
  const x = index % ancho;
  const y = Math.floor(index / alto);

  const coorAjedrez = matrizACoordenadasAjedrez(x, y);

  return coorAjedrez;
}

function matrizACoordenadasAjedrez(x, y) {
  const letrasFilas = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const numerosColumnas = [8, 7, 6, 5, 4, 3, 2, 1];
  const letraFila = letrasFilas[x];
  const numeroColumna = numerosColumnas[y];
  return letraFila + numeroColumna;
}

function indexDeCambio(cadena1, cadena2) {
  for (let i = 0; i < cadena1.length; i++) {
    if (cadena1[i] !== cadena2[i]) {
      anteriorCadena = cadena2;
      return i;
    }
  }
  console.log('iguales');
  return -1;
}

function tooglehighlightSquare(coord) {
  const square = document.getElementsByClassName(`square-${coord}`)[0];
  square.classList.toggle(highlight1);
}

function highlightValid(coord) {
  const moves = game.moves({
    square: coord,
    verbose: true,
  });
  console.log(moves);
}
