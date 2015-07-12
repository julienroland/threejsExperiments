//Config
var container = document.getElementById('scene');
var scene;
var camera;
var fieldOfView;
var aspectRatio;
var renderer;
var floor;
var floorX = 1000;
var floorY = 1000;
var floorZ = 1000;
var nearPlane;
var farPlane;
var controls;
var cubeLimit;
var gui;
//Lights
var light;
var shadowLight;
var backLight;

//Constants
const ENV = 'dev';
var HEIGHT;
var WIDTH;

//Global
var character;
var baseTime = 0.005;
var time = baseTime;
var timeIncrement = 0.005;
function appendScene() {
    container.appendChild(renderer.domElement);
}
function addLights() {
    light = new THREE.HemisphereLight(0xffffff, 0xffffff, .5)

    shadowLight = new THREE.DirectionalLight(0xffffff, .8);
    shadowLight.position.set(200, 200, 200);
    shadowLight.castShadow = true;
    shadowLight.shadowDarkness = .2;

    //backLight = new THREE.DirectionalLight(0xffffff, .4);
    //backLight.position.set(-100, 200, 50);
    //backLight.shadowDarkness = .1;
    //backLight.castShadow = true;

    //scene.add(backLight);
    scene.add(shadowLight);
    scene.add(light);
}
function isDev() {
    return ENV == 'dev';
}
function addFloor() {
    floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(floorX, floorY), new THREE.MeshBasicMaterial({color: 0xebe5e7}));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);
    if (isDev()) {
        var cubeLimitGeom = new THREE.BoxGeometry(floorX, floorY, floorZ, 2, 2, 2);
        cubeLimit = new THREE.Mesh(cubeLimitGeom, new THREE.MeshLambertMaterial({
            color: 0xad3525,
            shading: THREE.FlatShading,
            wireframe: true
        }));
        cubeLimit.translateY(500);
        scene.add(cubeLimit);
    }
}
function addCamera() {
    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane);
    camera.position.z = 500;
    camera.position.y = 300;
    camera.lookAt(new THREE.Vector3(0, 200, 0));
}
function addControls() {
    controls = new THREE.TrackballControls(camera);
    controls.target.set(0, 0, 0);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    controls.keys = [65, 83, 68];
    controls.addEventListener('change', render);
}
function configureScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x050505, 2000, 4000);
    //scene.fog.color.setHSV(0.102, 0.9, 0.825);

    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane = 100;
    farPlane = 20000;
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMapEnabled = true;
    addCamera();
    if (isDev()) {
        addControls();
    }
    addLights();
    addFloor();


}
function resetTime() {
    time = baseTime;
}
function animate() {
    character.absorbe.run(time);
    //character.reject.run(time);
    if (character.absorbe.isDone()) {
        character.reject.run(time);
    }
    //time += timeIncrement;
    render();
    requestAnimationFrame(animate);
    controls.update();
}
function render() {
    renderer.render(scene, camera);
}
var Character = function () {
    var _this = this;
    this.model = new THREE.Group();
    this.redMat = new THREE.MeshLambertMaterial({
        color: 0xad3525,
        shading: THREE.FlatShading
    });
    var sizeH = 60;
    var sizeW = 50;
    var bodyGeom = new THREE.BoxGeometry(sizeH, sizeW, sizeW);
    this.body = new THREE.Mesh(bodyGeom, this.redMat);
    this.body.translateY(200);
    this.body.rotateZ(-Math.PI / 2);

    this.absorbe = {
        maxY: 0.7,
        maxX: 1.5,
        done: {
            x: false,
            y: false
        },
        run: function (time) {
            var acceleration = (time * 1.2);
            if (_this.body.scale.y > this.maxY && !this.done.y) {
                _this.body.scale.y -= acceleration;
            } else {
                this.done.y = true;
            }
            if (_this.body.scale.x < this.maxX && !this.done.x) {
                _this.body.scale.x += (acceleration * 1.5);
            }
            else {
                this.done.x = true;
            }
        },
        isDone: function () {
            return Boolean(this.done.x && this.done.y);
        }
    };
    this.reject = {
        maxY: 2,
        maxX: 2,
        done: {
            x: false,
            y: false
        },
        run: function (time) {
            var acceleration = (time * 5.2);
            if (_this.body.scale.y < this.maxY && !this.done.y) {
                _this.body.scale.y += acceleration;
            } else {
                this.done.y = true;
            }
            if (_this.body.scale.x < this.maxX && _this.body.scale.y > this.maxY / 0.5 && !this.done.x) {
                _this.body.scale.x += acceleration;
            } else {
                this.done.x = true;
            }
        },
        isDone: function () {
            return Boolean(this.done.x && this.done.y);
        }
    };


    this.model.add(this.body);

    this.model.traverse(function (obj) {
        if (obj instanceof THREE.Mesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

}
function addMainCharacter() {
    character = new Character();
    scene.add(character.model);
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function generateColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random() * 15)];
    }
    var rgb = hexToRgb(color);
    return new THREE.Color("rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")");
}
function randomizePosition(shape, shapeSize) {
    var pX = getRandomInt((floorX / 2), (-floorX / 2));
    var pY = getRandomInt(floorY, shapeSize / 2);
    var pZ = getRandomInt((floorZ / 2), (-floorZ / 2));
    shape.position.set(pX, pY, pZ);
    var rX = getRandomInt(Math.PI * 2, 0);
    var rY = getRandomInt(Math.PI * 2, 0);
    var rZ = getRandomInt(Math.PI * 2, 0);
    shape.rotation.set(rX, rY, rZ);
    return shape;
}
function generateCube() {
    var shapeSize = getRandomInt(10, 20);
    var shapeGeom = new THREE.BoxGeometry(shapeSize, shapeSize, shapeSize);
    var shape = new THREE.Mesh(shapeGeom, new THREE.MeshLambertMaterial({
        color: generateColor()
    }));
    shape = randomizePosition(shape, shapeSize);
    return shape;
}

function generateOctahedron() {
    var shapeSize = getRandomInt(10, 20);
    var shapeGeom = new THREE.OctahedronGeometry(shapeSize);
    var shape = new THREE.Mesh(shapeGeom, new THREE.MeshLambertMaterial({
        color: generateColor()
    }));
    shape = randomizePosition(shape, shapeSize);
    return shape;
}
function generateShapes() {
    var iNumberOfShape = 100;
    var shapes = new THREE.Group();
    for (var i = 0; i < iNumberOfShape; i++) {
        var iRandom = Math.random();
        if (iRandom < 0.5) {
            var shape = generateCube();
        } else if (iRandom >= 0.5) {
            var shape = generateOctahedron();
        }

        shapes.add(shape);

    }
    shapes.traverse(function (obj) {
        if (obj instanceof THREE.Mesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });
    scene.add(shapes);
}
function gui() {
    gui = new dat.GUI();
    var params = {
        test: 1000
    };
    gui.add(params, 'test');
}
function init() {
    configureScene();
    appendScene();
    addMainCharacter();
    generateShapes();
    if (isDev()) {
        gui();
    }
    animate();
}
init();
