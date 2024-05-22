// Підключаємо роутер до бек-енду
const express = require('express')
const router = express.Router()

router.get('/', function (req, res) {
  res.render('index', {
    name: 'index',
    component: [],
    title: 'Index page',
    data: {},
  })
})

router.get('/home', function (req, res) {
  res.render('home', {
    name: 'home',
    component: [],
    title: 'Home page',
    data: {},
  })
})

router.get('/logout', function (req, res) {
  res.render('logout', {
    name: 'logout',
    component: [],
    title: 'logout page',
    data: {},
  })
})

// Підключіть файли роутів
const auth = require('./auth')
// Підключіть інші файли роутів, якщо є

// Об'єднайте файли роутів за потреби
router.use('/', auth)
// Використовуйте інші файли роутів, якщо є

// Експортуємо глобальний роутер
module.exports = router
