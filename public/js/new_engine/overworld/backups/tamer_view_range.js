// 0 - UP

var player = overworld.player._data;
var element = overworld.object_data["tamer"]._data;
var axis = "y";
var equalAxis = "x";

console.log({
    axis: player.position[axis] < element.position[axis], 
    maxview: player.position[axis] >= element.position[axis] - element.maxview,
    equalAxis: player.position[equalAxis] == element.position[equalAxis]
});
    
console.log(
    player.position[axis] < element.position[axis] &&
    player.position[axis] >= element.position[axis] - element.maxview &&
    player.position[equalAxis] == element.position[equalAxis]
);  

// ==================================================================


// 3 - LEFT

var player = overworld.player._data;
var element = overworld.object_data["tamer"]._data;
var axis = "x";
var equalAxis = "y";

console.log({
    axis: player.position[axis] < element.position[axis], 
    maxview: player.position[axis] >= element.position[axis] - element.maxview,
    equalAxis: player.position[equalAxis] == element.position[equalAxis]
});
    
console.log(
    player.position[axis] < element.position[axis] &&
    player.position[axis] >= element.position[axis] - element.maxview &&
    player.position[equalAxis] == element.position[equalAxis]
);  