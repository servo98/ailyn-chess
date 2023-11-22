const config = {
  draggable: true,
  position: 'rnbqkbnr/8/8/8/8/8/8/RNBQKBNR',
  pieceTheme: 'img/chesspieces/custom/{piece}.png',
};

const game = new Chess();
// Elimina los peones del tablero
game.clear();

// Coloca las piezas restantes en la posición inicial (sin peones)
game.put({ type: 'r', color: 'w' }, 'a1');
game.put({ type: 'n', color: 'w' }, 'b1');
game.put({ type: 'b', color: 'w' }, 'c1');
game.put({ type: 'q', color: 'w' }, 'd1');
game.put({ type: 'k', color: 'w' }, 'e1');
game.put({ type: 'b', color: 'w' }, 'f1');
game.put({ type: 'n', color: 'w' }, 'g1');
game.put({ type: 'r', color: 'w' }, 'h1');

game.put({ type: 'r', color: 'b' }, 'a8');
game.put({ type: 'n', color: 'b' }, 'b8');
game.put({ type: 'b', color: 'b' }, 'c8');
game.put({ type: 'q', color: 'b' }, 'd8');
game.put({ type: 'k', color: 'b' }, 'e8');
game.put({ type: 'b', color: 'b' }, 'f8');
game.put({ type: 'n', color: 'b' }, 'g8');
game.put({ type: 'r', color: 'b' }, 'h8');

const board1 = Chessboard('board1', config);

const test = document.getElementById('test');

const botonIniciar = document.getElementById('boton1');
const botonParar = document.getElementById('boton2');

const resetB = document.getElementById('reset');

const estadoInput = document.getElementById('estado');
estadoInput.value = 'Clic en Leer';

const highlight1 = 'highlight1-32417';

let leyendo = false;
let port;

let ancho = 8;
let alto = 8;

let reader = null;
let anteriorCadena =
  '0000000011111111111111111111111111111111111111111111111100000000';

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
  estadoInput.value = 'Turno Blancas';
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
        console.log(`ESTADO: ${currentState}`);
        cadena = cadenaLimpia(cadena);
        //TODO
        const cambio = indexDeCambio(anteriorCadena, cadena);
        cadena = '';
        if (cambio.index == -1) {
          continue;
        }
        const coords = indexToChessCoords(cambio.index);
        switch (currentState) {
          case GAME_STATES['WHITE_SELECTING']: {
            from = coords;
            tooglehighlightSquare(from);
            highlightValid(from);
            console.log('Blanca seleccionada', from);
            currentState = GAME_STATES['WHITE_PLACING'];
            cambiarLed(from, 1);
            break;
          }
          case GAME_STATES['WHITE_PLACING']: {
            if (cambio.tipo == 'quitar') {
              console.log('Comió!!!!!!!!!!');
            } else {
              to = coords;
              tooglehighlightSquare(from);
              highlightValid(from);
              console.log(`Moviendo blanca: ${from}-${to}`);
              board1.move(`${from}-${to}`);
              game.move({
                from,
                to,
                promotion: 'q',
              });
              currentState = GAME_STATES['BLACK_SELECTING'];
              cambiarLed(from, 0);
            }

            break;
          }
          case GAME_STATES['BLACK_SELECTING']: {
            from = coords;
            tooglehighlightSquare(from);
            highlightValid(from);
            console.log('Negra seleccionada', from);
            currentState = GAME_STATES['BLACK_PLACING'];
            cambiarLed(from, 1);
            break;
          }
          case GAME_STATES['BLACK_PLACING']: {
            if (cambio.tipo == 'quitar') {
              console.log('Comió!!!!!!!!!!');
            } else {
              to = coords;
              tooglehighlightSquare(from);
              highlightValid(from);
              console.log(`Moviendo blanca: ${from}-${to}`);
              board1.move(`${from}-${to}`);
              game.move({
                from,
                to,
                promotion: 'q',
              });
              currentState = GAME_STATES['WHITE_SELECTING'];
              cambiarLed(from, 0);
            }

            break;
          }
        }
        estadoInput.value = getEstado();
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

function cadenaCompleta(cadenaLimpiat) {
  return cadenaLimpiat.split('')[cadenaLimpiat.length - 1] == 'f';
}

function cadenaLimpia(cadenaT) {
  console.log('ACA', cadenaT);
  return cadenaT.replace(/[^01]/g, '').replace('f', '');
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
      // 0 -> 1 = Quitar
      // 1 -> 0 = Pusieron
      let cambio = cadena1[i] == '0' ? 'quitar' : 'poner';
      return {
        tipo: cambio,
        index: i,
      };
    }
  }
  console.log('iguales');
  return {
    index: -1,
    tipo: null,
  };
}

function tooglehighlightSquare(coord) {
  const square = document.getElementsByClassName(`square-${coord}`)[0];
  square.classList.toggle(highlight1);
  //TODO prender o apagar led seleccionado
}

function highlightValid(coord) {
  console.log('Calculando movs de', coord);
  console.log(game.ascii());
  let moves = game.moves({
    square: coord,
    verbose: true,
  });

  moves = moves.map((move) => move.to);

  const squares = moves.map((coord) => {
    return document.getElementsByClassName(`square-${coord}`)[0];
  });

  squares.forEach((element) => {
    element.classList.toggle('validM');
  });

  console.log('moves:', moves);
}

function getEstado() {
  if (game.in_checkmate()) {
    return 'Jaque Mate';
  }
  return currentState.split('_')[0] == 'WHITE'
    ? 'Turno Blancas'
    : 'Turno Negras';
}

async function cambiarLed(coords, estado) {
  const writer = port.writable.getWriter();

  const leds = coordToLeds(coords);
  console.log('COORDENADAS', coords);
  console.log('LEDS', leds, 'en', estado);
  // Envía los dos enteros al Arduino separados por una coma
  await writer.write(
    new TextEncoder().encode(`${estado},${leds[0]},${leds[1]}\n`)
  );

  // Cierra la conexión
  writer.releaseLock();
}

function coordToLeds(coord) {
  const letras = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
  const [letra, numero] = coord.split('');
  x = letras.indexOf(letra);
  y = +numero + 7;
  return [x, y];
}
