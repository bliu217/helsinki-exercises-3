require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))

const Person = require('./models/person')
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
app.use(express.static('dist'))


// let persons = [
//     {
//         "id": "1",
//         "name": "Arto Hellas",
//         "number": "040-123456"
//     },
//     {
//         "id": "2",
//         "name": "Ada Lovelace",
//         "number": "39-44-5323523"
//     },
//     {
//         "id": "3",
//         "name": "Dan Abramov",
//         "number": "12-43-234345"
//     },
//     {
//         "id": "4",
//         "name": "Mary Poppendieck",
//         "number": "39-23-6423122"
//     }
// ]




app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    response.json(result)
  })
})

app.get('/api/info', (request, response) => {

  Person.find({}).then(result => {
    response.send(`
            <div>
            <p>Phonebook has info for ${result.length} people</p>
            <p>${Date(Date.now()).toLocaleString()}</p>
            </div>
            `)
  })



})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id).then(() => {
    response.status(204).end()
  }).catch(e => next(e))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(p => {
    response.json(p)
  }).catch(e => next(e))
})


app.put('/api/persons/:id', (request, response) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number
  }


  Person.findByIdAndUpdate(request.params.id, person, { new: true }).then(p => {
    response.json(p)
  })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'missing name'
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'missing number'
    })
  }

  // if (persons.find(person => person.name === body.name)) {
  //     return response.status(400).json({
  //         error: "name must be unique"
  //     })
  // }

  const person = new Person({
    name: body.name,
    number: body.number
  })


  person.save().then(result => {
    console.log('Person saved')
    response.json(result)
  }).catch(error => next(error))

})


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)