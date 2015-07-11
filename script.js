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
const ENV = 'dev';
var cubeLimit;
var gui;
//Lights
var light;
var shadowLight;
var backLight;

//Constants
var HEIGHT;
var WIDTH;

//Global
var character;
const BEVEL = 10;
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
function animate() {
    requestAnimationFrame(animate);
    controls.update();
}
function render() {
    renderer.render(scene, camera);
}
var Character = function () {
    this.model = new THREE.Group();
    this.redMat = new THREE.MeshLambertMaterial({
        color: 0xad3525,
        shading: THREE.FlatShading
    });
    var radiusOfTopCircle = 20;
    var radiusOfBottomCircle = 25;
    var heightOfCylinder = 80;
    var bodyGeom = new THREE.CylinderGeometry(radiusOfTopCircle, radiusOfBottomCircle, heightOfCylinder, BEVEL);
    this.body = new THREE.Mesh(bodyGeom, this.redMat);
    this.body.translateY(200);
    this.body.rotateZ(-Math.PI / 2);
    this.model.add(this.body);

    var radiusOfTopCircle = 20;
    var radiusOfBottomCircle = 25;
    var heightOfCylinder = 50;
    var headGeom = new THREE.CylinderGeometry(radiusOfTopCircle, radiusOfBottomCircle, heightOfCylinder, BEVEL);
    this.head = new THREE.Mesh(headGeom, this.redMat);
    this.head.translateY(200);
    this.head.translateX(40);
    this.head.translateY(10);
    this.head.rotateZ(-Math.PI / 4);
    this.model.add(this.head);

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
function generateHexa() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}
function generateShapes() {
    var iNumberOfShape = 100;
    var shapes = new THREE.Group();
    var shapeSize = 10;
    for (var i = 0; i < iNumberOfShape; i++) {
        var shapeGeom = new THREE.BoxGeometry(shapeSize, shapeSize, shapeSize);
        var shape = new THREE.Mesh(shapeGeom, new THREE.MeshLambertMaterial({
            color: generateHexa()
        }));
        var pX = getRandomInt((floorX / 2), (-floorX / 2));
        var pY = getRandomInt(floorY, shapeSize / 2);
        var pZ = getRandomInt((floorZ / 2), (-floorZ / 2));
        shape.position.set(pX, pY, pZ);
        var rX = getRandomInt(Math.PI * 2, 0);
        var rY = getRandomInt(Math.PI * 2, 0);
        var rZ = getRandomInt(Math.PI * 2, 0);
        shape.rotation.set(rX, rY, rZ);


        if (isDev()) {
            var outline = new THREE.Mesh(shapeGeom, new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                side: THREE.BackSide
            }));
            outline.position.set(pX, pY, pZ);
            outline.rotation.set(rX, rY, rZ);
            outline.scale.multiplyScalar(1.15);
            shapes.add(outline);
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
    render();
    if (isDev()) {
        gui();
    }
}
init();
animate();
