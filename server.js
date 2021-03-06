const express = require("express");

const cors = require("cors");

const bodyParser = require("body-parser");

const pool = require("./Pool");

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

const videoData = require("./exampleresponse.json");

// DELETE "/{id}"
app.delete("/:id", (req, res) => {
  const { id } = req.params;

  const remainingVideos = videoData.filter(
    (video) => video.id !== parseInt(id)
  );

  const deletedVideo = videoData.find((video) => video.id == parseInt(id));

  if (remainingVideos.length == videoData.length) {
    return res.status(400).json({
      success: false,
      message:
        "It appears that nothing was deleted, make sure the selected id exists...",
    });
  }

  return res.status(200).json({
    success: true,
    remainingVideos,
    deletedVideo,
  });
});

// GET "/{id}"
app.get("/:id", (req, res) => {
  const { id } = req.params;
  const chosenVideo = videoData.filter((video) => video.id == parseInt(id));

  if (chosenVideo.length == 0) {
    return res.status(400).json({
      success: false,
      message: "It appears no video id match your search...",
    });
  }

  return res.status(200).json({
    success: true,
    chosenVideo,
  });
});

//  POST
app.post("/", (req, res) => {
  const { videoTitle, videoUrl, videoId } = req.body;

  if (!videoTitle || !videoUrl || !videoId) {
    return res.status(404).json({
      success: false,
      message: "Please provide video title and url...",
      videos: videoData,
    });
  }

  const updatedVideos = [...videoData];

  updatedVideos.push({
    id: videoId,
    title: videoTitle,
    url: videoUrl,
  });

  return res.status(200).json({
    success: true,
    addedID: updatedVideos[updatedVideos.length - 1].id,
    videos: updatedVideos,
  });
});

// GET "/"
app.get("/", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM videos");
    const results = { results: result ? result.rows : null };

    res.send(JSON.stringify(results));
    client.release();
  } catch (err) {
    console.log(err);
    res.send("Error " + err);
  }
});

app.get("/*", (req, res) => {
  res.status(400).json({
    success: false,
    msg: "Not within my API s reach...",
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}`));
