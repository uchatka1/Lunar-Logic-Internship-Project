// A vanilla JS version of the task solution. The main function - randomize(), when provided an array of guest names, number of places per table, number of tables, and number of switches, produces a nice output wiht guest assigned to tables for each switch (here called "course").

// A function for initial randomization of the seating list. It uses the Durstenfeld shuffle - an optimized, efficient version of the Fisher-Yates shuffle.
// Reference 1 (with nice visualizations): https://bost.ocks.org/mike/shuffle/
// Reference 2: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array?newreg=af0a6d8c22fb4181ba2238bd7cebee16
var shuffle = (array) => {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Creates an array with a given number of empty sub-arrays. Used for creating arrays for each seating order (course) and arrays for "jumping blocks". 1st array is given (either an initial seating list or an empty array), others are created in the specified number.
var arrayCreator = (array, numSubArrays) => {
  var emptyArr = [];
  emptyArr[0] = array;
  for (var i = 0; i < numSubArrays; i++) {
    emptyArr.push([]);
  }
  return emptyArr;
};

// Adds placeholder seats ("empty chairs") for each "course array" in the number equal to the number of guests.
var chairAdder = (emptyTables, numGuests) => {
  for (var i = 0; i < numGuests; i++) {
    emptyTables.push("empty chair");
  }
};

// Used to iterate over chairAdder as many times as there are courses (tables.length is the number of courses, but since the first seating list is already prepared, it needs to iterate one time less).
var courseIterator = (tables, numGuests) => {
  for (var i = 1; i <= tables.length - 1; i++) {
    var workingArray = tables[i];
    chairAdder(workingArray, numGuests);
  }
  return tables;
};

// Creates an array of arrays. Each sub-array contains indexes of guests which will move the same number of places.
var jumpCreator = (numPlacesPerTable, numTables) => {
  var maxCapacity = numPlacesPerTable * numTables;
  var places = [];
  var arrPlaces = arrayCreator(places, numTables);

  for (var i = 0; i < numPlacesPerTable; i++) {
    for (var j = i; j < maxCapacity; j = j + numPlacesPerTable) {
      places.push(j);
    }
  }
  for (var k = 0; k < numPlacesPerTable; k++) {
    arrPlaces[k] = places.splice(k, numTables, k + numTables);
  }
  return arrPlaces;
};


// Function for switching places after initial randomization. The logic behind it: in each table there is a set of places: T1_1, T1_2, T1_3, T1_4, T1_5, T1_6 etc. From every position on a table they have to switch down the line, and they have to switch different numbers of "full tables". So, in the example task (30 guests, 6 places per table, 5 tables): people from places with indexes in [0, 6, 12, 18, 24] will not move, [1, 7, 13, 19, 25] will move one table (6 places), [2, 8, 14, 20, 26] will move two tables (12 places), [3, 9, 15, 21, 27] - three tables (18 places), [4, 10, 16, 22, 28] - four tables (24 places), and [5, 11, 17, 23, 29] - five tables (30 places), so they will return to their initial seats.
var placeSwitcher = (places, numGuests, numSwitches, numPlacesPerTable, numTables) => {
  // Creates sub-arrays with clusters of indexes which will move the same number of places.
  var arrPlaces = jumpCreator(numPlacesPerTable, numTables);

  // The loop will work as many times as many switches were specified.
  for (var i = 0; i < numSwitches; i++) {
    // takeFrom array - guest list from the previous course/previous switch. putInto array - the array we are mixing the guests during the present loop
    var takeFrom = places[i];
    var putInto = places[i + 1];
    // This loop will iterate as many times as there are places per table (and sub-arrays with clusters of indexes).
    for (var j = 0; j < numPlacesPerTable; j++) {
      var currentArr = arrPlaces[j];
      var adder = j*numPlacesPerTable;
      // Chooses a subset of guests which will move the same number of places
      var workingArray = currentArr.map(k=>takeFrom[k]);
      for (person of workingArray) {
        var iPerson = takeFrom.indexOf(person);
        if (currentArr.includes(iPerson) === true) {
          // Makes sure that the new index is not out of range.
          if (iPerson+adder > takeFrom.length-1) {
            var newIPerson = iPerson - numGuests;
            putInto.splice(newIPerson+adder,1,person);
          } else {
            putInto.splice(iPerson+adder,1,person);
          }
        }
      }
    }
    // Creates an output with the seating list.
    var answer = `For the course no ${i+2}: \n`;
    var tableNo = 1;
    var slicer = Math.floor(putInto.length/numTables);
    var init = 0;
    for (var s = 0; s <= putInto.length-1; s = s+numPlacesPerTable) {
      var currentTable = putInto.slice(init+s,s+numPlacesPerTable);
      answer = answer.concat(`Table ${tableNo}: ${currentTable.toString()}. \n`);
      tableNo = tableNo + 1;
    }
    console.log(answer);
  }
};


// Randomize function which will do the put all the pieces together: randomize the seating list and shuffle it a given number of times, creating a individual seating lists for each course/switch.
function randomize(employeesList, numPlacesPerTable, numTables, numSwitches) {
  // 1st step - set some initial variables.
  var numGuests = employeesList.length;
  var employeesArrays = arrayCreator(employeesList, numSwitches);
  var employees = courseIterator(employeesArrays, numGuests);

  // 2nd step - randomize the guest list and give output.
  var mixed = shuffle(employees[0]);

  var courseOne = `For the course no 1: \n`;
  var tableNo = 1;
  var init = 0;
  for (var s = 0; s <= mixed.length-1; s = s+numPlacesPerTable) {
    var currentTable = mixed.slice(init+s,s+numPlacesPerTable);
    courseOne = courseOne.concat(`Table ${tableNo}: ${currentTable.toString()}. \n`);
    tableNo = tableNo + 1;
  }
  console.log(courseOne);

  employees[0] = mixed;

  // 3rd step - do the switches.
  placeSwitcher(employees, numGuests, numSwitches, numPlacesPerTable, numTables);
};

// For the main task - create an array of employee names.
var lumarEmployees = [
  "Anna Sar",
  "Mark Nila",
  "Tom Menulis",
  "John Oy",
  "Sylvie Bulan",
  "Loki Qamar",
  "Carol Hene",
  "Luke Dayaxa",
  "Cleopatra Hold",
  "Julius Luno",
  "Alexander Inyanga",
  "Peter Ghealach",
  "Ursula Mahina",
  "Phoebe Moon",
  "Rachel Luna",
  "Joey Tungl",
  "Monica Candrudu",
  "Chandler Kuu",
  "Ross Tsuki",
  "Bilbo Marama",
  "Gandalf Mane",
  "Robert Mesic",
  "Arwen Hev",
  "Michael Candrama",
  "Emily Meness",
  "Patricia Fengari",
  "Joanne Mond",
  "Joy Dal",
  "Cathy Lusin",
  "Siobhan Mwezi"
];

// The main task.
var lunarLogicRandomize = randomize(lumarEmployees, 6, 5, 2);
console.log(lunarLogicRandomize);

// Proves that the code works on different parameters as well.
var newEmployees = [
  "Anna Anderson",
  "Betty Ball",
  "Cindy Crawfish",
  "Dorothy Doe",
  "Emily Elephant",
  "Frank Flawless",
  "Greta Good",
  "Henry Hilarious",
  "Irma Ivy",
  "Joanna Jackpot",
  "Kathy Kawasaki",
  "Leon Lucky"
];

var newEmployeesRandomize = randomize(newEmployees, 3, 4, 3);
console.log(newEmployeesRandomize);