import express from "express";
import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import axios from "axios";

const SECRET = "SUPER_SECRET_KEY";
const db = new sqlite3.Database("./data.db");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Замени блок инициализации на этот:
db.serialize(() => {
  // Создаем таблицу для Посвідки
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

  // Пытаемся добавить колонку country в id_cards.
  // Если она уже есть, sqlite выдаст ошибку, которую мы просто игнорируем в коллбэке.
  db.run("ALTER TABLE doc_id_cards ADD COLUMN country TEXT", (err) => {
    if (err) {
      // Если ошибка "duplicate column name", значит колонка уже есть — это нормально.
      console.log("Column 'country' already exists or other DB status.");
    }
  });
});

app.post("/register", (req, res) => {
  const { phone, password, name, surname, patronymic, photo_url, birth_date } =
    req.body;
  const hash = bcrypt.hashSync(password, 8);
  const sql = `INSERT INTO users (phone, password, name, surname, patronymic, photo_url, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(
    sql,
    [phone, hash, name, surname, patronymic, photo_url, birth_date],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({
        id: this.lastID,
        phone,
        name,
        surname,
        patronymic,
        photo_url,
        birth_date,
      });
    },
  );
});

app.post("/login", (req, res) => {
  const { phone, password } = req.body;
  db.get("SELECT * FROM users WHERE phone = ?", [phone], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
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

    const cleanedRows = (rows || []).map((row) => {
      // Создаем чистый базовый объект
      const cleanDoc = {
        id: row.id,
        type_id: row.type_id,
        status: row.status,
        type: { id: row.type_id, name: row.type_name },
        // Универсальные поля для Card.jsx
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
      };

      // Добавляем специфические поля только если они есть
      if (row.pass_ser) cleanDoc.series = row.pass_ser;
      if (row.lic_cat) cleanDoc.categories = row.lic_cat;
      if (row.record_number) cleanDoc.record_number = row.record_number;
      if (row.res_tax || row.int_tax)
        cleanDoc.tax_id = row.res_tax || row.int_tax;

      return cleanDoc;
    });

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

// ===========================
// УДАЛЕНИЕ ДОКУМЕНТА
// ===========================
app.delete("/documents/:userId/:documentId", (req, res) => {
  const { userId, documentId } = req.params;

  db.get(
    "SELECT id, type_id FROM user_documents WHERE id = ? AND user_id = ?",
    [documentId, userId],
    (err, doc) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!doc) return res.status(404).json({ error: "Документ не знайдено" });

      const typeId = Number(doc.type_id);
      let tablesToDelete = ["user_documents"];

      // Определяем, из какой дочерней таблицы также нужно удалить данные
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

        // Удаляем из таблицы с деталями
        if (detailTable) {
          db.run(`DELETE FROM ${detailTable} WHERE document_id = ?`, [
            documentId,
          ]);
        }

        // Удаляем основную запись
        db.run(
          "DELETE FROM user_documents WHERE id = ?",
          [documentId],
          (err) => {
            if (err) {
              db.run("ROLLBACK");
              return res.status(500).json({ error: "Помилка при видаленні" });
            }
            db.run("COMMIT");
            res.json({ success: true, message: "Документ видалено" });
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
      headers: { "User-Agent": "Mozilla/5.0...", Accept: "image/*" },
      timeout: 5000,
    });
    const contentType = response.headers["content-type"];
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    res.json({ base64: `data:${contentType};base64,${base64}` });
  } catch (error) {
    res.status(500).json({ error: "Ошибка прокси" });
  }
});

app.listen(4000, () => console.log("Server running on port 4000"));
