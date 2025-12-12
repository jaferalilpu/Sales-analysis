import * as express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, CustomError } from '../middlewares/errorHandler';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middlewares/auth';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (_req: any, file: any, cb: any) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new CustomError('Only image files (jpeg, jpg, png, gif, webp) are allowed', 400));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter
});

/**
 * POST /api/upload/single
 * Upload single image
 */
router.post('/single',
  authenticateToken,
  requireAdmin,
  upload.single('image'),
  asyncHandler(async (req: AuthenticatedRequest, res: any) => {
    if (!req.file) {
      throw new CustomError('No image file provided', 400);
    }

    const imageUrl = `${process.env['BACKEND_URL'] || 'http://localhost:5001'}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: imageUrl
      }
    });
  })
);

/**
 * POST /api/upload/multiple
 * Upload multiple images
 */
router.post('/multiple',
  authenticateToken,
  requireAdmin,
  upload.array('images', 10), // Maximum 10 images
  asyncHandler(async (req: AuthenticatedRequest, res: any) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      throw new CustomError('No image files provided', 400);
    }

    const files = req.files as Express.Multer.File[];
    const uploadedFiles = files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: `${process.env['BACKEND_URL'] || 'http://localhost:5001'}/uploads/${file.filename}`
    }));

    res.json({
      success: true,
      message: `${files.length} images uploaded successfully`,
      data: { files: uploadedFiles }
    });
  })
);

/**
 * DELETE /api/upload/:filename
 * Delete uploaded image
 */
router.delete('/:filename',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res: any) => {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename as string);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new CustomError('File not found', 404);
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  })
);

/**
 * GET /api/upload/list
 * List uploaded images
 */
router.get('/list',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (_req: AuthenticatedRequest, res: any) => {
    // Role check is handled by requireAdmin middleware

    const files = fs.readdirSync(uploadDir);
    const imageFiles = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      })
      .map(file => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        
        return {
          filename: file,
          url: `${process.env['BACKEND_URL'] || 'http://localhost:5001'}/uploads/${file}`,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      data: { files: imageFiles }
    });
  })
);

/**
 * POST /api/upload/base64
 * Upload image from base64 string
 */
router.post('/base64',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res: any) => {
    const { imageData, filename } = req.body;

    if (!imageData) {
      throw new CustomError('No image data provided', 400);
    }

    // Validate base64 format
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
    if (!base64Regex.test(imageData)) {
      throw new CustomError('Invalid base64 image format', 400);
    }

    // Extract file extension and data
    const matches = imageData.match(/^data:image\/([a-z]+);base64,(.+)$/);
    if (!matches) {
      throw new CustomError('Invalid base64 format', 400);
    }

    const [, ext, data] = matches;
    const buffer = Buffer.from(data, 'base64');
    const uniqueFilename = `${uuidv4()}.${ext}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    // Save file
    fs.writeFileSync(filePath, buffer);

    const imageUrl = `${process.env['BACKEND_URL'] || 'http://localhost:5001'}/uploads/${uniqueFilename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: uniqueFilename,
        originalName: filename || `image.${ext}`,
        size: buffer.length,
        url: imageUrl
      }
    });
  })
);

export default router;
