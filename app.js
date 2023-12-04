const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const {
  loadContact,
  findContact,
  addContact,
  cekDuplikat,
  deleteContact,
} = require('./utils/contacts');
const { body, validationResult, check } = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const app = express();
const port = 9000;

app.set('view engine', 'ejs');
app.use(expressLayouts);

// Built in middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Konfigurasi flash
app.use(cookieParser('secret'));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash);

app.get('/', (req, res) => {
  const mahasiswa = [
    {
      nama: 'John',
      email: 'John@gmail.com',
    },
    {
      nama: 'Asep',
      email: 'Asep@gmail.com',
    },
    {
      nama: 'Walter',
      email: 'walter@gmail.com',
    },
  ];
  res.render('index', {
    layout: 'layouts/main-layout',
    nama: 'John',
    mahasiswa,
    title: 'Halaman Home',
  });
  console.log(mahasiswa);
});

app.get('/about', (req, res) => {
  res.render('about', {
    title: 'Halaman About',
    layout: 'layouts/main-layout',
  });
});

app.get('/contact', (req, res) => {
  const contacts = loadContact();

  res.render('contact', {
    title: 'Halaman Contact',
    layout: 'layouts/main-layout',
    contacts: contacts,
    msg: req.flash('msg'),
  });
});

// halaman form tambah data contact
app.get('/contact/add', (req, res) => {
  res.render('add-contact', {
    title: 'Form Tambah Data Contact',
    layout: 'layouts/main-layout',
  });
});

// proses data contact
app.post(
  '/contact',
  [
    body('nama').custom((value) => {
      const duplikat = cekDuplikat(value);
      if (duplikat) {
        throw new Error('Nama contact sudah terdaftar');
      }
      return true;
    }),
    check('email', 'Email tidak valid').isEmail(),
    check('nohp', 'No Hp tidak valid').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //   return res.status(400).json({ errors: errors.array() });
      res.render('add-contact', {
        title: 'Form Tambah Data Contact',
        layout: 'layouts/main-layout',
        errors: errors.array(),
      });
    } else {
      addContact(req.body);

      req.flash('msg', 'Data contact berhasil ditambahkan');
      res.redirect('/contact');
    }
  }
);

// delete contact
app.get('/contact/delete/:nama', (req, res) => {
  const contact = findContact(req.params.nama);

  // jika contact tidak ada
  if (!contact) {
    res.status(404);
    res.send('<h1>404</h1>');
  } else {
    deleteContact(req.params.nama);

    req.flash('msg', 'Data contact berhasil dihapus');
    res.redirect('/contact');
  }
});

// form ubah data contact
app.get('/contact/edit/:nama', (req, res) => {
  const contact = findContact(req.params.nama);

  res.render('edit-contact', {
    title: 'Form Ubah Data Contact',
    layout: 'layouts/main-layout',
    contact: contact,
  });
});

// proses uabh data
app.post(
  '/contact/update',
  [
    body('nama').custom((value) => {
      const duplikat = cekDuplikat(value);
      if (duplikat) {
        throw new Error('Nama contact sudah terdaftar');
      }
      return true;
    }),
    check('email', 'Email tidak valid').isEmail(),
    check('nohp', 'No Hp tidak valid').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //   return res.status(400).json({ errors: errors.array() });
      res.render('edit-contact', {
        title: 'Form Ubah Data Contact',
        layout: 'layouts/main-layout',
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      addContact(req.body);

      req.flash('msg', 'Data contact berhasil diubah');
      res.redirect('/contact');
    }
  }
);

// detail contact
app.get('/contact/:nama', (req, res) => {
  const contact = findContact(req.params.nama);

  res.render('detail', {
    title: 'Halaman Detail Contact',
    layout: 'layouts/main-layout',
    contact: contact,
  });
});

app.listen(port, () => {
  console.log(`Example app listening at https://localhost:${port}`);
});
