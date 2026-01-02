const express = require('express');
const router = express.Router();
const multer = require('multer');
const VideoController = require('../controllers/videoController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Configure multer for video library uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB for library videos
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'), false);
        }
    }
});

// Get all library videos (Visible to all authenticated users)
router.get('/', authenticateToken, VideoController.getAllVideos);

// Upload video to library (Admin only)
router.post('/',
    authenticateToken,
    authorizeRole('admin'),
    upload.single('video'),
    VideoController.uploadVideo
);

// Delete video from library (Admin only)
router.delete('/:id',
    authenticateToken,
    authorizeRole('admin'),
    VideoController.deleteVideo
);

module.exports = router;
