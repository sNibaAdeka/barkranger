'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type SceneProps = { missionActive: boolean };

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function barkTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const context = canvas.getContext('2d')!;
  const random = seededRandom(26);
  context.fillStyle = '#473426';
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 1300; i++) {
    const x = random() * canvas.width;
    const y = random() * canvas.height;
    const length = 8 + random() * 90;
    context.strokeStyle = random() > 0.6 ? 'rgba(23, 16, 13, .45)' : 'rgba(156, 110, 65, .28)';
    context.lineWidth = 0.5 + random() * 2.8;
    context.beginPath();
    context.moveTo(x, y);
    context.bezierCurveTo(x + random() * 8 - 4, y + length * .34, x + random() * 12 - 6, y + length * .66, x + random() * 10 - 5, y + length);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.5, 2.2);
  return texture;
}

function addRobot(scene: THREE.Scene) {
  const robot = new THREE.Group();
  robot.name = 'barkranger';
  robot.position.y = .25;
  robot.rotation.y = -.55;

  const shell = new THREE.MeshStandardMaterial({ color: '#e76f2e', roughness: .31, metalness: .58 });
  const edge = new THREE.MeshStandardMaterial({ color: '#f8a23a', roughness: .26, metalness: .72 });
  const dark = new THREE.MeshStandardMaterial({ color: '#172820', roughness: .32, metalness: .62 });
  const rubber = new THREE.MeshStandardMaterial({ color: '#101914', roughness: .94, metalness: .08 });
  const glow = new THREE.MeshStandardMaterial({ color: '#d2ff43', emissive: '#a8e800', emissiveIntensity: 1.4, roughness: .25 });

  for (let i = 0; i < 3; i++) {
    const segment = new THREE.Group();
    segment.rotation.y = i * Math.PI * 2 / 3;
    const arc = new THREE.Mesh(new THREE.TorusGeometry(1.74, .145, 14, 60, Math.PI * .57), shell);
    arc.rotation.x = Math.PI / 2;
    arc.rotation.z = -Math.PI * .285;
    segment.add(arc);

    const innerRail = new THREE.Mesh(new THREE.TorusGeometry(1.57, .035, 8, 60, Math.PI * .5), edge);
    innerRail.rotation.x = Math.PI / 2;
    innerRail.rotation.z = -Math.PI * .25;
    segment.add(innerRail);

    for (const angle of [-.55, 0, .55]) {
      const pod = new THREE.Group();
      const x = Math.sin(angle) * 1.73;
      const z = Math.cos(angle) * 1.73;
      pod.position.set(x, 0, z);
      pod.rotation.y = angle;
      const clamp = new THREE.Mesh(new THREE.BoxGeometry(.28, .18, .36), dark);
      clamp.position.z = -.04;
      pod.add(clamp);
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, .17, 16), rubber);
      tire.rotation.z = Math.PI / 2;
      tire.position.z = -.23;
      pod.add(tire);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(.053, .053, .178, 16), edge);
      hub.rotation.z = Math.PI / 2;
      hub.position.z = -.23;
      pod.add(hub);
      segment.add(pod);
    }
    robot.add(segment);
  }

  const sensor = new THREE.Group();
  sensor.position.set(0, .1, 1.86);
  const body = new THREE.Mesh(new THREE.BoxGeometry(.48, .28, .26), dark);
  sensor.add(body);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, .045, 24), glow);
  lens.rotation.x = Math.PI / 2;
  lens.position.z = .15;
  sensor.add(lens);
  const hood = new THREE.Mesh(new THREE.TorusGeometry(.13, .022, 8, 18), edge);
  hood.position.z = .173;
  sensor.add(hood);
  robot.add(sensor);

  const lidar = new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, .16, 14), glow);
  lidar.position.set(-1.12, .18, 1.38);
  robot.add(lidar);
  robot.userData = { glow, sensor };
  scene.add(robot);
  return robot;
}

export default function BarkRangerScene({ missionActive }: SceneProps) {
  const host = useRef<HTMLDivElement>(null);
  const active = useRef(missionActive);
  useEffect(() => { active.current = missionActive; }, [missionActive]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#06130d', .071);
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
    camera.position.set(5.1, 3.2, 7.2);
    camera.lookAt(0, .45, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight('#a4ffd0', '#10241a', 2.1));
    const key = new THREE.DirectionalLight('#ffe0b0', 4.8);
    key.position.set(4, 6, 5);
    scene.add(key);
    const rim = new THREE.PointLight('#d6ff43', 19, 9, 2);
    rim.position.set(-3.5, 1, 1.5);
    scene.add(rim);
    const red = new THREE.PointLight('#ff6b35', 12, 5, 2);
    red.position.set(2, -1.5, 2.4);
    scene.add(red);

    const world = new THREE.Group();
    world.rotation.x = -.07;
    scene.add(world);
    const bark = barkTexture();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.27, 1.52, 11, 42, 28), new THREE.MeshStandardMaterial({ map: bark, roughness: .93, metalness: .02, bumpMap: bark, bumpScale: .18 }));
    trunk.position.y = 1.1;
    world.add(trunk);

    const random = seededRandom(8);
    const mossMaterial = new THREE.MeshStandardMaterial({ color: '#6d9a30', roughness: 1, flatShading: true });
    for (let i = 0; i < 95; i++) {
      const a = random() * Math.PI * 2;
      const y = -3.8 + random() * 8.4;
      const r = 1.32 + random() * .05;
      const cluster = new THREE.Mesh(new THREE.IcosahedronGeometry(.055 + random() * .11, 1), mossMaterial);
      cluster.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      cluster.scale.y = .52;
      world.add(cluster);
    }
    for (let i = 0; i < 32; i++) {
      const a = random() * Math.PI * 2;
      const y = -4 + random() * 9;
      const vine = new THREE.Mesh(new THREE.TorusGeometry(1.37 + random() * .08, .018, 6, 32, .4 + random() * 1), new THREE.MeshStandardMaterial({ color: '#385b27', roughness: 1 }));
      vine.rotation.x = Math.PI / 2;
      vine.rotation.z = a;
      vine.position.y = y;
      world.add(vine);
    }

    const robot = addRobot(world);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(7, 56), new THREE.MeshStandardMaterial({ color: '#0a1c13', roughness: 1, transparent: true, opacity: .88 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -4.45;
    world.add(ground);
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.12, 2.15, 64), new THREE.MeshBasicMaterial({ color: '#b9ee53', transparent: true, opacity: .3, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -4.42;
    world.add(ring);

    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(180 * 3);
    for (let i = 0; i < 180; i++) {
      const radius = 2.2 + random() * 3;
      const angle = random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = -4 + random() * 10;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    world.add(new THREE.Points(particles, new THREE.PointsMaterial({ color: '#dfffb0', size: .025, transparent: true, opacity: .55 })));

    let pointerX = 0;
    let pointerY = 0;
    let isDragging = false;
    let lastX = 0;
    let rotationTarget = -.3;
    const onPointerDown = (event: PointerEvent) => { isDragging = true; lastX = event.clientX; container.setPointerCapture?.(event.pointerId); };
    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - .5) * 2;
      pointerY = ((event.clientY - rect.top) / rect.height - .5) * 2;
      if (isDragging) { rotationTarget += (event.clientX - lastX) * .008; lastX = event.clientX; }
    };
    const onPointerUp = () => { isDragging = false; };
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointerleave', onPointerUp);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    const clock = new THREE.Clock();
    let frame = 0;
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      robot.rotation.y += active.current ? .009 : .0013;
      robot.position.y = active.current ? .2 + ((elapsed * .42) % 2.8) : .22 + Math.sin(elapsed * .9) * .025;
      (robot.userData.glow as THREE.MeshStandardMaterial).emissiveIntensity = active.current ? 1.7 + Math.sin(elapsed * 8) * .6 : 1.1;
      world.rotation.y += (rotationTarget - world.rotation.y) * .035;
      world.rotation.x += ((-.07 + pointerY * .05) - world.rotation.x) * .025;
      camera.position.x += ((5.1 + pointerX * .45) - camera.position.x) * .025;
      camera.lookAt(0, .35, 0);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointerleave', onPointerUp);
      bark.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          const material = object.material;
          (Array.isArray(material) ? material : [material]).forEach((item) => item.dispose());
        }
      });
    };
  }, []);

  return <div className="model-canvas" ref={host} role="img" aria-label="Интерактивная 3D модель робота BarkRanger вокруг дерева" />;
}
