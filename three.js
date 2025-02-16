import * as THREE from "three";


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const sphereGroup = new THREE.Group();
scene.add(sphereGroup);


const sphereGeometry = new THREE.IcosahedronGeometry(3, 3);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    flatShading: true,
    metalness: 0.1,
    roughness: 0.8
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphereGroup.add(sphere);


const wireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(sphereGeometry),
    new THREE.LineBasicMaterial({ color: 0x111111 })
);
sphereGroup.add(wireframe);

scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(5, 5, 5);
scene.add(light);


const logoPaths = Array(10).fill("https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png");


function fibonacciSpherePoints(numPoints, radius) {
    const points = [];
    const offset = 2 / numPoints;
    const increment = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < numPoints; i++) {
        const y = i * offset - 1 + offset / 2;
        const r = Math.sqrt(1 - y * y);
        const theta = i * increment;
        points.push(new THREE.Vector3(
            Math.cos(theta) * r * radius,
            y * radius,
            Math.sin(theta) * r * radius
        ));
    }
    return points;
}


const logoPositions = fibonacciSpherePoints(logoPaths.length, 3.2);
const clickableLogos = [];
const textureLoader = new THREE.TextureLoader();

logoPaths.forEach((path, index) => {
    textureLoader.load(path, (texture) => {
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.5, 0.5, 1);
        sprite.position.copy(logoPositions[index]);
        sphereGroup.add(sprite);
        clickableLogos.push(sprite);
    });
});


const overlay = document.getElementById("overlay");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");

function openModal(object) {
    modalContent.innerText = "Вы нажали на логотип: " + object.uuid;
    overlay.style.display = "block";
    modal.style.display = "block";
}

function closeModal() {
    overlay.style.display = "none";
    modal.style.display = "none";
}

document.querySelector("#modal .close").addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableLogos, true);
    if (intersects.length > 0) {
        openModal(intersects[0].object);
    }
});

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let velocity = { x: 0, y: 0 };
const autoRotateSpeed = 0.002;

renderer.domElement.addEventListener("mousedown", (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener("mousemove", (e) => {
    if (isDragging) {
        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };
        sphereGroup.rotation.y += deltaMove.x * 0.005;
        sphereGroup.rotation.x += deltaMove.y * 0.005;
        velocity = { x: deltaMove.x * 0.005, y: deltaMove.y * 0.005 };
        previousMousePosition = { x: e.clientX, y: e.clientY };
    }
});

renderer.domElement.addEventListener("mouseup", () => isDragging = false);
renderer.domElement.addEventListener("mouseleave", () => isDragging = false);

function animate() {
    requestAnimationFrame(animate);
    if (!isDragging) {
        sphereGroup.rotation.y += autoRotateSpeed + velocity.x;
        sphereGroup.rotation.x += velocity.y;
        velocity.x *= 0.95;
        velocity.y *= 0.95;
    }
    renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
