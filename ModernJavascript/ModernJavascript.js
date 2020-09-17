// var age = 23;
// var health = 0.9;
// var isAlive = true;

// isAlive = health > 0;
// let numLimbs = 4; // local const 


// var name = "tiom";
// let finalString = `${name} is ${age}`;
// name = name.padEnd(8, '.'); // tiom....

// let apiKey = '7584EA6F9ADAD228D61CAB51705CA5AC'
// let appId = '251570';


// const promise = new Promise((resolve, reject)=>{
//     let number1 = 5;
//     if(number1 ==5){
//         resolve('success');
//     }else{
//         reject('Fail');
//     }
// });

// promise.then((message)=>{
//     console.log(message);
// }).catch((message)=>{
//     console.log(message);
// })

// async function sum (num1, num2){
//     return await num1 + num2;
// }

const fetch = require('node-fetch');

let url = 'http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=221380'

class Achievement{
    constructor(name, percent){
        this.name = name;
        this.percent = Math.round(percent);
    }

    printValues(){
        if(this.percent == 0){
            console.log(`No one has completed ${this.name} achievement.`);
        }else{
            console.log(`${this.name} achievement has been completed by ${this.percent}% of people.`);
        }
    }
}

async function fetchData(url) {
    let response = await fetch(url);
    let jsonResponse = await response.json();
    //console.log(JSON.stringify(jsonResponse));
    printData(jsonResponse);
}

function printData(jsonData){
    var achievementsArray = [];
    let jsonObject = jsonData['achievementpercentages'];
    let allAchievements = jsonObject['achievements'];

    for(let achievment of allAchievements){
        let name = achievment['name'];
        let percent = achievment['percent']
        let newAchievement = new Achievement(name,percent);
        newAchievement.printValues();
        achievementsArray.push(newAchievement);
    }

    console.log(achievementsArray.length);
}

fetchData(url).catch(function(){
    console.log('Coult not fetch data');
});