// /backend/src/controllers/aiController.js
const axios = require("axios");

exports.sendAudioToAI = async (req, res) => {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(req.file.path));
  formData.append('source_lang', "Japanese");
  formData.append('target_lang', "Tamil");

  const result = await axios.post("http://localhost:8000/api/audio", formData, {
    headers: formData.getHeaders()
  });

  res.json(result.data);
};

exports.sendTextReply = async (req, res) => {
  const { sentence, source_lang, target_lang } = req.body;
  const result = await axios.post("http://localhost:8000/api/custom-reply", {
    sentence,
    source_lang,
    target_lang
  });
  res.json(result.data);
};
