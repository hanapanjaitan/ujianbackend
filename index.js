const express = require('express')
const app = express()
const PORT = 7000
const bodyParser = require('body-parser')
const cors = require('cors')
const bearerToken = require('express-bearer-token')
const fs = require('fs')
const handlebars = require('handlebars')
const mysql = require('mysql')
const nodemailer = require('nodemailer')

require('dotenv').config()
app.use(cors())
app.use(bearerToken())
app.use(bodyParser.json())
app.use(express.static('public'))

const db = mysql.createConnection({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_DATABASE,
    port: 3306
})

db.connect((err)=>{
    if(err){
        console.log(err)
    }
    console.log('success')
})


let transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: 'hannah4669@gmail.com',
        pass: 'pbfpmnwqfjqpbgjw'
    },
    tls: {
        rejectUnauthorized: false
    }
})

const generatorOTP=()=>{
    return Math.floor(1000 + Math.random() * 9000)
}

const getTodayDate=()=>{
    // For todays date;
    Date.prototype.today = function () { 
        return this.getFullYear() +"-"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"-"+ ((this.getDate() < 10)?"0":"") + this.getDate();
    }
    // For the time now
    Date.prototype.timeNow = function () {
         return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
    }
    
    return new Date().today() + " " + new Date().timeNow();

}

app.get('/', (req, res)=>{
    res.send('<h1> Welcome to API MARKETPLACE </h1>')
})

// NOMOR 1
app.post('/sendMail', (req, res)=>{
    const {email} = req.body
    const htmlRender = fs.readFileSync('./email.html', 'utf8')
    const template = handlebars.compile(htmlRender) // return function
    const htmlEmail = template({otp: generatorOTP()})

    transporter.sendMail({
        from : 'Peri Cantik <hannah4669@gmail.com>',
        to: email,
        subject: 'Verifikasi akun anda',
        html:htmlEmail
    }).then(()=>{
        return res.send('berhasil')
    }).catch((err)=>{
        return res.status(500).send({message: err.message})
    })
})




// NOMOR 2

app.get('/report', (req, res)=>{
    // pendapatan sekarang
    let sql = `select sum(quantity * hargabeli * 0.1) as pendapatan
    from transaksi where status = 'Finished';`
    db.query(sql, (err, pendapatan)=>{
        if(err) res.status(500).send({message: err.message})

        sql = `select sum(quantity * hargabeli * 0.1) as pendapatanPotensial
        from transaksi;`
        db.query(sql, (err, pendapatanPotensial)=>{
            if(err) res.status(500).send({message: err.message})

            sql = `select p.id, t.status, p.namatoko, count(*) as banyakPenjualan
            from transaksi t join penjual p
            on t.penjualid = p.id
            where t.status = 'Finished'
            group by p.id
            order by banyakPenjualan desc limit 1;`
            db.query(sql, (err, bestPenjual)=>{
                if(err) res.status(500).send({message: err.message})

                sql = `select cp.id, cp.namacategory, t.status, count(*) as banyakterjual
                from transaksi t join products p on t.productid = p.id
                join category_products cp on p.categoryprodid = cp.id
                where t.status = 'Finished'
                group by cp.id
                order by banyakterjual desc limit 1;`
                db.query(sql, (err, bestCategory)=>{
                    if(err) res.status(500).send({message: err.message})

                    sql = `select count(*) as jumlahUserBukanPenjual
                    from users u left join penjual p
                    on u.id = p.userid
                    where p.id is null; `
                    db.query(sql, (err, userNotSeller)=>{
                        if(err) res.status(500).send({message: err.message})

                        return res.send({
                            pendapatan: pendapatan[0].pendapatan,
                            pendapatanPotensial: pendapatanPotensial[0].pendapatanPotensial,
                            bestPenjual: bestPenjual[0].namatoko,
                            bestCategory: bestCategory[0].namacategory,
                            userNotSeller: userNotSeller[0].jumlahUserBukanPenjual
                        })
                    })
                })
            })
        })
    })
})

// NOMOR 3
app.get('/top6Products', (req, res)=>{
    let sql = `select t.id as transid, pr.id as prodid, count(*) as banyakTransaksi, pj.namatoko, pr.nama as namaproduk,
    pr.informasiproduct, pr.image
    from transaksi t join penjual pj on t.penjualid = pj.id
    join products pr on t.productid = pr.id
    group by pr.id
    order by banyakTransaksi desc limit 6;`

    db.query(sql, (err, best6Products)=>{
        if(err) res.status(500).send({message: err.message})

        return res.send(best6Products)
    })
})


app.listen(PORT, ()=>{
    console.log('jalan di port: ', PORT)
})













// app.post('/register', (req, res)=>{
//     const {username, email, password} = req.body
//     let sql = `select * from users where username = ?`
//     db.query(sql, [username],(err, users)=>{
//         if(err) return res.status(500).send({message: err.message})
//         if(users.length){
//             return res.status(500).send({message: 'username sudah ada'})
//         }else{
//             console.log('aaa')
//             var data  = {
//                 username,
//                 email,
//                 password,
//                 roleid: 3,
//                 lastlogin: getTodayDate(),
//                 statusver: 'unverified',
//                 otp: generatorOTP()
//             }
//             sql = `insert into users set ?`
//             db.query(sql, data, (err, results)=>{
//                 if(err) return res.status(500).send({message: err.message})

//                 console.log('berhasil post data users')
//                 console.log(results.insertId)
//                 sql = `select * from users where id = ?;`
//                 db.query(sql, [results.insertId], (err, userslogin)=>{
//                     if(err) return res.status(500).send({message: err.message})
                    
//                     console.log('b4fff')
//                     const htmlRender = fs.readFileSync('./index.html', 'utf8')
//                     const template = handlebars.compile(htmlRender) // return function
//                     const htmlEmail = template({name: userslogin[0].username, otp:userslogin[0].otp})

//                     transporter.sendMail({
//                         from : 'Peri Cantik <hannah4669@gmail.com>',
//                         to: email,
//                         subject: 'Verifikasi akun anda',
//                         html:htmlEmail
//                     }).then(()=>{
//                         // console.log('akakaka')
//                         // console.log(email, htmlEmail)
//                         return res.send(userslogin[0])
//                     }).catch((err)=>{
//                         return res.status(500).send({message: err.message})
//                     })
//                 })
//             })
//         }
//     })
// })

// app.post('/verifikasi', (req, res)=>{
//     const {username, otp} = req.body
//     let sql = `select * from users where username = ${db.escape(username)} and otp = ${db.escape(otp)};;`

//     db.query(sql, (err, dataVerif)=>{
//         if(err) res.status(500).send({message: err.message})

//         if(dataVerif.length){
//             var dataupdate= {statusver: 'verified'}
//             sql = `update users set ? where username=${db.escape(dataVerif[0].username)}`

//             db.query(sql, dataupdate, (err)=>{
//                 if(err) res.status(500).send({message: err.message})

//                 return res.status(200).send('akun anda telah di verified')
//             })
//         }else{
//             return res.status(500).send({message: 'username/otp salah'})
//         }
//     })
// })