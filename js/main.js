const config = {
  draggable: true,
  position: 'start',
  pieceTheme: 'img/chesspieces/custom/{piece}.png',
};

//Constante que contiene el tablero de chessboardjs
const board1 = Chessboard('board1', config);

//Constante que contiene el botón de iniciar
const botonIniciar = document.getElementById('boton1');
//Constante que contiene el botón de parar
const botonParar = document.getElementById('boton2');
//Boton para cambiar el size de matrix
const cambiarM = document.getElementById('changeM');
//inputs que contienen el nuevo ancho y alto de la matriz
const anchoI = document.getElementById('ancho');
const altoI = document.getElementById('alto');

//boton para resetear tablero
const resetB = document.getElementById('reset');

//Constante que contiene el texto si está leyendo o está parado
/**
 * para saber si puedo cargar mi código en el arduino
 * no se puede usar arduino IDE y esta página al mismo tiempo
 */
const estadoInput = document.getElementById('estado');

let leyendo = false;
let port;

/**
 * ancho y alto de mi matriz de botones, próximamente serán los 8x8
 */
let ancho = anchoI.value;
let alto = altoI.value;

//Estados válidos del juego "selecting" "place" para saber si estoy levantando la pieza o la estoy colocando
//
let estado = 'selecting';
let from = '';
let to = '';
let cadena = '';
let reader = null;

const ESTADOS_JUEGO = ['INICIANDO', 'JUGADOR1', 'JUGADOR2', 'TERMINADO'];

botonIniciar.addEventListener('click', async () => {
  estadoInput.value = 'leyendo';
  try {
    leyendo = true;
    //Ver si está conectado el arduino usb
    port = await navigator.serial.requestPort();

    await port.open({ baudRate: 9600 });

    reader = port.readable.getReader();

    while (leyendo) {
      const { value, done } = await reader.read();
      cadena += new TextDecoder().decode(value);
      if (cadenaCompleta(cadena)) {
        if (tieneCero(cadena)) {
          const cadenaLimpia = cadena.replace('f', '');
          const chessCoords = cadenaToChessCoords(cadenaLimpia);

          if (estado == 'selecting') {
            from = chessCoords;
            estado = 'place';
            console.log('Seleccionando', chessCoords);
          } else {
            to = chessCoords;
            estado = 'selecting';
            console.log(`Moviendo: ${from}-${to}`);
            board1.move(`${from}-${to}`);
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

cambiarM.addEventListener('click', () => {
  ancho = anchoI.value;
  alto = altoI.value;
  console.log('Cambiando ancho y alto de matriz', ancho, alto);
});

//chessboardjs tiene una funcion (board1.start) que resetea la pos de las fichas
resetB.addEventListener('click', () => {
  board1.start();
});

function cadenaCompleta(cadenaLimpia) {
  return cadenaLimpia.split('')[cadenaLimpia.length - 1] == 'f';
}

function tieneCero(cadenaLimpia) {
  return cadenaLimpia.includes('0');
}

//Conversor de cadena ej: 11110111 a posiciones de matriz
function cadenaToChessCoords(cadenaLimpia) {
  /**
   * obtenemos en qué posicion de la cadena de 111101
   */
  const zeroIndex = cadenaLimpia.indexOf('0');
  // convertimos posición del cero en coordenadas x, y
  const x = zeroIndex % ancho;
  const y = Math.floor(zeroIndex / alto);

  //Convertimos esas x, y en notación de ajedrez
  const coorAjedrez = matrizACoordenadasAjedrez(x, y);

  console.log({
    cadenaLimpia,
    x,
    y,
    coorAjedrez,
  });

  return coorAjedrez;
}

//
//Convierte posiciones de una matriz a coordenadas de ajedrez
function matrizACoordenadasAjedrez(x, y) {
  const letrasFilas = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const numerosColumnas = [8, 7, 6, 5, 4, 3, 2, 1];
  const letraFila = letrasFilas[x];
  const numeroColumna = numerosColumnas[y];

  //concatena letra con número de columna
  return letraFila + numeroColumna;
}
