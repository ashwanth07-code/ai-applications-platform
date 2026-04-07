const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const logger = require('../utils/logger');

exports.transcribeAudio = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const audioPath = req.file.path;
    logger.info(`Processing audio file: ${audioPath}`);

    // Check if file exists
    if (!fs.existsSync(audioPath)) {
      return res.status(400).json({ error: 'Audio file not found' });
    }

    const pythonProcess = spawn('python3', [
      path.join(__dirname, '../../ai-models/scripts/speech_recognition.py'),
      audioPath
    ]);

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      logger.error(`Python error: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
      // Clean up uploaded file
      try {
        await fs.remove(audioPath);
      } catch (cleanupError) {
        logger.error(`Failed to clean up audio file: ${cleanupError}`);
      }

      if (code === 0) {
        try {
          const parsed = JSON.parse(result);
          logger.info(`Transcription completed: confidence=${parsed.confidence}`);
          res.json(parsed);
        } catch (parseError) {
          logger.error(`Failed to parse Python output: ${parseError}`);
          res.status(500).json({ 
            success: false,
            error: 'Invalid response from AI service'
          });
        }
      } else {
        logger.error(`Python process exited with code ${code}`);
        res.status(500).json({ 
          success: false,
          error: 'Speech recognition failed',
          details: errorOutput || 'Unknown error'
        });
      }
    });

    pythonProcess.on('error', (err) => {
      logger.error(`Failed to start Python process: ${err}`);
      res.status(500).json({ error: 'Failed to start AI service' });
    });

  } catch (error) {
    logger.error(`Speech controller error: ${error.message}`);
    next(error);
  }
};