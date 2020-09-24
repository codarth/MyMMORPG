class GameManager{
    constructor(scene, mapData){
        this.scene = scene;
        this.mapData = mapData;

        this.spawners = {};
        this.chests = {};

        this.playerLocations = [];
        this.chestLocations = {};
        this.monsterLocations = {};
    }

    setup(){
        this.parseMapDate();
        this.setupEventListener();
        this.setupSpawner();
        this.spawnPlayer();
    }

    parseMapDate(){

    }

    setupEventListener(){
        
    }

    setupSpawner(){

    }

    spawnPlayer(){
        
    }
}