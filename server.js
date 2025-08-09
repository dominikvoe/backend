const express = require('express');
const multer  = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/process', upload.single('track'), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `${inputPath}-processed.wav`;

  ffmpeg(inputPath)
    .audioFilters([
      `arnndn=m=rnnoise-models/sh.rnnn`,
      `highpass=f=100`,
      `anequalizer=f=5000:width_type=h:width=200:g=2`,
      `deesser`,
      `acompressor=threshold=-18dB:ratio=3:attack=5:release=200`,
      `afir=gtype=gn:ir=ir/lexicon480l_ir.wav:dry=10:wet=2`,
      `alimiter=limit=-0.1`,
      `loudnorm=I=-16:TP=-1.5:LRA=11`
    ])
    .on('end', () => {
      res.download(outputPath, 'processed.wav', () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on('error', err => {
      console.error(err);
      res.status(500).send('Processing error');
    })
    .save(outputPath);
});

app.listen(3000, () => console.log('API listening on port 3000'));
