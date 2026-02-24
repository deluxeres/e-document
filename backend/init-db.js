// init-db.js
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./data.db');

console.log('Database initialized');
db.close();