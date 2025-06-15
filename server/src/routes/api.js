const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { query, execute } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// File upload configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = 'uploads';
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow common image and document types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Apply authentication to all API routes
router.use(authenticateToken);

// Table mapping for API compatibility
const TABLE_MAPPING = {
  11424: 'agents',
  11425: 'orders',
  11426: 'stock_items',
  11428: 'product_config',
  17047: 'order_items'
};

// Get paginated table data
router.post('/table/:tableId/page', async (req, res) => {
  try {
    const tableId = req.params.tableId;
    const tableName = TABLE_MAPPING[tableId];

    if (!tableName) {
      return res.status(400).json({ error: 'Invalid table ID' });
    }

    const {
      PageNo = 1,
      PageSize = 10,
      OrderByField = 'id',
      IsAsc = false,
      Filters = []
    } = req.body;

    // Build WHERE clause
    let whereClause = '';
    let params = [];

    if (Filters && Filters.length > 0) {
      const conditions = [];
      for (const filter of Filters) {
        let condition = '';
        switch (filter.op) {
          case 'Equal':
            condition = `${filter.name} = ?`;
            params.push(filter.value);
            break;
          case 'GreaterThan':
            condition = `${filter.name} > ?`;
            params.push(filter.value);
            break;
          case 'GreaterThanOrEqual':
            condition = `${filter.name} >= ?`;
            params.push(filter.value);
            break;
          case 'LessThan':
            condition = `${filter.name} < ?`;
            params.push(filter.value);
            break;
          case 'LessThanOrEqual':
            condition = `${filter.name} <= ?`;
            params.push(filter.value);
            break;
          case 'StringContains':
            condition = `${filter.name} LIKE ?`;
            params.push(`%${filter.value}%`);
            break;
          case 'StringStartsWith':
            condition = `${filter.name} LIKE ?`;
            params.push(`${filter.value}%`);
            break;
          case 'StringEndsWith':
            condition = `${filter.name} LIKE ?`;
            params.push(`%${filter.value}`);
            break;
        }
        if (condition) conditions.push(condition);
      }
      if (conditions.length > 0) {
        whereClause = ' WHERE ' + conditions.join(' AND ');
      }
    }

    // Get total count
    const countResult = await query(`SELECT COUNT(*) as count FROM ${tableName}${whereClause}`, params);
    const totalCount = countResult[0].count;

    // Get paginated data
    const offset = (PageNo - 1) * PageSize;
    const orderDirection = IsAsc ? 'ASC' : 'DESC';

    const dataResult = await query(
      `SELECT * FROM ${tableName}${whereClause} ORDER BY ${OrderByField} ${orderDirection} LIMIT ? OFFSET ?`,
      [...params, PageSize, offset]
    );

    res.json({
      data: {
        List: dataResult.map((row) => ({ ...row, ID: row.id })),
        VirtualCount: totalCount
      }
    });
  } catch (error) {
    console.error('Table page error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create table record
router.post('/table/:tableId/create', async (req, res) => {
  try {
    const tableId = req.params.tableId;
    const tableName = TABLE_MAPPING[tableId];

    if (!tableName) {
      return res.status(400).json({ error: 'Invalid table ID' });
    }

    const data = { ...req.body };
    delete data.ID; // Remove ID if present
    delete data.id; // Remove id if present

    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => '?').join(', ');

    const result = await execute(
      `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    res.json({ success: true, insertId: result.insertId });
  } catch (error) {
    console.error('Table create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update table record
router.post('/table/:tableId/update', async (req, res) => {
  try {
    const tableId = req.params.tableId;
    const tableName = TABLE_MAPPING[tableId];

    if (!tableName) {
      return res.status(400).json({ error: 'Invalid table ID' });
    }

    const data = { ...req.body };
    const recordId = data.ID || data.id;

    if (!recordId) {
      return res.status(400).json({ error: 'Record ID is required' });
    }

    delete data.ID;
    delete data.id;

    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field) => `${field} = ?`).join(', ');

    const result = await execute(
      `UPDATE ${tableName} SET ${setClause} WHERE id = ?`,
      [...values, recordId]
    );

    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    console.error('Table update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete table record
router.post('/table/:tableId/delete', async (req, res) => {
  try {
    const tableId = req.params.tableId;
    const tableName = TABLE_MAPPING[tableId];

    if (!tableName) {
      return res.status(400).json({ error: 'Invalid table ID' });
    }

    const { ID } = req.body;

    if (!ID) {
      return res.status(400).json({ error: 'Record ID is required' });
    }

    const result = await execute(`DELETE FROM ${tableName} WHERE id = ?`, [ID]);

    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    console.error('Table delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// File upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileId = uuidv4();
    const filePath = req.file.path;
    const fileName = req.body.filename || req.file.originalname;

    // Store file info in database (you may want to create a files table)
    // For now, just return the file ID and path

    res.json({
      data: {
        id: fileId,
        filename: fileName,
        path: filePath,
        url: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;