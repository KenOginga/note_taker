const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require("util");

const app = express();
// defining our port to listen to incoming requests.
const PORT = process.env.PORT || 3500;

// define variables
const readFilesAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
let notes;

app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "./public")));

// setting up server routes to "home" and "notes" endpoints to handle request and responses.
app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.get("/notes", function(req, res){
    res.sendFile(path.join(__dirname, "./public/notes.html"));
});


app.get("/api/notes", function(req, res){
    readFilesAsync(path.join(__dirname, "./db/db.json"), "utf8")
    .then((data) => {
        return res.json(JSON.parse(data))
    });
});
// modifies db.json file by adding objects (notes) into the array.
app.post("/api/notes", function(req, res){
    var newNote = req.body;
    readFilesAsync(path.join(__dirname, "./db/db.json"), "utf8")
    .then((data) => {
        notes = JSON.parse(data);
        if(newNote.id || newNote.id === 0){
            let currentNote = notes[newNote.id];
            currentNote.title = newNote.title;
            currentNote.text = newNote.text;
        }else{
            notes.push(newNote);
        }
        writeFileAsync(path.join(__dirname, "./db/db.json"), JSON.stringify(notes))
        .then(() => {
            console.log("db.json written");
        });
    });
    res.json(newNote);
});

// module modifies db.json file by deleting the objects (notes) stored as json.
app.delete("/api/notes/:id", function (req, res){
    var id = req.params.id;
    readFilesAsync(path.join(__dirname, "./db/db.json"), "utf8")
    .then((data) => {
        notes = JSON.parse(data);
        notes.splice(id, 1);
        writeFileAsync(path.join(__dirname, "./db/db.json"), JSON.stringify(notes))
        .then(() => {
            console.log("Deleted db.json")
        });
            
    });
    res.json(id)
})

// starting our server to begin listening to client requests.
app.listen(PORT, function(){
    // log (backend) when our server has started.
    console.log("App is listening on PORT" + PORT);
});