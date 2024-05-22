// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================

const { User } = require('../class/user')
const { Confirm } = require('../class/confirm')
const { Session } = require('../class/session')

User.create({
  email: 'test@i.com',
  password: 123,
  role: 1,
})

// router.get Створює нам один ентпоїнт

// ↙️ тут вводимо шлях (PATH) до сторінки
router.get('/signup', function (req, res) {
  // res.render генерує нам HTML сторінку

  // ↙️ cюди вводимо назву файлу з сontainer
  res.render('signup', {
    // вказуємо назву контейнера
    name: 'signup',
    // вказуємо назву компонентів
    component: [
      'back-button',
      'field',
      'field-password',
      'field-checkbox',
      'field-select',
    ],

    // вказуємо назву сторінки
    title: 'Signup page',
    // ... сюди можна далі продовжувати додавати потрібні технічні дані, які будуть використовуватися в layout

    // вказуємо дані,
    data: {
      role: [
        { value: User.USER_ROLE.USER, text: 'Користувач' },
        {
          value: User.USER_ROLE.ADMIN,
          text: 'Адміністратор',
        },
        {
          value: User.USER_ROLE.DEVELOPER,
          text: 'Розробник',
        },
      ],
    },
  })
  // ↑↑ сюди вводимо JSON дані
})

// =======================================================

router.post('/signup', function (req, res) {
  const { email, password, role } = req.body

  console.log(req.body)

  if (!email || !password || !role) {
    return res.status(400).json({
      message: 'Помилка. Обовьязкові поля відсцтні',
    })
  }

  try {
    const user = User.getByEmail(email)

    if (user) {
      return res.status(400).json({
        message:
          'Помилка. Користувач з таким email вже існує',
      })
    }
    const newUser = User.create({ email, password, role })

    const session = Session.create(newUser)

    Confirm.create(newUser.email)

    return res.status(200).json({
      message: 'Користувач успішно зареєстрований',
      session,
    })
  } catch (e) {
    return res.status(400).json({
      message: 'Помилка створення користувача.' + e.message,
    })
  }
})

// =======================================================

// Відновлення паролю
router.get('/recovery', function (req, res) {
  res.render('recovery', {
    name: 'recovery',
    component: ['back-button', 'field'],
    title: 'Recovery page',
    data: {},
  })
})

router.post('/recovery', function (req, res) {
  const { email } = req.body

  console.log(email)

  if (!email) {
    return res.status(400).json({
      message: "Помилка. Обов'язкові поля відсутні",
    })
  }

  try {
    const user = User.getByEmail(email)

    if (!user) {
      return res.status(400).json({
        message: 'Користувач з таким email не існує',
      })
    }

    Confirm.create(email)

    return res.status(200).json({
      message: 'Код для відновлення паролю відправлено',
    })
  } catch (e) {
    return res.status(400).json({
      message: e.message,
    })
  }
})

router.get('/recovery-confirm', function (req, res) {
  res.render('recovery-confirm', {
    name: 'recovery-confirm',
    component: ['back-button', 'field', 'field-password'],
    title: 'Recovery confirm page',
    data: {},
  })
})

router.post('/recovery-confirm', function (req, res) {
  const { password, code } = req.body

  if (!code || !password) {
    return res.status(400).json({
      message: "Помилка. Обов'язкові поля відсутні",
    })
  }

  try {
    const email = Confirm.getData(Number(code))
    if (!email) {
      return res.status(400).json({
        message: 'Код не існує',
      })
    }

    const user = User.getByEmail(email)

    if (!user) {
      return res.status(400).json({
        message: 'Користувач не існує',
      })
    }

    user.password = password

    const session = Session.create(user)

    return res.status(200).json({
      message: 'Пароль змінено',
      session,
    })
  } catch (e) {
    return res.status(400).json({
      message: 'Помилка: ' + e.message,
    })
  }
})

// =======================================================

router.get('/signup-confirm', function (req, res) {
  const { renew, email } = req.query

  if (renew) {
    Confirm.create(email)
  }

  res.render('signup-confirm', {
    name: 'signup-confirm',
    component: ['back-button', 'field', 'field-password'],
    title: 'Signup confirm page',
    data: {},
  })
})

router.post('/signup-confirm', function (req, res) {
  const { code, token } = req.body

  if (!code || !token) {
    return res.status(400).json({
      message: "Помилка. Обов'язкові поля відсутні",
    })
  }

  try {
    const session = Session.get(token)

    if (!session) {
      return res.status(400).json({
        message: 'Помилка. Ви не увійшли в акаунт',
      })
    }

    const email = Confirm.getData(code)

    if (!email) {
      return res.status(400).json({
        message: 'Помилка. Код не існує',
      })
    }

    if (email !== session.user.email) {
      return res.status(400).json({
        message: 'Код не дійсний',
      })
    }

    // const user = User.getByEmail(session.user.email)
    // user.isConfirm = true

    session.user.isConfirm = true

    return res.status(200).json({
      message: 'Ви підтвердили свою пошту',
      session,
    })
  } catch (e) {
    return res.status(400).json({
      message: 'Помилка: ' + e.message,
    })
  }
})

// =======================================================

// Enter
router.get('/login', function (req, res) {
  res.render('login', {
    name: 'login',
    component: ['back-button', 'field'],
    title: 'Login page',
    data: {},
  })
})

router.post('/login', function (req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      message: "Помилка. Обов'язкові поля відсутні",
    })
  }

  try {
    const user = User.getByEmail(email)

    if (!user) {
      return res.status(400).json({
        message: 'Користувач з таким емайлом не існує',
      })
    }

    if (user.password !== password) {
      return res.status(400).json({
        message: 'Пароль не підходить',
      })
    }

    const session = Session.create(user)

    return res.status(200).json({
      message: 'Ви увійшли',
      session,
    })
  } catch (e) {
    return res.status(400).json({
      message: e.message,
    })
  }
})

// Підключаємо роутер до бек-енду
module.exports = router
