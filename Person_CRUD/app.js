// Requires:
let express = require("express");
let bodyParser = require("body-parser");
let fs = require("fs");

let Person = require("./person");

// Create express app:
let app = express();

// Use middlewares (app level - not controller level):
// this middleware takes the content of the request`s body, and parses it to json format
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


//check if "person.json" file exists
//if not - create this file and init it with an empty array
if (!fs.existsSync("person.json")) {
    fs.writeFileSync("person.json", "[]");
}

//retuen to the user the array from "person.json" file
app.get("/api/person", (req, res) => {
    let personArr = JSON.parse(fs.readFileSync("./person.json"));
    res.status(200);
    res.send(personArr);
});

//update in "person.json" file, the person with the id that the user sent in the query params
//the data of the updates is in the request`s body
app.put("/api/person", (req, res) => {

    let personArr = JSON.parse(fs.readFileSync("./person.json"));

    //pointerToPerson points to the person with the requested id
    let pointerToPerson = personArr.find(element => element._name == req.query._name);
    
    //if pointerToPerson points to an object - update the object
    //else - send an error
    if (pointerToPerson) {
        
        for (key in req.body){
            pointerToPerson[key] = req.body[key];
        }
        let newPerson = new Person.PersonClassPointer();

        try{
            for (key in pointerToPerson){
                newPerson[key] = req.body[key];
            }
            //save the updates to the file
            fs.writeFileSync("person.json", JSON.stringify(personArr));

            res.status(200);
            res.send("Person edited in the file");
        }catch(e){
            res.status(400);
            res.send(e.message);
        }
    } else {
        res.status(400);
        res.send("No such person in the file");
    }
});

//remove from "person.json" file, the person with the name that the user sent in the query params
app.delete("/api/person", (req, res) => {

    let personArr = JSON.parse(fs.readFileSync("./person.json"));
    let filterPersonArr = personArr.filter(element => element._name != req.query._name)

    //if the filtered array is shorter than the original array - we moved a person (delete success)
    //else - send an error
    if (filterPersonArr.length < personArr.length) {
        //save the updates to the file
        console.log(filterPersonArr, personArr);

        personArr = filterPersonArr;
        fs.writeFileSync("person.json", JSON.stringify(personArr));

        res.status(200);
        res.send("Deleted from the file");
    } 
    else {
        res.status(400);
        res.send("No such person in the file");
    }
});

//add to "person.json" file, a new person with the data of the request`s body
app.post("/api/person", (req, res) => {

    let personArr = JSON.parse(fs.readFileSync("./person.json"));
    let newPerson = new Person.PersonClassPointer();

    try {
        for (key in req.body) {
            console.log(key); // age
            newPerson[key] = req.body[key];
            //console.log(newPerson[key]);
        }


        let filteredNewPerson = {};

        for (key in req.body) {

            filteredNewPerson[key] = newPerson['_'+key];

        }

        console.log(filteredNewPerson);

        console.log(newPerson);

       // console.log(personArr);

        personArr.push(filteredNewPerson);
        //console.log(personArr);

        fs.writeFileSync("person.json", JSON.stringify(personArr));
        res.status(201);
        res.send("Person addedd to the file");
    } catch (e) {
        res.status(400);
        res.send(e.message);
    }
});



app.listen(4500, () => {
    console.log("server runs")
});