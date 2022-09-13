const express = require("express");
const app = express();
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
app.use(express.json());

const dbpath = path.join(__dirname, "moviesData.db");
let db = null;

module.exports = app;

const initializeAbdConnectToServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running on http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeAbdConnectToServer();

app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `SELECT 
    movie_name FROM movie;`;
  const responseObject = await db.all(getMovieNamesQuery);
  const convertToResponseFormat = responseObject.map((eachMovie) => {
    return {
      movieName: eachMovie.movie_name,
    };
  });
  response.send(convertToResponseFormat);
});

// post
app.post("/movies/", async (request, response) => {
  const postQuery = `INSERT INTO 
    movie (director_id, movie_name, lead_actor)
    VALUES (
        6, "Jurassic Park", "Jeff Goldblum"
    );`;
  const dbResponse = await db.run(postQuery);
  const movie_id = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

// GET
app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getQueryMovieId = `SELECT * 
    FROM movie 
    WHERE movie_id = ${movieId};`;
  const requestedMovie = await db.get(getQueryMovieId);
  console.log(requestedMovie);
  const convertToFormat = (requestedMovie) => {
    return {
      movieId: requestedMovie.movie_id,
      directorId: requestedMovie.director_id,
      movieName: requestedMovie.movie_name,
      leadActor: requestedMovie.lead_actor,
    };
  };
  response.send(convertToFormat(requestedMovie));
});

//PUT
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;

  const updateQuery = `UPDATE
    movie 
    SET 
    director_id = 24,
    movie_name = "Thor",
    lead_actor = "Christopher Hemsworth"
    WHERE movie_id = ${movieId};`;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

// DELETE
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM 
    movie 
    WHERE movie_id = ${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

// get directors
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * 
    FROM director
    ORDER BY director_id;`;
  const directorsArray = await db.all(getDirectorsQuery);
  const convertToFormat = directorsArray.map((eachDirector) => {
    return {
      directorId: eachDirector.director_id,
      directorName: eachDirector.director_name,
    };
  });

  response.send(convertToFormat);
});

// GET specific directors
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorMovieQuery = `SELECT movie_name
    FROM movie 
    WHERE director_id = ${directorId};`;
  const moviesArray = await db.all(directorMovieQuery);
  const ResponseFormatArray = moviesArray.map((eachMovie) => {
    return {
      movieName: eachMovie.movie_name,
    };
  });
  response.send(ResponseFormatArray);
});
