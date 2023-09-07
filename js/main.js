const board1 = Chessboard('board1', 'start');

const boton = document.getElementById('boton1');

async function readData(port) {
  console.log('Entrando en el read data');
  while (true) {
    const reader = port.readable.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        // Procesa los datos recibidos, por ejemplo, muestra en la página web
        console.log('Dato recibido:', value);
      }
    } catch (error) {
      console.error('Error al leer datos del Arduino:', error);
    } finally {
      reader.releaseLock();
    }
  }
}

boton.addEventListener('click', async () => {
  try {
    //Ver si está conectado el arduino usb
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    readData(port);
    console.log(port);
  } catch (error) {
    console.error('ERROR en leer puerto', error);
  }
});

// async function connectArduino() {
//   try {
//     const port = await navigator.serial.requestPort();
//     await port.open({ baudRate: 9600 }); // Ajusta la velocidad de acuerdo a tu configuración
//     readData(port);
//   } catch (error) {
//     console.error('Error al conectar con el Arduino:', error);
//   }
// }

// Lee datos del Arduino
