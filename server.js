"use strict";
const _PORT = 3000;

const express = require("express");

const app = express();
app.use(express.json()); // for parsing json

const sqlite3 = require("sqlite3");

// Open database and create pets table if it does not exist
const db = new sqlite3.Database("./records.db");
db.run(`CREATE TABLE IF NOT EXISTS pets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  picture TEXT,
  species TEXT,
  friendly INTEGER
)`);

// SQL Commands to interact w database
const sqlRetrievePets = "SELECT * FROM pets ORDER BY id";
const sqlAddPet = `
  INSERT INTO pets (name, picture, species, friendly)
  VALUES (?, ?, ?, ?)
  RETURNING *
`;
const sqlDeletePet = "DELETE FROM pets WHERE rowid = ?";

// GET /allPets
/* Sends data for all pets
 *
 * Response - Array of pet objs:
 * {
 *  id: Number
 *  name: string
 *  picture: string
 *  species: string
 *  friendly: boolean
 * }
*/
app.get("/allPets", (req, res) => {
  db.all(sqlRetrievePets, (err, allPets) => {
    if (err) {
      console.log("Error", err);
      res.status(400).send(err);
    }
    // convert integer (sqlite) friendly value to boolean
    allPets.forEach(row => row.friendly = Boolean(row.friendly));
    res.send({pets: allPets});
  });
});

// POST /pet
/* Adds new pet
 * Request body:
 * {
 *  petName: string
 *  picture: string
 *  species: string
 *  friendly: boolean
 * }
 * 
 * Response: pet obj added (see GET /allPets)
*/
app.post("/pet", (req, res) => {
  // Extract values from body
  const petName = req.body.name;
  const picture = req.body.picture;
  const species = req.body.species;
  const friendly = req.body.friendly;

  // Add row to database
  db.get(sqlAddPet,
    petName, picture, species, Number(friendly),
    function(err, pet) {
      if (err) {
        // Error adding to database -> send back err response
        res.status(400).send(err);
      } else {
        pet.friendly = Boolean(pet.friendly);
        res.status(201).send(pet);
      }
    });
});

// DELETE /pet
// Request parameter: id (Number) of the pet to delete
app.delete("/pet/:id", (req, res) => {
  db.run(sqlDeletePet, req.params.id, function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(204).send();
    }
  });
});

app.use(express.static("public"));

app.listen(_PORT);