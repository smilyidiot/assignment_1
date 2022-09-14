const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

//Initializing Database
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at localhost");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Get Players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT *
        FROM cricket_team
        ORDER BY player_id`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//Add Players API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayerQuery = `
        INSERT INTO 
        cricket_team (player_name, jersey_number, role)
        VALUES (
            ${playerName}, 
            ${jerseyNumber}, 
            ${role}
        );
        `;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//Get Player By Player Id
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * 
    FROM cricket_team
    WHERE player_id = ${playerId};`;
  const playersArray = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(playersArray));
});

//Update Players API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayersQuery = `
        UPDATE 
            cricket_team
        SET 
            player_name = ${playerName},
            jersey_number = ${jerseyNumber},
            role = ${role}
        WHERE 
            player_id = ${playerId};`;

  await db.run(updatePlayersQuery);
  response.send("Player Details Updated");
});

//Delete Players API
app.delete("players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayersQuery = `
    DELETE FROM 
        cricket_team
    WHERE 
        player_id = ${playerId};`;
  await db.get(deletePlayersQuery);
  response.send("Player Removed");
});

module.exports = app;
