import axios from 'axios';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers['Access-Control-Allow-Methods'] = '*'
const baseUrl = 'http://localhost:3000'

class Reserva {
  constructor(id, nome, qtde, price) {
    this.id = id;
    this.nome = nome
    this.qtde = qtde
    this.price = price
  }

  verificaReserva(id) {
    return this.id === id
      ? `${this.nome} reservou: ${this.qtde} ${this.qtde > 1
        ? 'ingressos'
        : 'ingresso'} por ${this.convertCents(this.total())}`
      : 'Erro'
  }

  limitReserva(qtde) {
    return qtde > 3 ? { status: false } : { status: true }
  }

  total() {
    return this.qtde * this.price
  }

  convertCents(totalToConvert) {
    let converted = totalToConvert / 100
    converted = converted.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})
    return converted
  }

  async getReservas() {
    let reservas = []
    try {
      await fetch(`${baseUrl}/wishlist`)
        .then(response => response.json())
        .then(data => reservas = data.results)
    } catch (error) {
      console.log(error)
    }
    return reservas
  }
}

const joinFila = async (name, position) => {
  try {
    await axios
      .post(`${baseUrl}/fila`, { name, position })
        .then(response => response.data)
        .then(() => getFila())
        .then(() => document.getElementById('btnFila').setAttribute('disabled', 'disabled'))
  } catch (error) {
    console.log(error)
  }
}

const leftFila = async (position) => {
  try {
    await axios
      .put(`${baseUrl}/fila`, { position })
        .then(() => {
          const fila = getFila()
          window.localStorage.setItem('position', fila[fila.length -1].position + 1)
        })
  } catch (error) {
    console.log(error)
  }
}

const getFila = async () => {
  let reservas = []
    try {
      await fetch(`${baseUrl}/fila`)
        .then(response => response.json())
        .then(data => reservas = data.compradores)
      const fila = reservas.filter(reserva => reserva.status === 1)
      const account = window.localStorage.getItem('myAccount') && JSON.parse(window.localStorage.getItem('myAccount'))
      console.log('account', account)
      const jaEstouNaFila = account && reservas.filter(reserva => reserva.name === account.name && reserva.status === 1)[0]
      if (!reservas || reservas.length === 0) return
      window.localStorage.setItem('position', fila[fila.length -1].position + 1)
      if (account) {
        if (jaEstouNaFila) {
          document.getElementById('nomeFila').value = account.name
          document.getElementById('nomeFila').setAttribute('disabled', 'disabled')
          document.getElementById('btnFila').setAttribute('disabled', 'disabled')
        } else {
          document.getElementById('nomeFila').removeAttribute('disabled')
          document.getElementById('btnFila').removeAttribute('disabled')
        }
        if (account.name === reservas[0].name && account.position === reservas[0].position) {
          console.log('estou em primeiro da fila')
          document.getElementById('reserva-wrapper').classList = ''
        }
      }
      if (fila.length >= 3) {
        document.getElementById('resultado-reserva').innerHTML = 'A fila está cheia, aguarde um momento para realizar suas reservas'
      } else {
        document.getElementById('reserva-wrapper').classList = ''
      }
      let reservasString = reservas.map(reserva => `Nome: ${reserva.name} - Posição: ${reserva.position}`)
      reservasString = reservasString.toString()
      document.getElementById("resultado-fila").innerHTML = `${reservasString.replaceAll(',', '<br>')}`
    } catch (error) {
      console.log(error)
    }

    return reservas
}
document.body.onload = getFila
const btnJoinFila = document.getElementById('btnFila')

btnJoinFila.addEventListener('click', async () => {
  const nomeFila = document.getElementById('nomeFila').value
  const positionFila = parseInt(window.localStorage.getItem('position'), 10)
  window.localStorage.setItem('myAccount', JSON.stringify({ name: nomeFila, position: positionFila }))
  joinFila(nomeFila, positionFila)
})

const btnReserva = document.getElementById('send-reserva')
let resultado = ''

btnReserva.addEventListener('click', async () => {
  const reserva = new Reserva()
  const reservaNome = document.getElementById('reserva-nome').value
  const reservaQtde = document.getElementById('reserva-qtde').value
  reserva.id = '123456789'
  reserva.nome = reservaNome
  reserva.qtde = reservaQtde
  reserva.price = 5000

  const sairFila = await getFila()
  const removeFromFila = Math.min(...sairFila.map(item => item.position))
  leftFila(removeFromFila)

  resultado += reserva.verificaReserva('123456789') + '<br/>'
  document.getElementById("resultado-reserva").innerHTML = resultado
})
