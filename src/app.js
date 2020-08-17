const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

const fetchRepository = (request, response, next) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(
    (repoItem) => repoItem.id === id
  );

  if (repositoryIndex === -1) {
    response.status(400).json({
      msg: "Repository didn't find :(",
    });
  }

  request._repositoryIndex = repositoryIndex;

  return next();
};

app.use("/repositories/:id", (request, response, next) => {
  const { id } = request.params;

  if (!isUuid(id)) {
    response.status(400).json({
      msg: "Invalid ID",
    });
  }

  return next();
});

app.get("/repositories", (request, response) => {
  response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const newObject = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(newObject);
  response.status(201).json(newObject);
});

app.put("/repositories/:id", fetchRepository, (request, response) => {
  const { title, url, techs } = request.body;
  const { id } = request.params;

  const updatedObject = {
    id,
    title,
    url,
    techs,
    likes: repositories[request._repositoryIndex].likes,
  };

  repositories[request._repositoryIndex] = updatedObject;

  response.status(200).json(updatedObject);
});

app.delete("/repositories/:id", fetchRepository, (request, response) => {
  repositories.splice(request._repositoryIndex, 1);

  response.status(204).send();
});

app.post("/repositories/:id/like", fetchRepository, (request, response) => {
  repositories[request._repositoryIndex].likes++;
  response.status(200).send({
    likes: repositories[request._repositoryIndex].likes,
  });
});

module.exports = app;
