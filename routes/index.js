const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const conn = mysql.createConnection({
  host      : 'localhost',
  user      : 'root',
  password  : '111111',
  database  : 'vans'
})
conn.connect()

const admin = require('firebase-admin')
const serviceAccount = require('../vans-d2964-firebase-adminsdk-mim3s-7de5741ab6.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.send('Hello Hackerton!')
})

router.post('/user', (req, res, next) => {
  var token = req.query.token
  console.log(token)

  conn.query(`INSERT INTO user VALUES (null, '${token}')`, (err, fields) => {
    if (err) throw err
    res.send('보호자 앱 등록이 완료되었습니다.')
  })
})

router.post('/send', (req, res, next) => {
  console.log(req.body)
  conn.query('SELECT token FROM user', (err, rows, fields) => {
    if (err) throw err

    var fcm_target_token = rows[rows.length - 1].token
    var fcm_message = {
      notification: {
        title: '위급 상황 발생 : ' + req.body.address,
        body: `위도 ${req.body.latitude} / 경도 ${req.body.longitude}`
      },
      data: {
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        address: req.body.address
      },
      token: fcm_target_token
    }

    admin.messaging().send(fcm_message)
      .then((response) => {
        res.send('보호자에게 알림이 전송되었습니다')
      })
      .catch((error) => {
        res.send('실패 : ' + error)
      })
  })
})

router.post('/', (req, res, next) => {
  console.log(req.body)
  res.send(req.body.foo)
})

module.exports = router;
