import express from "express";
import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import axios from "axios";
import multer from "multer"; // Добавлено
import path from "path"; // Добавлено
import fs from "fs"; // Добавлено
import { fileURLToPath } from "url"; // Добавлено

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SECRET = "SUPER_SECRET_KEY";
const db = new sqlite3.Database("./data.db");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ===========================
// НАСТРОЙКА ЗАГРУЗКИ ФОТО
// ===========================

// Создаем папку uploads, если её нет
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Настройка хранилища multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Фильтр: только изображения (не PDF и т.д.)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Недопустимий формат файлу. Тільки зображення!"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Раздача папки uploads как статики
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===========================
// ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ
// ===========================
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE,
    password TEXT,
    name TEXT,
    surname TEXT,
    patronymic TEXT,
    photo_url TEXT,
    birth_date TEXT
  )`);

  db.run(
    `CREATE TABLE IF NOT EXISTS document_types (id INTEGER PRIMARY KEY, name TEXT)`,
  );

  db.run(`CREATE TABLE IF NOT EXISTS user_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type_id INTEGER,
    status TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(
    `CREATE TABLE IF NOT EXISTS doc_id_cards (document_id INTEGER PRIMARY KEY, number TEXT, record_number TEXT, authority TEXT, issue_date TEXT, expiry_date TEXT, country TEXT)`,
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS doc_passports_old (document_id INTEGER PRIMARY KEY, series TEXT, number TEXT, issued_by TEXT, issue_date TEXT)`,
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS doc_driver_licenses (document_id INTEGER PRIMARY KEY, number TEXT, categories TEXT, issue_date TEXT, expiry_date TEXT)`,
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS doc_residence_permits (document_id INTEGER PRIMARY KEY, number TEXT, tax_id TEXT, country TEXT, authority TEXT, issue_date TEXT, expiry_date TEXT)`,
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS doc_international_passports (document_id INTEGER PRIMARY KEY, number TEXT, tax_id TEXT, country TEXT, authority TEXT, issue_date TEXT, expiry_date TEXT)`,
  );

  db.run("ALTER TABLE doc_id_cards ADD COLUMN country TEXT", (err) => {
    if (err) console.log("Column 'country' already exists.");
  });

  db.get("SELECT count(*) as count FROM document_types", (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare(
        "INSERT INTO document_types (id, name) VALUES (?, ?)",
      );
      stmt.run(1, "ID-картка");
      stmt.run(2, "Паспорт (книжечка)");
      stmt.run(3, "Посвідчення водія");
      stmt.run(4, "Посвідка на проживання");
      stmt.run(5, "Закордонний паспорт");
      stmt.finalize();
    }
  });
});

// ===========================
// ЭНДПОИНТЫ
// ===========================

// Загрузка файла (отдельный шаг перед регистрацией)
app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Файл не обрано" });
  // Возвращаем полный URL загруженного файла
  const fileUrl = `http://localhost:4000/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

app.post("/register", (req, res) => {
  const { phone, password, name, surname, patronymic, photo_url, birth_date } =
    req.body;
  const cleanPhone = phone ? phone.replace(/\D/g, "") : "";
  const hash = bcrypt.hashSync(password, 8);

  const sql = `INSERT INTO users (phone, password, name, surname, patronymic, photo_url, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(
    sql,
    [cleanPhone, hash, name, surname, patronymic, photo_url, birth_date],
    function (err) {
      if (err)
        return res.status(400).json({ error: "Цей номер вже зареєстровано" });
      res.json({ id: this.lastID, phone: cleanPhone, name, photo_url });
    },
  );
});

app.post("/login", (req, res) => {
  const { phone, password } = req.body;
  const cleanPhone = phone ? phone.replace(/\D/g, "") : "";

  db.get("SELECT * FROM users WHERE phone = ?", [cleanPhone], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Невірні дані для входу" });
    }
    const token = jwt.sign({ id: user.id, phone: user.phone }, SECRET, {
      expiresIn: "24h",
    });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  });
});

app.get("/documents/:userId", (req, res) => {
  const sql = `
    SELECT ud.id, ud.type_id, dt.name as type_name, ud.status,
           dic.number as id_number, dic.record_number, dic.authority as id_auth, dic.issue_date as id_iss, dic.expiry_date as id_exp, dic.country as id_cnt,
           dp.series as pass_ser, dp.number as pass_num, dp.issued_by as pass_auth, dp.issue_date as pass_iss,
           dl.number as lic_num, dl.categories as lic_cat, dl.issue_date as lic_iss, dl.expiry_date as lic_exp,
           drp.number as res_num, drp.tax_id as res_tax, drp.country as res_cnt, drp.authority as res_auth, drp.issue_date as res_iss, drp.expiry_date as res_exp,
           dip.number as int_num, dip.tax_id as int_tax, dip.country as int_cnt, dip.authority as int_auth, dip.issue_date as int_iss, dip.expiry_date as int_exp
    FROM user_documents ud
           JOIN document_types dt ON ud.type_id = dt.id
           LEFT JOIN doc_id_cards dic ON ud.id = dic.document_id
           LEFT JOIN doc_passports_old dp ON ud.id = dp.document_id
           LEFT JOIN doc_driver_licenses dl ON ud.id = dl.document_id
           LEFT JOIN doc_residence_permits drp ON ud.id = drp.document_id
           LEFT JOIN doc_international_passports dip ON ud.id = dip.document_id
    WHERE ud.user_id = ?
  `;

  db.all(sql, [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const cleanedRows = (rows || []).map((row) => ({
      id: row.id,
      type_id: row.type_id,
      status: row.status,
      type: { id: row.type_id, name: row.type_name },
      display_number:
        row.id_number ||
        row.pass_num ||
        row.lic_num ||
        row.res_num ||
        row.int_num,
      display_authority:
        row.id_auth || row.pass_auth || row.res_auth || row.int_auth,
      display_country: row.id_cnt || row.res_cnt || row.int_cnt || "УКРАЇНА",
      issue_date:
        row.id_iss || row.pass_iss || row.lic_iss || row.res_iss || row.int_iss,
      expiry_date:
        row.id_exp ||
        row.lic_exp ||
        row.res_exp ||
        row.int_exp ||
        "Безстроково",
      ...(row.pass_ser && { series: row.pass_ser }),
      ...(row.lic_cat && { categories: row.lic_cat }),
      ...(row.record_number && { record_number: row.record_number }),
      ...((row.res_tax || row.int_tax) && {
        tax_id: row.res_tax || row.int_tax,
      }),
    }));
    res.json(cleanedRows);
  });
});

app.post("/documents", (req, res) => {
  const { user_id, type_id, ...fields } = req.body;
  db.run(
    "INSERT INTO user_documents (user_id, type_id, status) VALUES (?, ?, ?)",
    [user_id, type_id, "active"],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      const docId = this.lastID;
      let sql = "";
      let params = [];

      switch (Number(type_id)) {
        case 1:
          sql =
            "INSERT INTO doc_id_cards (document_id, number, record_number, authority, issue_date, expiry_date, country) VALUES (?, ?, ?, ?, ?, ?, ?)";
          params = [
            docId,
            fields.number,
            fields.record_number,
            fields.authority,
            fields.issue_date,
            fields.expiry_date,
            fields.country,
          ];
          break;
        case 2:
          sql =
            "INSERT INTO doc_passports_old (document_id, series, number, issued_by, issue_date) VALUES (?, ?, ?, ?, ?)";
          params = [
            docId,
            fields.series,
            fields.number,
            fields.issued_by,
            fields.issue_date,
          ];
          break;
        case 3:
          sql =
            "INSERT INTO doc_driver_licenses (document_id, number, categories, issue_date, expiry_date) VALUES (?, ?, ?, ?, ?)";
          params = [
            docId,
            fields.number,
            fields.categories,
            fields.issue_date,
            fields.expiry_date,
          ];
          break;
        case 4:
          sql =
            "INSERT INTO doc_residence_permits (document_id, number, tax_id, country, authority, issue_date, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)";
          params = [
            docId,
            fields.number,
            fields.tax_id,
            fields.country,
            fields.authority,
            fields.issue_date,
            fields.expiry_date,
          ];
          break;
        case 5:
          sql =
            "INSERT INTO doc_international_passports (document_id, number, tax_id, country, authority, issue_date, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)";
          params = [
            docId,
            fields.number,
            fields.tax_id,
            fields.country,
            fields.authority,
            fields.issue_date,
            fields.expiry_date,
          ];
          break;
      }

      if (sql) {
        db.run(sql, params, (err) => {
          if (err) return res.status(400).json({ error: err.message });
          res.json({ id: docId, success: true });
        });
      } else {
        res.json({ id: docId, success: true });
      }
    },
  );
});

app.delete("/documents/:userId/:documentId", (req, res) => {
  const { userId, documentId } = req.params;
  db.get(
    "SELECT id, type_id FROM user_documents WHERE id = ? AND user_id = ?",
    [documentId, userId],
    (err, doc) => {
      if (err || !doc)
        return res.status(404).json({ error: "Документ не знайдено" });
      const typeId = Number(doc.type_id);
      const detailTables = {
        1: "doc_id_cards",
        2: "doc_passports_old",
        3: "doc_driver_licenses",
        4: "doc_residence_permits",
        5: "doc_international_passports",
      };
      const detailTable = detailTables[typeId];

      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        if (detailTable)
          db.run(`DELETE FROM ${detailTable} WHERE document_id = ?`, [
            documentId,
          ]);
        db.run(
          "DELETE FROM user_documents WHERE id = ?",
          [documentId],
          (err) => {
            if (err) {
              db.run("ROLLBACK");
              return res.status(500).json({ error: "Помилка" });
            }
            db.run("COMMIT");
            res.json({ success: true, message: "Видалено" });
          },
        );
      });
    },
  );
});

app.get("/document-types", (req, res) => {
  db.all("SELECT id, name FROM document_types", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/get-base64", async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).json({ error: "URL не надано" });
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 5000,
    });
    const contentType = response.headers["content-type"];
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    res.json({ base64: `data:${contentType};base64,${base64}` });
  } catch (error) {
    res.status(500).json({ error: "Ошибка прокси" });
  }
});

app.put("/users/:id", (req, res) => {
  const { name, surname, patronymic, phone, birth_date, photo_url } = req.body;
  const cleanPhone = phone ? phone.replace(/\D/g, "") : "";
  const userId = req.params.id;

  const sql = `UPDATE users SET name = ?, surname = ?, patronymic = ?, phone = ?, birth_date = ?, photo_url = ? WHERE id = ?`;

  db.run(
    sql,
    [name, surname, patronymic, cleanPhone, birth_date, photo_url, userId],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ success: true, message: "Дані оновлено" });
    },
  );
});

app.put("/users/:id/password", (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.params.id;

  // 1. Сначала находим пользователя в базе
  db.get("SELECT password FROM users WHERE id = ?", [userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: "Користувача не знайдено" });
    }

    // 2. Проверяем, совпадает ли старый пароль
    const isMatch = bcrypt.compareSync(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Поточний пароль введено невірно" });
    }

    // 3. Хешируем новый пароль и сохраняем
    const newHash = bcrypt.hashSync(newPassword, 8);
    db.run(
      "UPDATE users SET password = ? WHERE id = ?",
      [newHash, userId],
      (err) => {
        if (err)
          return res.status(500).json({ error: "Помилка при оновленні" });
        res.json({ success: true, message: "Пароль змінено" });
      },
    );
  });
});

app.get("/public-document/:documentId", (req, res) => {
  const { documentId } = req.params;

  const sql = `
    SELECT ud.id, ud.type_id, dt.name as type_name, ud.status,
           u.name as user_name, u.surname as user_surname, u.patronymic as user_patronymic, 
           u.photo_url as user_photo, u.birth_date as user_birth,
           dic.number as id_number, dic.authority as id_auth, dic.issue_date as id_iss, dic.expiry_date as id_exp, dic.country as id_cnt,
           dp.series as pass_ser, dp.number as pass_num, dp.issued_by as pass_auth, dp.issue_date as pass_iss,
           dl.number as lic_num, dl.categories as lic_cat, dl.issue_date as lic_iss, dl.expiry_date as lic_exp,
           drp.number as res_num, drp.tax_id as res_tax, drp.country as res_cnt, drp.authority as res_auth, drp.issue_date as res_iss, drp.expiry_date as res_exp,
           dip.number as int_num, dip.tax_id as int_tax, dip.country as int_cnt, dip.authority as int_auth, dip.issue_date as int_iss, dip.expiry_date as int_exp
    FROM user_documents ud
           JOIN users u ON ud.user_id = u.id
           JOIN document_types dt ON ud.type_id = dt.id
           LEFT JOIN doc_id_cards dic ON ud.id = dic.document_id
           LEFT JOIN doc_passports_old dp ON ud.id = dp.document_id
           LEFT JOIN doc_driver_licenses dl ON ud.id = dl.document_id
           LEFT JOIN doc_residence_permits drp ON ud.id = drp.document_id
           LEFT JOIN doc_international_passports dip ON ud.id = dip.document_id
    WHERE ud.id = ?
  `;

  db.get(sql, [documentId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Документ не знайдено" });

    const result = {
      id: row.id,
      type_id: row.type_id,
      status: row.status,
      type: { id: row.type_id, name: row.type_name },
      display_number:
        row.id_number ||
        row.pass_num ||
        row.lic_num ||
        row.res_num ||
        row.int_num,
      display_authority:
        row.id_auth || row.pass_auth || row.res_auth || row.int_auth,
      display_country: row.id_cnt || row.res_cnt || row.int_cnt || "УКРАЇНА",
      issue_date:
        row.id_iss || row.pass_iss || row.lic_iss || row.res_iss || row.int_iss,
      expiry_date:
        row.id_exp ||
        row.lic_exp ||
        row.res_exp ||
        row.int_exp ||
        "Безстроково",
      categories: row.lic_cat || null,
      tax_id: row.res_tax || row.int_tax || null,
      // Вложенный объект пользователя
      user: {
        name: row.user_name,
        surname: row.user_surname,
        patronymic: row.user_patronymic,
        photo_url: row.user_photo,
        birth_date: row.user_birth,
      },
    };

    res.json(result);
  });
});

app.listen(4000, () => console.log("Server running on port 4000"));
