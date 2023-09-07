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

    while (leyendo) {
      const { value, done } = await reader.read();
      console.log('Entrada');
      console.log(new TextDecoder().decode(value));
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
