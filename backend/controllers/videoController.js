const supabase = require('../config/database');
const { uploadToR2, deleteFromR2 } = require('../config/storage');

class VideoController {
    /**
     * Get all videos in the library
     */
    static async getAllVideos(req, res) {
        try {
            const { data: videos, error } = await supabase
                .from('videos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching video library',
                    error: error.message
                });
            }

            res.json({
                success: true,
                data: videos,
                count: videos.length
            });
        } catch (error) {
            console.error('Get videos error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }

    /**
     * Upload video to library (Admin only)
     */
    static async uploadVideo(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No video file provided'
                });
            }

            const storageKey = `library/videos/${Date.now()}-${req.file.originalname}`;
            const videoUrl = await uploadToR2(
                req.file.buffer,
                storageKey,
                req.file.mimetype
            );

            const videoData = {
                title: req.body.title || req.file.originalname,
                url: videoUrl,
                storage_key: storageKey,
                size: req.file.size,
                mime_type: req.file.mimetype,
                created_by: req.user.id
            };

            const { data: video, error } = await supabase
                .from('videos')
                .insert(videoData)
                .select()
                .single();

            if (error) {
                // Try to delete from R2 if database insert fails
                try {
                    await deleteFromR2(storageKey);
                } catch (r2Error) {
                    console.error('Error cleaning up R2 after DB failure:', r2Error);
                }

                return res.status(500).json({
                    success: false,
                    message: 'Error saving video info to database',
                    error: error.message
                });
            }

            res.status(201).json({
                success: true,
                message: 'Video uploaded successfully to library',
                data: video
            });
        } catch (error) {
            console.error('Upload video error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }

    /**
     * Delete video from library (Admin only)
     */
    static async deleteVideo(req, res) {
        try {
            const { data: video, error: fetchError } = await supabase
                .from('videos')
                .select('storage_key')
                .eq('id', req.params.id)
                .single();

            if (fetchError || !video) {
                return res.status(404).json({
                    success: false,
                    message: 'Video not found'
                });
            }

            // Delete from R2
            if (video.storage_key) {
                await deleteFromR2(video.storage_key);
            }

            // Delete from database
            const { error: deleteError } = await supabase
                .from('videos')
                .delete()
                .eq('id', req.params.id);

            if (deleteError) {
                return res.status(500).json({
                    success: false,
                    message: 'Error deleting video from database',
                    error: deleteError.message
                });
            }

            res.json({
                success: true,
                message: 'Video deleted successfully from library'
            });
        } catch (error) {
            console.error('Delete video error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
}

module.exports = VideoController;
