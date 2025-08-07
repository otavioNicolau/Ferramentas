npm install express ytdl-core cors// Backend Node.js para download real de vídeos do YouTube
// Rode com: node server.js
const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const app = express();
app.use(cors());

app.get('/download', async (req, res) => {
  const { url, itag } = req.query;
  if (!ytdl.validateURL(url)) return res.status(400).send('URL inválida');
  let info;
  try {
    info = await ytdl.getInfo(url);
  } catch (e) {
    return res.status(500).send('Erro ao obter info do vídeo');
  }
  const format = info.formats.find(f => f.itag == itag);
  if (!format) return res.status(404).send('Formato não encontrado');
  res.header('Content-Disposition', `attachment; filename="video.${format.container || 'mp4'}"`);
  ytdl(url, { format }).pipe(res);
});

app.listen(4000, () => console.log('Servidor de download rodando na porta 4000'));
