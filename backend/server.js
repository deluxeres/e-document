import express from "express";
import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import axios from "axios";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SECRET = "SUPER_SECRET_KEY";
const db = new sqlite3.Database("./data.db");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Недопустимий формат файлу. Тільки зображення!"), false);
};

const upload = multer({ storage, fileFilter });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             phone TEXT UNIQUE,
                                             password TEXT,
                                             name TEXT,
                                             surname TEXT,
                                             patronymic TEXT,
                                             photo_url TEXT,
                                             birth_date TEXT,
                                             verification_status TEXT DEFAULT 'not_verified',
                                             verified_at TEXT DEFAULT NULL,
                                             two_factor_enabled INTEGER DEFAULT 0,
                                             two_factor_secret TEXT DEFAULT NULL
          )`);

  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) return;
    const names = columns.map((column) => column.name);
    if (!names.includes("verification_status")) {
      db.run("ALTER TABLE users ADD COLUMN verification_status TEXT DEFAULT 'not_verified'");
    }
    if (!names.includes("verified_at")) {
      db.run("ALTER TABLE users ADD COLUMN verified_at TEXT DEFAULT NULL");
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS document_types (
                                                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                      name TEXT,
                                                      is_custom INTEGER DEFAULT 0
          )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, 
    type_id INTEGER, 
    status TEXT,
    photo_url TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS document_dynamic_fields (
                                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                               document_id INTEGER,
                                                               field_name TEXT,
                                                               field_value TEXT,
                                                               FOREIGN KEY(document_id) REFERENCES user_documents(id) ON DELETE CASCADE
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS doc_id_cards (
                                                    document_id INTEGER PRIMARY KEY,
                                                    number TEXT,
                                                    record_number TEXT,
                                                    authority TEXT,
                                                    issue_date TEXT,
                                                    expiry_date TEXT,
                                                    country TEXT
          )`);

  db.run(`CREATE TABLE IF NOT EXISTS doc_passports_old (
                                                         document_id INTEGER PRIMARY KEY,
                                                         series TEXT,
                                                         number TEXT,
                                                         issued_by TEXT,
                                                         issue_date TEXT
          )`);

  db.run(`CREATE TABLE IF NOT EXISTS doc_driver_licenses (
                                                           document_id INTEGER PRIMARY KEY,
                                                           number TEXT,
                                                           categories TEXT,
                                                           issue_date TEXT,
                                                           expiry_date TEXT
          )`);

  db.run(`CREATE TABLE IF NOT EXISTS doc_residence_permits (
                                                             document_id INTEGER PRIMARY KEY,
                                                             number TEXT,
                                                             tax_id TEXT,
                                                             country TEXT,
                                                             authority TEXT,
                                                             issue_date TEXT,
                                                             expiry_date TEXT
          )`);

  db.run(`CREATE TABLE IF NOT EXISTS doc_international_passports (
                                                                   document_id INTEGER PRIMARY KEY,
                                                                   number TEXT,
                                                                   tax_id TEXT,
                                                                   country TEXT,
                                                                   authority TEXT,
                                                                   issue_date TEXT,
                                                                   expiry_date TEXT
          )`);

  db.get("SELECT count(*) as count FROM document_types", (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare(
        "INSERT INTO document_types (id, name, is_custom) VALUES (?, ?, ?)",
      );
      stmt.run(1, "ID-картка", 0);
      stmt.run(2, "Паспорт (книжечка)", 0);
      stmt.run(3, "Посвідчення водія", 0);
      stmt.run(4, "Посвідка на проживання", 0);
      stmt.run(5, "Закордонний паспорт", 0);
      stmt.run(99, "Власний документ", 1);
      stmt.finalize();
      console.log("Типи документів ініціалізовані");
    }
  });
});

app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Файл не обрано" });
  res.json({ url: `http://localhost:4000/uploads/${req.file.filename}` });
});

app.post("/register", (req, res) => {
  const { phone, password, name, surname, patronymic, photo_url, birth_date } =
    req.body;
  const hash = bcrypt.hashSync(password, 8);
  db.run(
    `INSERT INTO users (phone, password, name, surname, patronymic, photo_url, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      phone ? phone.replace(/\D/g, "") : "",
      hash,
      name,
      surname,
      patronymic,
      photo_url,
      birth_date,
    ],
    function (err) {
      if (err)
        return res.status(400).json({ error: "Цей номер вже зареєстровано" });
      res.json({ id: this.lastID, name });
    },
  );
});

app.post("/login", (req, res) => {
  const { phone, password } = req.body;
  const cleanPhone = phone ? phone.replace(/\D/g, "") : "";

  db.get("SELECT * FROM users WHERE phone = ?", [cleanPhone], (err, user) => {
    if (err || !user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Невірні дані для входу" });
    }

    if (user.two_factor_enabled) {
      return res.json({ require2FA: true, userId: user.id });
    }

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "24h" });
    const { password: _, two_factor_secret: __, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  });
});

app.post("/login/2fa", (req, res) => {
  const { userId, code } = req.body;

  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
    if (err || !user)
      return res.status(404).json({ error: "Користувача не знайдено" });

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: "base32",
      token: code,
    });

    if (verified) {
      const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "24h" });
      const {
        password: _,
        two_factor_secret: __,
        ...userWithoutPassword
      } = user;
      res.json({ token, user: userWithoutPassword });
    } else {
      res.status(400).json({ error: "Невірний код підтвердження" });
    }
  });
});

app.post("/users/:id/2fa/setup", (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `E-document (ID: ${req.params.id})`,
  });

  QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
    if (err) return res.status(500).json({ error: "Ошибка генерации QR" });
    res.json({
      secret: secret.base32,
      qrCode: data_url,
    });
  });
});

app.post("/users/:id/2fa/verify", (req, res) => {
  const { id } = req.params;
  const { code, secret } = req.body;

  const verified = speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    token: code,
  });

  if (verified) {
    db.run(
      "UPDATE users SET two_factor_enabled = 1, two_factor_secret = ? WHERE id = ?",
      [secret, id],
      function (err) {
        if (err) return res.status(500).json({ error: "Ошибка БД" });
        res.json({ success: true });
      },
    );
  } else {
    res.status(400).json({ error: "Невірний код. Спробуйте ще раз." });
  }
});

app.post("/users/:id/2fa/disable", (req, res) => {
  db.run(
    "UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL, verification_status = 'not_verified', verified_at = NULL WHERE id = ?",
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: "Ошибка БД" });
      res.json({ success: true });
    },
  );
});

const getMissingVerificationFields = (user) => {
  const checks = [
    { key: "surname", label: "Прізвище" },
    { key: "name", label: "Ім'я" },
    { key: "phone", label: "Телефон" },
    { key: "birth_date", label: "Дата народження" },
    { key: "photo_url", label: "Фото профілю" },
  ];
  const missing = checks
    .filter((check) => !user?.[check.key])
    .map((check) => check.label);

  if (!user?.two_factor_enabled) {
    missing.push("Двофакторна аутентифікація");
  }

  return missing;
};

app.post("/users/:id/verify-profile", (req, res) => {
  db.get("SELECT * FROM users WHERE id = ?", [req.params.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: "Користувача не знайдено" });
    }

    const missingFields = getMissingVerificationFields(user);
    const isVerified = missingFields.length === 0;
    const status = isVerified ? "verified" : "not_verified";
    const verifiedAt = isVerified ? new Date().toISOString() : null;

    db.run(
      "UPDATE users SET verification_status = ?, verified_at = ? WHERE id = ?",
      [status, verifiedAt, req.params.id],
      (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ error: "Помилка БД" });
        }

        db.get("SELECT * FROM users WHERE id = ?", [req.params.id], (selectErr, updatedUser) => {
          if (selectErr || !updatedUser) {
            return res.status(500).json({ error: "Помилка БД" });
          }

          const { password: _, two_factor_secret: __, ...userWithoutPassword } = updatedUser;
          res.json({
            verified: isVerified,
            missingFields,
            user: userWithoutPassword,
          });
        });
      },
    );
  });
});

app.get("/documents/:userId", (req, res) => {
  const sql = `
        SELECT ud.id, ud.type_id, ud.photo_url, dt.name as type_name, dt.is_custom, ud.status,
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

  db.all(sql, [req.params.userId], async (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const cleanedRows = await Promise.all(
      (rows || []).map(async (row) => {
        let customFields = [];
        if (Number(row.type_id) === 99) {
          customFields = await new Promise((resolve) => {
            db.all(
              "SELECT field_name, field_value FROM document_dynamic_fields WHERE document_id = ?",
              [row.id],
              (err, f) => {
                resolve(f || []);
              },
            );
          });
        }

        const nameField = customFields.find(
          (f) => f.field_name === "Назва документа",
        );

        return {
          id: row.id,
          type_id: row.type_id,
          status: row.status,
          photo_url: row.photo_url,
          display_number:
            row.id_number ||
            row.pass_num ||
            row.lic_num ||
            row.res_num ||
            row.int_num ||
            "---",
          display_authority:
            row.id_auth || row.pass_auth || row.res_auth || row.int_auth,
          display_country:
            row.id_cnt || row.res_cnt || row.int_cnt || "УКРАЇНА",
          issue_date:
            row.id_iss ||
            row.pass_iss ||
            row.lic_iss ||
            row.res_iss ||
            row.int_iss,
          expiry_date:
            row.id_exp ||
            row.lic_exp ||
            row.res_exp ||
            row.int_exp ||
            "Безстроково",
          custom_fields: customFields,
          type: {
            id: row.type_id,
            name: nameField ? nameField.field_value : row.type_name,
            is_custom: Number(row.type_id) === 99 ? 1 : 0,
          },
          ...(row.pass_ser && { series: row.pass_ser }),
          ...(row.lic_cat && { categories: row.lic_cat }),
          ...(row.record_number && { record_number: row.record_number }),
          ...((row.res_tax || row.int_tax) && {
            tax_id: row.res_tax || row.int_tax,
          }),
        };
      }),
    );
    res.json(cleanedRows);
  });
});

app.post("/documents", (req, res) => {
  const { user_id, type_id, fields, photo_url } = req.body;

  if (!user_id || !type_id) {
    return res.status(400).json({ error: "user_id и type_id обов'язкові" });
  }

  db.run(
    "INSERT INTO user_documents (user_id, type_id, status, photo_url) VALUES (?, ?, ?, ?)",
    [user_id, type_id, "active", photo_url || null],
    function (err) {
      if (err) {
        console.error("Помилка при створенні user_documents:", err.message);
        return res.status(400).json({ error: err.message });
      }

      const docId = this.lastID;

      if (Number(type_id) === 99) {
        if (!fields || Object.keys(fields).length === 0) {
          return res.json({ id: docId, success: true });
        }

        const stmt = db.prepare(
          "INSERT INTO document_dynamic_fields (document_id, field_name, field_value) VALUES (?, ?, ?)",
        );

        Object.entries(fields).forEach(([key, val]) => {
          stmt.run(docId, key, val);
        });

        stmt.finalize((finalizeErr) => {
          if (finalizeErr)
            return res
              .status(500)
              .json({ error: "Помилка збереження полів документу" });
          res.json({ id: docId, success: true });
        });
      } else {
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
          case 5:
            const tableName =
              Number(type_id) === 4
                ? "doc_residence_permits"
                : "doc_international_passports";
            sql = `INSERT INTO ${tableName} (document_id, number, tax_id, country, authority, issue_date, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
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
      }
    },
  );
});

app.delete("/documents/:userId/:documentId", (req, res) => {
  const { documentId } = req.params;
  const tables = [
    "document_dynamic_fields",
    "doc_id_cards",
    "doc_passports_old",
    "doc_driver_licenses",
    "doc_residence_permits",
    "doc_international_passports",
    "user_documents",
  ];
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    tables.forEach((t) =>
      db.run(
        `DELETE FROM ${t} WHERE ${t === "user_documents" ? "id" : "document_id"} = ?`,
        [documentId],
      ),
    );
    db.run("COMMIT", () => res.json({ success: true }));
  });
});

app.get("/document-types", (req, res) => {
  db.all("SELECT id, name, is_custom FROM document_types", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put("/users/:id", (req, res) => {
  const { name, surname, patronymic, phone, birth_date, photo_url } = req.body;
  const sql = `UPDATE users SET name = ?, surname = ?, patronymic = ?, phone = ?, birth_date = ?, photo_url = ?, verification_status = 'not_verified', verified_at = NULL WHERE id = ?`;
  db.run(
    sql,
    [
      name,
      surname,
      patronymic,
      phone ? phone.replace(/\D/g, "") : "",
      birth_date,
      photo_url,
      req.params.id,
    ],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ success: true });
    },
  );
});

app.put("/users/:id/password", (req, res) => {
  const { oldPassword, newPassword } = req.body;
  db.get(
    "SELECT password FROM users WHERE id = ?",
    [req.params.id],
    (err, user) => {
      if (user && bcrypt.compareSync(oldPassword, user.password)) {
        db.run(
          "UPDATE users SET password = ? WHERE id = ?",
          [bcrypt.hashSync(newPassword, 8), req.params.id],
          () => {
            res.json({ success: true });
          },
        );
      } else {
        res.status(400).json({ error: "Пароль невірний" });
      }
    },
  );
});

app.get("/get-base64", async (req, res) => {
  try {
    const response = await axios.get(req.query.url, {
      responseType: "arraybuffer",
    });
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    res.json({
      base64: `data:${response.headers["content-type"]};base64,${base64}`,
    });
  } catch (error) {
    res.status(500).json({ error: "error" });
  }
});

app.get("/public-document/:documentId", (req, res) => {
  const sql = `
    SELECT ud.*, dt.name as type_name, dt.is_custom, u.name as user_name, u.surname as user_surname, u.patronymic as user_patronymic, u.photo_url as user_photo, u.birth_date as user_birth,
    dic.number as id_num, dic.authority as id_auth, dic.issue_date as id_iss, dic.expiry_date as id_exp, dic.country as id_cnt,
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
  db.get(sql, [req.params.documentId], async (err, row) => {
    if (!row) return res.status(404).json({ error: "Not found" });
    let customFields = [];
    if (row.is_custom === 1) {
      customFields = await new Promise((res) => {
        db.all(
          "SELECT field_name, field_value FROM document_dynamic_fields WHERE document_id = ?",
          [row.id],
          (e, f) => res(f || []),
        );
      });
    }
    res.json({
      ...row,
      custom_fields: customFields,
      display_number:
        row.id_num || row.pass_num || row.lic_num || row.res_num || row.int_num,
      user: {
        name: row.user_name,
        surname: row.user_surname,
        patronymic: row.user_patronymic,
        photo_url: row.user_photo,
        birth_date: row.user_birth,
      },
    });
  });
});

app.listen(4000, () => console.log("Server running on port 4000"));
