const infixToFunction = {
    "+": (x, y) => x + y,
    "-": (x, y) => x - y,
    "*": (x, y) => x * y,
    "/": (x, y) => x / y
};

const infixEval = (str, regex) => str.replace(regex, (_match, arg1, operator, arg2) => infixToFunction[operator](parseFloat(arg1), parseFloat(arg2)));

const highPrecedence = str => {
    const regex = /([\d.]+)([*\/])([\d.]+)/;
    // return regex.test(str);
    const str2 = infixEval(str, regex);
    return str === str2 ? str : highPrecedence(str2);
}


const sum = (nums) => nums.reduce((acc, el) => acc + el, 0);
const isEven = (nums) => num % 2 === 0;
const average = (nums) => sum(nums) / nums.length;

const median = (nums) => {
    const sorted = nums.slice().sort((a, b) => a - b);
    const length = sorted.length;
    const middle = length / 2 - 1;
    return isEven(length) ? average([sorted[middle], sorted[middle + 1]]) : sorted[Math.ceil(middle)];
};

const spreadsheetFunctions = {
    sum,
    average,
    median,
    even: (nums) => nums.filter(isEven),
    firsttwo: nums => nums.slice(0, 2),
    lasttwo: nums => nums.slice(-2),
    has2: nums => nums.includes(2),
    increment: nums => nums.map(num => num + 1),
    someeven: nums => nums.some(nums => nums % 2 === 0),
    everyeven: nums => nums.every(nums => nums % 2 === 0),
    increment: nums => nums.map(num => num + 1),
    random: ([x, y]) => Math.floor(Math.random() * y + x),
    range: nums => range(...nums),
    // nodupes: nums => [...new Set(this.range(nums))]
    nodupes: nums => [...new Set(nums).values()],
    "": arg => arg
};

const applyFunction = str => {
    const noHigh = highPrecedence(str);
    const infix = /([\d.]+)([+-])([\d.]+)/;
    const str2 = infixEval(noHigh, infix);
    const functionCall = /([a-z0-9]*)\(([0-9., ]*)\)(?!.*\()/i;//This expression will look for function calls like sum(1, 4).
    const toNumberList = (args) => args.split(",").map(parseFloat);
    const apply = (fn, args) => spreadsheetFunctions[fn.toLowerCase()](toNumberList(args));

    return str2.replace(functionCall, (match, fn, args) => spreadsheetFunctions.hasOwnProperty(fn.toLowerCase()) ? apply(fn, args) : match);
}
// helper functions
const range = (start, end) => Array(end - start + 1).fill(start).map((element, index) => element + index);
const charRange = (start, end) => range(start.charCodeAt(0), end.charCodeAt(0)).map(code => String.fromCharCode(code));

const evalFormula = (x, cells) => {
    const idToText = (id) => cells.find(cell => cell.id === id.value);
    const rangeRegex = /([A-J])([1-9][0-9]?):([A-J])([1-9][0-9]?)/gi;
    const rangeFromString = (num1, num2) => range(parseInt(num1), parseInt(num2));
    // const elemValue = (num) => {
    //     const inner = character => {
    //         return idToText(character + num);
    //     }
    //     return inner;
    // };
    const elemValue = num => character => idToText(character + num);
    const addCharacters = character1 => character2 => num => charRange(character1, character2).map(elemValue(num));
    const rangeExpanded = x.replace(rangeRegex, (_match, char1, num1, char2, num2) => rangeFromString(num1, num2).map(addCharacters(char1)(char2)));
    const cellRegex = /[A-J][1-9][0-9]?/gi;
    const cellExpanded = rangeExpanded.replace(cellRegex, match => idToText(match.toUpperCase()));
    const functionExpanded = applyFunction(cellExpanded);

    return functionExpanded === x ? functionExpanded : evalFormula(functionExpanded, cells);

};

window.onload = () => {
    const container = document.getElementById("container");
    const createLabel = (name) => {
        const label = document.createElement("div");
        label.className = "label";
        label.textContent = name;
        container.appendChild(label);
    };

    const letters = charRange('A', 'J');
    letters.forEach(createLabel); //this'll create the labels on the top
    range(1, 99).forEach(number => {
        createLabel(number);
        letters.forEach(letter => {
            const input = document.createElement("input");
            input.type = "text";
            input.id = letter + number;
            input.ariaLabel = letter + number;
            input.onchange = update;
            container.appendChild(input);
        });
    });
};

const update = (event) => {
    const element = event.target;
    const value = element.value.replace(/\s/g, "");
    if ((!value.includes(element.id)) && (value[0] === "=")) {
        element.value = evalFormula(value.slice(1), Array.from(document.getElementById("container").children)); //cuz = is at index 0, and we wrapped it in an Array.from() because children property is returning a collection of elements, which is array-like but not an array

    }
};