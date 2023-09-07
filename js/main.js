const board1 = Chessboard('board1', 'start');

const botonIniciar = document.getElementById('boton1');
const botonParar = document.getElementById('boton2');

let leyendo = false;
let port;

botonIniciar.addEventListener('click', async () => {
  try {
    leyendo = true;
    //Ver si está conectado el arduino usb
    port = await navigator.serial.requestPort();

    await port.open({ baudRate: 9600 });

    const reader = port.readable.getReader();

    let cadena = '';
    while (leyendo) {
      const { value, done } = await reader.read();
      cadena += new TextDecoder().decode(value);
      if (cadenaCompleta(cadena)) {
        console.log('CADENA completa:', cadena.replace('f', ''));
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
  await port.close();
});

function cadenaCompleta(cadena) {
  return cadena.split('')[cadena.length - 1] == 'f';
}
